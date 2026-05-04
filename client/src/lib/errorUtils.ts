/**
 * Parses blockchain / Web3 transaction errors into short, user-facing messages.
 */

export interface ParsedError {
  message: string
  type: 'permission' | 'validation' | 'network' | 'unknown'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

/** Solidity `Error(string)` — first 4 bytes of keccak256("Error(string)") */
const ERROR_STRING_SELECTOR = '08c379a0'

/**
 * Decodes ABI revert data for `revert("reason")` / `require(..., "reason")`.
 * Wallets often omit the reason in `message` but include this hex under `data` / `cause`.
 */
function decodeSolidityErrorString(data: string): string | null {
  const trimmed = data.trim()
  const normalized = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`
  const hex = normalized.slice(2).toLowerCase()
  if (hex.length < 8 + 128 || hex.slice(0, 8) !== ERROR_STRING_SELECTOR) {
    return null
  }

  const payload = hex.slice(8)
  const offsetBytes = parseInt(payload.slice(0, 64), 16)
  if (!Number.isFinite(offsetBytes) || offsetBytes < 0 || offsetBytes * 2 + 64 > payload.length) {
    return null
  }

  const dataStart = offsetBytes * 2
  const strLen = parseInt(payload.slice(dataStart, dataStart + 64), 16)
  if (!Number.isFinite(strLen) || strLen < 0 || strLen > 65_536) {
    return null
  }

  const strEnd = dataStart + 64 + strLen * 2
  if (strEnd > payload.length) {
    return null
  }

  const strHex = payload.slice(dataStart + 64, strEnd)
  const bytes = new Uint8Array(strLen)
  for (let i = 0; i < strLen; i++) {
    bytes[i] = parseInt(strHex.slice(i * 2, i * 2 + 2), 16)
  }

  return new TextDecoder('utf8', { fatal: false }).decode(bytes)
}

function collectStringLeaves(value: unknown, out: Set<string>, depth: number): void {
  if (depth > 14) {
    return
  }
  if (typeof value === 'string') {
    if (value.length > 0 && value.length < 400_000) {
      out.add(value)
    }
    return
  }
  if (typeof value === 'bigint') {
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringLeaves(item, out, depth + 1)
    }
    return
  }
  if (value instanceof Error) {
    collectStringLeaves(value.message, out, depth + 1)
    collectStringLeaves((value as Error & { cause?: unknown }).cause, out, depth + 1)
    return
  }
  if (!isRecord(value)) {
    return
  }
  for (const key of Object.keys(value)) {
    collectStringLeaves(value[key], out, depth + 1)
  }
}

function tryDecodeRevertReasonFromValue(err: unknown): string | null {
  const collected = new Set<string>()
  collectStringLeaves(err, collected, 0)

  for (const s of collected) {
    const direct = decodeSolidityErrorString(s)
    if (direct) {
      return direct
    }
    const lower = s.toLowerCase()
    const marker = '0x08c379a0'
    let from = lower.indexOf(marker)
    while (from !== -1) {
      let end = from + marker.length
      while (end < s.length && /[0-9a-f]/i.test(s[end])) {
        end += 1
      }
      const slice = s.slice(from, end)
      const decoded = decodeSolidityErrorString(slice)
      if (decoded) {
        return decoded
      }
      from = lower.indexOf(marker, from + 4)
    }
  }
  return null
}

/**
 * Extracts a best-effort message string from thrown values (Error, Web3, nested shapes).
 */
const extractErrorMessage = (err: unknown): string => {
  const decoded = tryDecodeRevertReasonFromValue(err)
  if (decoded) {
    return decoded
  }

  if (typeof err === 'string') {
    return err
  }

  if (err instanceof Error) {
    return err.message
  }

  if (!isRecord(err)) {
    return 'An unexpected error occurred'
  }

  const direct = readString(err.message)
  if (direct) {
    return direct
  }

  const nestedError = err.error
  if (isRecord(nestedError)) {
    const nestedMsg = readString(nestedError.message)
    if (nestedMsg) {
      return nestedMsg
    }
  }

  const data = err.data
  if (isRecord(data)) {
    const dataMsg = readString(data.message)
    if (dataMsg) {
      return dataMsg
    }
  }

  const reason = readString(err.reason)
  if (reason) {
    return reason
  }

  try {
    const stringified = JSON.stringify(err)
    if (stringified !== '{}') {
      const again = readString(err.message)
      if (again) {
        return again
      }
      if (err.error !== undefined) {
        return String(err.error)
      }
    }
  } catch {
    // ignore
  }

  return 'An unexpected error occurred'
}

/**
 * Maps low-level revert / provider text to friendly copy for the UI.
 */
export const parseTransactionError = (err: unknown): ParsedError => {
  const rawMessage = extractErrorMessage(err)
  const lowerMessage = rawMessage.toLowerCase()

  // Wrong actor / not registered for this role (current contract wording + legacy aliases)
  if (
    lowerMessage.includes('not supplier') ||
    lowerMessage.includes('not producer') ||
    lowerMessage.includes('not distributor') ||
    lowerMessage.includes('not seller') ||
    lowerMessage.includes('findrms') ||
    lowerMessage.includes('findman') ||
    lowerMessage.includes('finddis') ||
    lowerMessage.includes('findret') ||
    lowerMessage.includes('findsupplier') ||
    lowerMessage.includes('findproducer') ||
    lowerMessage.includes('not registered') ||
    lowerMessage.includes('not found') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('access denied')
  ) {
    return {
      message:
        'This wallet is not registered for the role required for this step. Register the correct role, then use the matching account.',
      type: 'permission',
    }
  }

  if (lowerMessage.includes('wrong seller')) {
    return {
      message: 'This action must be performed by the same seller who listed the product.',
      type: 'permission',
    }
  }

  if (
    lowerMessage.includes('only owner') ||
    lowerMessage.includes('caller is not owner') ||
    (lowerMessage.includes('owner') && lowerMessage.includes('only'))
  ) {
    return {
      message:
        'The on-chain contract rejected this as “owner only.” If you recently changed who may add products, redeploy SupplyChain, copy the new address into client/src/deployments.json (and public copy if you use it), then try again. Otherwise connect the deployer wallet.',
      type: 'permission',
    }
  }

  if (lowerMessage.includes('all roles required') || lowerMessage.includes('no products')) {
    return {
      message:
        lowerMessage.includes('no products')
          ? 'There are no products on this contract yet. Add a product first, then try again.'
          : 'Register at least one supplier, producer, distributor, and seller before adding a product.',
      type: 'validation',
    }
  }

  if (
    lowerMessage.includes('wrong stage') ||
    lowerMessage.includes('invalid stage') ||
    (lowerMessage.includes('stage') && lowerMessage.includes('wrong'))
  ) {
    return {
      message:
        'This step does not match the current stage for this product. Advance the chain in order, or use another product ID.',
      type: 'validation',
    }
  }

  if (
    lowerMessage.includes('invalid product') ||
    lowerMessage.includes('invalid product id') ||
    lowerMessage.includes('productid') ||
    lowerMessage.includes('_productid') ||
    lowerMessage.includes('product not found') ||
    lowerMessage.includes('medicineid') ||
    lowerMessage.includes('_medicineid') ||
    lowerMessage.includes('invalid medicine') ||
    lowerMessage.includes('medicine not found')
  ) {
    return {
      message: 'Invalid or unknown product ID. Check the ID on chain and try again.',
      type: 'validation',
    }
  }

  if (
    lowerMessage.includes('supplierctr') ||
    lowerMessage.includes('producerctr') ||
    lowerMessage.includes('distributorctr') ||
    lowerMessage.includes('sellerctr') ||
    lowerMessage.includes('rmsctr') ||
    lowerMessage.includes('manctr') ||
    lowerMessage.includes('disctr') ||
    lowerMessage.includes('retctr') ||
    lowerMessage.includes('role count')
  ) {
    return {
      message: 'Register at least one supplier, producer, distributor, and seller before performing this action.',
      type: 'validation',
    }
  }

  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('chain') ||
    lowerMessage.includes('metamask') ||
    lowerMessage.includes('provider') ||
    lowerMessage.includes('connection')
  ) {
    return {
      message: 'Network or wallet connection issue. Check your wallet and RPC, then try again.',
      type: 'network',
    }
  }

  if (lowerMessage.includes('revert') || lowerMessage.includes('require')) {
    const revertMatch = rawMessage.match(/revert\s+(.+)/i)
    if (revertMatch?.[1]) {
      const revertReason = revertMatch[1].trim()
      return {
        message: `Transaction failed: ${revertReason}`,
        type: 'validation',
      }
    }
    return {
      message: 'The transaction was reverted. Check inputs, role, and stage, then try again.',
      type: 'validation',
    }
  }

  if (
    lowerMessage.includes('user rejected') ||
    lowerMessage.includes('user denied') ||
    lowerMessage.includes('rejected by user') ||
    lowerMessage.includes('user cancelled') ||
    lowerMessage.includes('user canceled')
  ) {
    return {
      message: 'You cancelled the request in your wallet.',
      type: 'unknown',
    }
  }

  if (
    lowerMessage.includes('insufficient funds') ||
    lowerMessage.includes('insufficient balance') ||
    lowerMessage.includes('insufficient gas') ||
    lowerMessage.includes('out of gas') ||
    lowerMessage.includes('intrinsic gas too low') ||
    lowerMessage.includes('gas required exceeds') ||
    lowerMessage.includes('max fee per gas') ||
    lowerMessage.includes('max priority fee') ||
    lowerMessage.includes('underpriced') ||
    lowerMessage.includes('oversized data')
  ) {
    return {
      message: 'Insufficient balance for gas or value, or the fee cap is too low. Add funds or adjust fees and retry.',
      type: 'validation',
    }
  }

  if (
    lowerMessage.includes('contract not found') ||
    lowerMessage.includes('not deployed') ||
    lowerMessage.includes('deployment')
  ) {
    return {
      message:
        'The app could not talk to the contract on this network. Deploy it here or switch to the network where it is deployed.',
      type: 'network',
    }
  }

  let cleanedMessage = rawMessage
    .replace(/^error:\s*/i, '')
    .replace(/^execution reverted:\s*/i, '')
    .replace(/^revert\s+/i, '')
    .trim()

  if (cleanedMessage.length > 200 || cleanedMessage.includes('{') || cleanedMessage.includes('[')) {
    cleanedMessage =
      'Something went wrong. If it keeps happening, try again or check the contract and network settings.'
  }

  return {
    message: cleanedMessage,
    type: 'unknown',
  }
}
