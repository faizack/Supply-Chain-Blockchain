/**
 * Comprehensive error parsing utility for blockchain transaction errors
 * Handles various error formats and returns user-friendly messages
 */

export interface ParsedError {
  message: string
  type: 'permission' | 'validation' | 'network' | 'unknown'
}

/**
 * Extracts error message from various error object structures
 */
const extractErrorMessage = (err: any): string => {
  // Handle string errors
  if (typeof err === 'string') {
    return err
  }

  // Handle Error objects
  if (err instanceof Error) {
    return err.message
  }

  // Handle Web3/ethers error structures
  if (err?.message) {
    return err.message
  }

  // Handle nested error structures (common in Web3)
  if (err?.error?.message) {
    return err.error.message
  }

  // Handle error with data field
  if (err?.data?.message) {
    return err.data.message
  }

  // Handle error with reason field
  if (err?.reason) {
    return err.reason
  }

  // Handle JSON stringified errors
  if (typeof err === 'object' && err !== null) {
    try {
      const stringified = JSON.stringify(err)
      if (stringified !== '{}') {
        // Try to extract meaningful message from JSON
        if (err.message) return err.message
        if (err.error) return String(err.error)
      }
    } catch {
      // Ignore JSON stringify errors
    }
  }

  return 'An unexpected error occurred'
}

/**
 * Parses blockchain transaction errors and returns user-friendly messages
 */
export const parseTransactionError = (err: any): ParsedError => {
  const rawMessage = extractErrorMessage(err)
  const lowerMessage = rawMessage.toLowerCase()

  // Permission/Registration errors
  if (
    lowerMessage.includes('findrms') ||
    lowerMessage.includes('findman') ||
    lowerMessage.includes('finddis') ||
    lowerMessage.includes('findret') ||
    lowerMessage.includes('not registered') ||
    lowerMessage.includes('not found') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('access denied')
  ) {
    return {
      message: 'Your account is not registered for this role. Please register your account first in the Roles page.',
      type: 'permission',
    }
  }

  // Owner permission errors
  if (
    lowerMessage.includes('owner') ||
    lowerMessage.includes('only owner') ||
    lowerMessage.includes('caller is not owner')
  ) {
    return {
      message: 'Only the contract owner can perform this action. Make sure you are using the account that deployed the contract.',
      type: 'permission',
    }
  }

  // Stage/State validation errors
  if (
    lowerMessage.includes('stage') ||
    lowerMessage.includes('invalid stage') ||
    lowerMessage.includes('wrong stage') ||
    lowerMessage.includes('stage transition')
  ) {
    return {
      message: 'Invalid stage transition. Make sure the medicine is in the correct stage for this operation.',
      type: 'validation',
    }
  }

  // Medicine ID validation errors
  if (
    lowerMessage.includes('medicineid') ||
    lowerMessage.includes('_medicineid') ||
    lowerMessage.includes('invalid medicine') ||
    lowerMessage.includes('medicine not found')
  ) {
    return {
      message: 'Invalid medicine ID. Please check the medicine ID and try again.',
      type: 'validation',
    }
  }

  // Role count validation errors
  if (
    lowerMessage.includes('rmsctr') ||
    lowerMessage.includes('manctr') ||
    lowerMessage.includes('disctr') ||
    lowerMessage.includes('retctr') ||
    lowerMessage.includes('role count')
  ) {
    return {
      message: 'Please register at least one role of each type (RMS, Manufacturer, Distributor, Retailer) before performing this action.',
      type: 'validation',
    }
  }

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('chain') ||
    lowerMessage.includes('metamask') ||
    lowerMessage.includes('provider') ||
    lowerMessage.includes('connection')
  ) {
    return {
      message: 'Network connection error. Please check your MetaMask connection and try again.',
      type: 'network',
    }
  }

  // Transaction reverted errors (generic)
  if (lowerMessage.includes('revert') || lowerMessage.includes('require')) {
    // Try to extract the revert reason if available
    const revertMatch = rawMessage.match(/revert\s+(.+)/i)
    if (revertMatch && revertMatch[1]) {
      const revertReason = revertMatch[1].trim()
      return {
        message: `Transaction failed: ${revertReason}`,
        type: 'validation',
      }
    }
    return {
      message: 'Transaction was reverted. Please check your inputs and try again.',
      type: 'validation',
    }
  }

  // User rejected transaction
  if (
    lowerMessage.includes('user rejected') ||
    lowerMessage.includes('user denied') ||
    lowerMessage.includes('rejected by user') ||
    lowerMessage.includes('user cancelled')
  ) {
    return {
      message: 'Transaction was cancelled. Please try again when ready.',
      type: 'unknown',
    }
  }

  // Insufficient funds
  if (
    lowerMessage.includes('insufficient funds') ||
    lowerMessage.includes('insufficient balance') ||
    lowerMessage.includes('gas')
  ) {
    return {
      message: 'Insufficient funds or gas. Please ensure you have enough ETH to complete the transaction.',
      type: 'validation',
    }
  }

  // Contract not found
  if (
    lowerMessage.includes('contract not found') ||
    lowerMessage.includes('not deployed') ||
    lowerMessage.includes('deployment')
  ) {
    return {
      message: 'The smart contract is not deployed to the current network. Please switch to the correct network or deploy the contract.',
      type: 'network',
    }
  }

  // Default: return cleaned up message
  // Remove technical details and make it user-friendly
  let cleanedMessage = rawMessage
    .replace(/^error:\s*/i, '')
    .replace(/^execution reverted:\s*/i, '')
    .replace(/^revert\s+/i, '')
    .trim()

  // If message is still too technical, provide a generic message
  if (cleanedMessage.length > 200 || cleanedMessage.includes('{') || cleanedMessage.includes('[')) {
    cleanedMessage = 'An error occurred while processing your request. Please try again or contact support if the issue persists.'
  }

  return {
    message: cleanedMessage,
    type: 'unknown',
  }
}

