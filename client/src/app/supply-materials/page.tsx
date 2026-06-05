'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getActiveAccount, getContract } from '@/lib/web3'
import { parseTransactionError } from '@/lib/errorUtils'
import { showNotification } from '@/components/Notification'
import { DashboardPageShell } from '@/components/dashboard/page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { type ProductRow, getStageBadgeClass, normalizeProduct } from '@/lib/supplyChain'

type ChainContract = Awaited<ReturnType<typeof getContract>>['contract']

/** Trimmed digits-only base-10 id, must be a safe positive integer (matches on-chain product id). */
function parseChainProductId(raw: string): number | null {
  const t = raw.trim()
  if (!/^\d+$/.test(t)) return null
  const n = Number.parseInt(t, 10)
  if (!Number.isSafeInteger(n) || n <= 0) return null
  return n
}

export default function SupplyMaterials() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<ChainContract | null>(null)
  const [products, setProducts] = useState<{ [key: number]: ProductRow }>({})
  const [productStages, setProductStages] = useState<{ [key: number]: string }>({})
  const [productId, setProductId] = useState('')

  async function loadBlockchainData() {
    try {
      setLoader(true)
      const { contract } = await getContract()
      const account = await getActiveAccount()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const productCount = Number(await contract.methods.productCtr().call())
      const productsById: { [key: number]: ProductRow } = {}
      const stagesByProductId: { [key: number]: string } = {}

      for (let i = 0; i < productCount; i++) {
        const raw = (await contract.methods.ProductStock(i + 1).call()) as Record<string, unknown>
        productsById[i + 1] = normalizeProduct(raw)
        stagesByProductId[i + 1] = await contract.methods.showStage(i + 1).call()
      }

      setProducts(productsById)
      setProductStages(stagesByProductId)
      setLoader(false)
    } catch (err: unknown) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  useEffect(() => {
    void loadWeb3()
    queueMicrotask(() => {
      void loadBlockchainData()
    })
  }, [])

  const handleProductIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductId(event.target.value)
  }

  const handleSupplyProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    const chainId = parseChainProductId(productId)
    if (chainId === null) {
      showNotification('Enter a positive whole-number product ID (digits only).', 'error')
      return
    }
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.supplyProduct(chainId).send({ from: account })
      if (receipt) {
        void loadBlockchainData()
        showNotification('Supplier step recorded.', 'success')
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handleProcessProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    const chainId = parseChainProductId(productId)
    if (chainId === null) {
      showNotification('Enter a positive whole-number product ID (digits only).', 'error')
      return
    }
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.processProduct(chainId).send({ from: account })
      if (receipt) {
        void loadBlockchainData()
        showNotification('Producer step recorded.', 'success')
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handleDistributeProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    const chainId = parseChainProductId(productId)
    if (chainId === null) {
      showNotification('Enter a positive whole-number product ID (digits only).', 'error')
      return
    }
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.distributeProduct(chainId).send({ from: account })
      if (receipt) {
        void loadBlockchainData()
        showNotification('Distributor step recorded.', 'success')
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handleListForSale = async (event: React.FormEvent) => {
    event.preventDefault()
    const chainId = parseChainProductId(productId)
    if (chainId === null) {
      showNotification('Enter a positive whole-number product ID (digits only).', 'error')
      return
    }
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.listForSale(chainId).send({ from: account })
      if (receipt) {
        void loadBlockchainData()
        showNotification('Seller listing recorded.', 'success')
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handleMarkProductSold = async (event: React.FormEvent) => {
    event.preventDefault()
    const chainId = parseChainProductId(productId)
    if (chainId === null) {
      showNotification('Enter a positive whole-number product ID (digits only).', 'error')
      return
    }
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.markProductSold(chainId).send({ from: account })
      if (receipt) {
        void loadBlockchainData()
        showNotification('Product marked as sold.', 'success')
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-primary"></div>
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <DashboardPageShell heading="Supply Materials" subheading="Advance products on chain">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-500 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Supply chain flow</h1>
                <p className="text-muted-foreground text-sm">Run each stage with the wallet registered for that role</p>
              </div>
            </div>
            <Button variant="destructive" onClick={() => router.push('/')} className="flex items-center">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Button>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Account: {currentAccount}
          </div>
        </div>

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Process overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Pipeline visibility:</span> steps 1–5 are all shown on this
              screen to every participant. On-chain, only the wallet registered for each step&apos;s role can submit that
              transaction.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 p-6 rounded-xl border bg-muted/40">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  1
                </div>
                <span className="text-xs mt-2 text-center font-semibold text-foreground">Created</span>
              </div>
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs mt-2 text-center font-semibold text-foreground">Supplier</span>
              </div>
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <span className="text-xs mt-2 text-foreground font-semibold text-center">Producer</span>
              </div>
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-xs mt-2 text-foreground font-semibold text-center">Distribute</span>
              </div>
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <span className="text-xs mt-2 text-center font-semibold text-foreground">Seller</span>
              </div>
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs mt-2 text-foreground font-semibold text-center">Sold</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Products
            </CardTitle>
            <Badge variant="secondary">Total: {Object.keys(products).length}</Badge>
          </CardHeader>
          <CardContent>
            {Object.keys(products).length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg text-muted-foreground">No products yet</p>
                <p className="mt-2 text-sm text-muted-foreground">Create one from Order Materials</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Current stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.keys(products).map((key) => {
                    const chainProductId = Number.parseInt(key, 10)
                    const stage = productStages[chainProductId]
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <span className="font-semibold">{products[chainProductId].id}</span>
                          </div>
                        </TableCell>
                        <TableCell>{products[chainProductId].name}</TableCell>
                        <TableCell>{products[chainProductId].description}</TableCell>
                        <TableCell>
                          <Badge className={getStageBadgeClass(stage)}>{stage}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Product ID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Enter the on-chain product ID once (whole number). Each step sends a transaction for this ID and must
              match the contract stage and your wallet role.
            </p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={productId}
              onChange={handleProductIdChange}
              placeholder="e.g. 1"
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 shadow-sm dark:bg-blue-500/15">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">Step 1: Supplier handoff</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Registered supplier · Created → Processing
                </p>
                <div className="mt-3 space-y-2 border-t border-blue-500/20 pt-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Action by:</span> Supplier
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Who sees it:</span> Everyone on this page; only a
                    registered supplier can press the button.
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">1</div>
            </div>
            <form onSubmit={handleSupplyProduct} className="flex gap-3">
              <Button type="submit" className="flex items-center px-8 py-3">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Record supplier
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 shadow-sm dark:bg-green-500/15">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">Step 2: Producer processing</h5>
                <p className="mt-1 text-sm text-muted-foreground">Registered producer · Processing → In transit</p>
                <div className="mt-3 space-y-2 border-t border-green-500/20 pt-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Action by:</span> Producer
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Who sees it:</span> Everyone on this page; only a
                    registered producer can press the button.
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">2</div>
            </div>
            <form onSubmit={handleProcessProduct} className="flex gap-3">
              <Button type="submit" className="flex items-center px-8 py-3">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Record producer
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 shadow-sm dark:bg-purple-500/15">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">Step 3: Distribution</h5>
                <p className="mt-1 text-sm text-muted-foreground">Registered distributor · In transit → For sale</p>
                <div className="mt-3 space-y-2 border-t border-purple-500/20 pt-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Action by:</span> Distributor
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Who follows this:</span> Distributor controls the
                    move · Producer tracks outgoing goods ·{' '}
                    <span className="font-semibold text-foreground">Seller — waiting for delivery (critical)</span>
                  </p>
                </div>
                <div className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/15 px-3 py-2.5 dark:bg-amber-500/20">
                  <p className="text-xs font-semibold text-foreground">Seller visibility</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sellers should treat this step as the handoff before listing: watch it closely so you know when
                    goods are in the &quot;for sale&quot; lane on-chain.
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-purple-500 px-3 py-1 text-xs font-bold text-white">3</div>
            </div>
            <form onSubmit={handleDistributeProduct} className="flex gap-3">
              <Button type="submit" className="flex items-center px-8 py-3">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Record distributor
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 shadow-sm dark:bg-orange-500/15">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">Step 4: List for sale</h5>
                <p className="mt-1 text-sm text-muted-foreground">
                  Registered seller · records listing (stage stays For sale)
                </p>
                <div className="mt-3 space-y-2 border-t border-orange-500/20 pt-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Action by:</span> Seller
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Who sees it:</span> Seller creates the listing;
                    distributor and producer may optionally monitor. This is when the product becomes visible to buyers if
                    your storefront or explorer reads from the chain.
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">4</div>
            </div>
            <form onSubmit={handleListForSale} className="flex gap-3">
              <Button type="submit" className="flex items-center px-8 py-3">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                List for sale
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-sm dark:bg-red-500/15">
            <div className="mb-4 flex items-center">
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 shadow-lg">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">Step 5: Mark sold</h5>
                <p className="mt-1 text-sm text-muted-foreground">Same seller who listed · For sale → Sold</p>
                <div className="mt-3 space-y-2 border-t border-red-500/20 pt-3 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Action by:</span> Seller (same wallet that listed)
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Who sees it:</span> Seller submits the final move;
                    supplier, producer, distributor, and seller all use this milestone for tracking. Customers can verify
                    the outcome if you publish transparency links or IDs.
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">5</div>
            </div>
            <form onSubmit={handleMarkProductSold} className="flex gap-3">
              <Button type="submit" className="flex items-center px-8 py-3">
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as sold
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}
