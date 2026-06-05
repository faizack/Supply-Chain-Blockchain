/** Shape returned by `ProductStock` after normalization (ABI camelCase + legacy aliases). */
export type ProductRow = {
  id: string
  name: string
  description: string
  supplierId: string
  producerId: string
  distributorId: string
  sellerId: string
  /** STAGE enum index from chain: 0 Created … 4 Sold */
  stage: string
}

export function normalizeProduct(raw: Record<string, unknown>): ProductRow {
  const num = (v: unknown) => String(v ?? '0')
  return {
    id: num(raw.id),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    supplierId: num(raw.supplierId ?? raw.RMSid),
    producerId: num(raw.producerId ?? raw.MANid),
    distributorId: num(raw.distributorId ?? raw.DISid),
    sellerId: num(raw.sellerId ?? raw.RETid),
    stage: num(raw.stage),
  }
}

/** Badge styles for `showStage()` labels from the contract. */
export function getStageBadgeClass(stageLabel: string): string {
  if (stageLabel.includes('Created'))
    return 'border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300'
  if (stageLabel.includes('Processing'))
    return 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
  if (stageLabel.includes('Transit'))
    return 'border border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-300'
  if (stageLabel.includes('For Sale'))
    return 'border border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-300'
  if (stageLabel.includes('Sold'))
    return 'border border-zinc-500/30 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
  return 'border border-muted-foreground/25 bg-muted/50 text-foreground'
}
