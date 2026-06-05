'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getActiveAccount, getContract } from '@/lib/web3'
import { checkIsRegisteredProducer } from '@/lib/contractUtils'
import { parseTransactionError } from '@/lib/errorUtils'
import { showNotification } from '@/components/Notification'
import { DashboardPageShell } from '@/components/dashboard/page-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

export default function OrderMaterials() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<ChainContract | null>(null)
  const [products, setProducts] = useState<{ [key: number]: ProductRow }>({})
  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productStages, setProductStages] = useState<{ [key: number]: string }>({})
  const [isProducer, setIsProducer] = useState(false)
  const [roleCounts, setRoleCounts] = useState({
    supplier: 0,
    producer: 0,
    distributor: 0,
    seller: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      const supplierCount = Number(await contract.methods.supplierCtr().call())
      const producerCount = Number(await contract.methods.producerCtr().call())
      const distributorCount = Number(await contract.methods.distributorCtr().call())
      const sellerCount = Number(await contract.methods.sellerCtr().call())

      setRoleCounts({
        supplier: supplierCount,
        producer: producerCount,
        distributor: distributorCount,
        seller: sellerCount,
      })

      const producerStatus = await checkIsRegisteredProducer()
      setIsProducer(producerStatus)

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

  const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(event.target.value)
  }

  const handleProductDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProductDescription(event.target.value)
  }

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.addProduct(productName, productDescription).send({ from: account })
      if (receipt) {
        void loadBlockchainData()
        setProductName('')
        setProductDescription('')
        showNotification('Product added on chain.', 'success')
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  const rolesReady =
    roleCounts.supplier > 0 &&
    roleCounts.producer > 0 &&
    roleCounts.distributor > 0 &&
    roleCounts.seller > 0

  return (
    <DashboardPageShell heading="Order Materials" subheading="Create on-chain products">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Order Materials</h1>
                <p className="text-muted-foreground text-sm">Add products the supply chain will move through stages</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => router.push('/')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Button>
          </div>
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-lg">
            <span className="font-semibold">Account:</span> {currentAccount}
          </div>
        </div>

        {!isProducer && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5 shadow-sm dark:bg-red-500/15">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="font-bold text-foreground mb-2">Access restricted</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Only a registered <span className="font-semibold text-foreground">producer</span> can call{' '}
                  <span className="font-mono">addProduct</span>. Connect the wallet that was registered as a producer, or ask the contract owner to register this address on{' '}
                  <span className="font-semibold text-foreground">Register roles</span>.
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Your account:</span>{' '}
                    <span className="font-mono">{currentAccount}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isProducer && !rolesReady && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm dark:bg-amber-500/15">
            <div className="mb-4 flex items-start">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="mb-2 font-bold text-foreground">Requirements not met</h3>
                <p className="text-sm text-muted-foreground">
                  The contract requires at least one supplier, producer, distributor, and seller before{' '}
                  <span className="font-mono">addProduct</span>.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div
                className={`rounded-lg border p-3 ${roleCounts.supplier > 0 ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15' : 'border-destructive/30 bg-destructive/10 dark:bg-destructive/15'}`}
              >
                <div className="mb-2 flex items-center">
                  <svg
                    className={`mr-2 h-5 w-5 ${roleCounts.supplier > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {roleCounts.supplier > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold text-foreground">Supplier</div>
                </div>
                <div
                  className={`text-lg font-bold ${roleCounts.supplier > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}
                >
                  {roleCounts.supplier} registered
                </div>
              </div>
              <div
                className={`rounded-lg border p-3 ${roleCounts.producer > 0 ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15' : 'border-destructive/30 bg-destructive/10 dark:bg-destructive/15'}`}
              >
                <div className="mb-2 flex items-center">
                  <svg
                    className={`mr-2 h-5 w-5 ${roleCounts.producer > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {roleCounts.producer > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold text-foreground">Producer</div>
                </div>
                <div
                  className={`text-lg font-bold ${roleCounts.producer > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}
                >
                  {roleCounts.producer} registered
                </div>
              </div>
              <div
                className={`rounded-lg border p-3 ${roleCounts.distributor > 0 ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15' : 'border-destructive/30 bg-destructive/10 dark:bg-destructive/15'}`}
              >
                <div className="mb-2 flex items-center">
                  <svg
                    className={`mr-2 h-5 w-5 ${roleCounts.distributor > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {roleCounts.distributor > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold text-foreground">Distributor</div>
                </div>
                <div
                  className={`text-lg font-bold ${roleCounts.distributor > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}
                >
                  {roleCounts.distributor} registered
                </div>
              </div>
              <div
                className={`rounded-lg border p-3 ${roleCounts.seller > 0 ? 'border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15' : 'border-destructive/30 bg-destructive/10 dark:bg-destructive/15'}`}
              >
                <div className="mb-2 flex items-center">
                  <svg
                    className={`mr-2 h-5 w-5 ${roleCounts.seller > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {roleCounts.seller > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold text-foreground">Seller</div>
                </div>
                <div
                  className={`text-lg font-bold ${roleCounts.seller > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-destructive'}`}
                >
                  {roleCounts.seller} registered
                </div>
              </div>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => router.push('/register-roles')}>
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Go to register roles
            </Button>
          </div>
        )}

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Add product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <Input
                type="text"
                onChange={handleProductNameChange}
                placeholder="Product name"
                value={productName}
                required
                disabled={isSubmitting}
              />
              <Textarea
                onChange={handleProductDescriptionChange}
                placeholder="Product description"
                value={productDescription}
                required
                disabled={isSubmitting}
                rows={4}
              />
              <Button type="submit" className="w-full" disabled={!isProducer || !rolesReady || isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Add product'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Products</CardTitle>
            <Badge variant="secondary">Total: {Object.keys(products).length}</Badge>
          </CardHeader>
          <CardContent>
            {Object.keys(products).length === 0 ? (
              <p className="text-sm text-muted-foreground">No products yet. Add one above, then advance stages on Supply Materials.</p>
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
                    const chainProductId = parseInt(key, 10)
                    const stage = productStages[chainProductId]
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{products[chainProductId].id}</TableCell>
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
      </div>
    </DashboardPageShell>
  )
}
