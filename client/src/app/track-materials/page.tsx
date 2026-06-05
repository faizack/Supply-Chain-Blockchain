'use client'

import { useState, useEffect, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getActiveAccount, getContract } from '@/lib/web3'
import { QRCodeCanvas } from 'qrcode.react'
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

interface Role {
  addr: string
  id: string
  name: string
  place: string
}

type ChainContract = Awaited<ReturnType<typeof getContract>>['contract']

type TraceStageRow = {
  label: string
  data?: Role
  showArrow?: boolean
  icon?: ReactElement
}

type TrackMaterialsPanelProps = {
  productIdInput: string
  products: Record<number, ProductRow>
  productStages: Record<number, string>
  showQr: boolean
  stages: TraceStageRow[]
  onTrackAnother: () => void
  onHome: () => void
}

function TrackMaterialsPanel({
  productIdInput,
  products,
  productStages,
  showQr,
  stages,
  onTrackAnother,
  onHome,
}: TrackMaterialsPanelProps) {
  const chainProductId = parseInt(productIdInput, 10)
  const qrPayload = {
    id: products[chainProductId]?.id,
    name: products[chainProductId]?.name,
    description: products[chainProductId]?.description,
    currentStage: productStages[chainProductId],
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 rounded-2xl border border-purple-500/25 bg-linear-to-br from-purple-500/10 via-transparent to-pink-500/10 p-8 dark:border-purple-400/20 dark:from-purple-500/15 dark:to-pink-500/10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-muted/60 backdrop-blur-sm">
              <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 text-3xl font-bold text-foreground">Product details</h3>
              <p className="text-sm text-muted-foreground">Track ID: {products[chainProductId]?.id}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card/80 p-4 dark:bg-card/60">
            <div className="mb-1 text-sm text-muted-foreground">Name</div>
            <div className="text-lg font-semibold text-foreground">{products[chainProductId]?.name}</div>
          </div>
          <div className="rounded-lg border border-border bg-card/80 p-4 dark:bg-card/60">
            <div className="mb-1 text-sm text-muted-foreground">Description</div>
            <div className="truncate text-lg font-semibold text-foreground">{products[chainProductId]?.description}</div>
          </div>
          <div className="rounded-lg border border-border bg-card/80 p-4 dark:bg-card/60">
            <div className="mb-1 text-sm text-muted-foreground">Current stage</div>
            <div className="text-lg font-semibold text-foreground">{productStages[chainProductId]}</div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h4 className="mb-6 flex items-center text-2xl font-bold text-foreground">
          <svg className="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Supply chain journey
        </h4>

        <div className="relative">
          <div className="absolute bottom-0 left-8 top-0 hidden w-0.5 bg-linear-to-b from-primary/60 via-purple-400/45 to-pink-400/50 md:block dark:from-primary/40" />

          <div className="space-y-8">
            {stages.map((stage, index) => (
              <div key={index} className="relative flex items-start">
                <div className="relative z-10 flex h-16 w-16 shrink-0 transform items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-white shadow-lg transition-transform hover:scale-110 [&>svg]:text-white">
                  {stage.icon || (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-background/90">
                      <span className="font-bold text-primary">{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="ml-6 flex-1 rounded-xl border border-border bg-muted/30 p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-muted/20">
                  <h5 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-bold text-foreground">
                    {stage.label}
                    {stage.data && (
                      <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-300">
                        ✓ Completed
                      </span>
                    )}
                  </h5>
                  {stage.data ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                        <div className="mb-1 text-xs text-muted-foreground">ID</div>
                        <div className="font-semibold text-foreground">{stage.data.id}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                        <div className="mb-1 text-xs text-muted-foreground">Name</div>
                        <div className="font-semibold text-foreground">{stage.data.name}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                        <div className="mb-1 text-xs text-muted-foreground">Location</div>
                        <div className="font-semibold text-foreground">{stage.data.place}</div>
                      </div>
                      <div className="rounded-lg border border-border bg-card p-3 shadow-sm md:col-span-3">
                        <div className="mb-1 text-xs text-muted-foreground">Address</div>
                        <div className="break-all font-mono text-xs text-foreground/90">{stage.data.addr}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded border-l-4 border-amber-500/55 bg-amber-500/10 p-4 dark:bg-amber-500/15">
                      <p className="font-medium text-amber-900 dark:text-amber-100">Not yet processed</p>
                    </div>
                  )}
                </div>

                {stage.showArrow && index < stages.length - 1 && (
                  <div className="absolute left-8 top-16 hidden h-8 w-0.5 bg-linear-to-b from-purple-400/70 to-pink-400/60 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQr && (
        <div className="mb-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h4 className="mb-4 flex items-center text-2xl font-bold text-foreground">
            <svg className="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            QR code
          </h4>
          <div className="flex justify-center">
            <div className="rounded-xl border border-purple-500/25 bg-muted/30 p-6 dark:border-purple-400/20">
              <div className="rounded-lg bg-white p-4 shadow-inner dark:bg-white">
                <QRCodeCanvas value={JSON.stringify(qrPayload)} size={250} level="H" includeMargin={true} />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">
                Scan to view product details
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          type="button"
          onClick={onTrackAnother}
          variant="outline"
          className="flex-1 border-emerald-500/35 bg-emerald-500/10 py-6 text-emerald-800 hover:bg-emerald-500/15 dark:text-emerald-200"
        >
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Track another item
        </Button>
        <Button type="button" variant="destructive" onClick={onHome} className="flex-1 py-6">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Button>
      </div>
    </div>
  )
}

export default function TrackMaterials() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<ChainContract | null>(null)
  const [products, setProducts] = useState<{ [key: number]: ProductRow }>({})
  const [productStages, setProductStages] = useState<{ [key: number]: string }>({})
  const [productIdInput, setProductIdInput] = useState('')
  const [rms, setRMS] = useState<{ [key: number]: Role }>({})
  const [man, setMAN] = useState<{ [key: number]: Role }>({})
  const [dis, setDIS] = useState<{ [key: number]: Role }>({})
  const [ret, setRET] = useState<{ [key: number]: Role }>({})
  const [trackTillSold, setTrackTillSold] = useState(false)
  const [trackTillForSale, setTrackTillForSale] = useState(false)
  const [trackTillTransit, setTrackTillTransit] = useState(false)
  const [trackTillProcessing, setTrackTillProcessing] = useState(false)
  const [trackTillCreated, setTrackTillCreated] = useState(false)

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

      const rmsCtr = Number(await contract.methods.supplierCtr().call())
      const rmsData: { [key: number]: Role } = {}
      for (let i = 0; i < rmsCtr; i++) {
        rmsData[i + 1] = await contract.methods.SUPPLIERS(i + 1).call()
      }
      setRMS(rmsData)

      const manCtr = Number(await contract.methods.producerCtr().call())
      const manData: { [key: number]: Role } = {}
      for (let i = 0; i < manCtr; i++) {
        manData[i + 1] = await contract.methods.PRODUCERS(i + 1).call()
      }
      setMAN(manData)

      const disCtr = Number(await contract.methods.distributorCtr().call())
      const disData: { [key: number]: Role } = {}
      for (let i = 0; i < disCtr; i++) {
        disData[i + 1] = await contract.methods.DISTRIBUTORS(i + 1).call()
      }
      setDIS(disData)

      const retCtr = Number(await contract.methods.sellerCtr().call())
      const retData: { [key: number]: Role } = {}
      for (let i = 0; i < retCtr; i++) {
        retData[i + 1] = await contract.methods.SELLERS(i + 1).call()
      }
      setRET(retData)

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

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  const handlerChangeProductId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProductIdInput(event.target.value)
  }

  const trackProduct = async (chainProductId: number) => {
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const ctr = Number(await supplyChain.methods.productCtr().call())
      if (!(chainProductId > 0 && chainProductId <= ctr)) {
        showNotification('Invalid product ID.', 'error')
        return
      }

      if (!products[chainProductId]) {
        showNotification('Product data not found. Wait for the list to load.', 'warning')
        return
      }

      const stageNum = Number(products[chainProductId].stage)
      setProductIdInput(chainProductId.toString())

      setTrackTillSold(false)
      setTrackTillForSale(false)
      setTrackTillTransit(false)
      setTrackTillProcessing(false)
      setTrackTillCreated(false)

      if (stageNum === 4) setTrackTillSold(true)
      else if (stageNum === 3) setTrackTillForSale(true)
      else if (stageNum === 2) setTrackTillTransit(true)
      else if (stageNum === 1) setTrackTillProcessing(true)
      else setTrackTillCreated(true)
    } catch (err: unknown) {
      console.error('Error tracking product:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const parsedId = parseInt(productIdInput, 10)
    if (Number.isNaN(parsedId)) {
      showNotification('Please enter a valid product ID.', 'error')
      return
    }
    await trackProduct(parsedId)
  }

  const resetTracking = () => {
    setTrackTillSold(false)
    setTrackTillForSale(false)
    setTrackTillTransit(false)
    setTrackTillProcessing(false)
    setTrackTillCreated(false)
    setProductIdInput('')
  }

  const stageIcons = {
    rms: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    manufacture: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    distribute: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    retail: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    sold: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  if (trackTillSold) {
    const chainProductId = parseInt(productIdInput, 10)
    const p = products[chainProductId]
    return (
      <DashboardPageShell heading="Track Materials" subheading="Traceability">
        <TrackMaterialsPanel
          productIdInput={productIdInput}
          products={products}
          productStages={productStages}
          showQr={true}
          onTrackAnother={resetTracking}
          onHome={() => router.push('/')}
          stages={[
            {
              label: 'Supplied by',
              data: rms[Number(p?.supplierId)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Processed by producer',
              data: man[Number(p?.producerId)],
              showArrow: true,
              icon: stageIcons.manufacture,
            },
            {
              label: 'Distributed by',
              data: dis[Number(p?.distributorId)],
              showArrow: true,
              icon: stageIcons.distribute,
            },
            {
              label: 'Listed by seller',
              data: ret[Number(p?.sellerId)],
              showArrow: true,
              icon: stageIcons.retail,
            },
            {
              label: 'Sold',
              showArrow: false,
              icon: stageIcons.sold,
            },
          ]}
        />
      </DashboardPageShell>
    )
  }

  if (trackTillForSale) {
    const chainProductId = parseInt(productIdInput, 10)
    const p = products[chainProductId]
    const sellerId = Number(p?.sellerId)
    return (
      <DashboardPageShell heading="Track Materials" subheading="Traceability">
        <TrackMaterialsPanel
          productIdInput={productIdInput}
          products={products}
          productStages={productStages}
          showQr={true}
          onTrackAnother={resetTracking}
          onHome={() => router.push('/')}
          stages={[
            {
              label: 'Supplied by',
              data: rms[Number(p?.supplierId)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Processed by producer',
              data: man[Number(p?.producerId)],
              showArrow: true,
              icon: stageIcons.manufacture,
            },
            {
              label: 'Distributed by',
              data: dis[Number(p?.distributorId)],
              showArrow: true,
              icon: stageIcons.distribute,
            },
            ...(sellerId > 0
              ? [
                  {
                    label: 'Listed by seller',
                    data: ret[sellerId],
                    showArrow: false,
                    icon: stageIcons.retail,
                  },
                ]
              : [
                  {
                    label: 'Seller listing',
                    showArrow: false,
                    icon: stageIcons.retail,
                  },
                ]),
          ]}
        />
      </DashboardPageShell>
    )
  }

  if (trackTillTransit) {
    const chainProductId = parseInt(productIdInput, 10)
    const p = products[chainProductId]
    return (
      <DashboardPageShell heading="Track Materials" subheading="Traceability">
        <TrackMaterialsPanel
          productIdInput={productIdInput}
          products={products}
          productStages={productStages}
          showQr={true}
          onTrackAnother={resetTracking}
          onHome={() => router.push('/')}
          stages={[
            {
              label: 'Supplied by',
              data: rms[Number(p?.supplierId)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Processed by producer',
              data: man[Number(p?.producerId)],
              showArrow: false,
              icon: stageIcons.manufacture,
            },
          ]}
        />
      </DashboardPageShell>
    )
  }

  if (trackTillProcessing) {
    const chainProductId = parseInt(productIdInput, 10)
    const p = products[chainProductId]
    return (
      <DashboardPageShell heading="Track Materials" subheading="Traceability">
        <TrackMaterialsPanel
          productIdInput={productIdInput}
          products={products}
          productStages={productStages}
          showQr={true}
          onTrackAnother={resetTracking}
          onHome={() => router.push('/')}
          stages={[
            {
              label: 'Supplied by',
              data: rms[Number(p?.supplierId)],
              showArrow: false,
              icon: stageIcons.rms,
            },
          ]}
        />
      </DashboardPageShell>
    )
  }

  if (trackTillCreated) {
    return (
      <DashboardPageShell heading="Track Materials" subheading="Traceability">
        <TrackMaterialsPanel
          productIdInput={productIdInput}
          products={products}
          productStages={productStages}
          showQr={true}
          onTrackAnother={resetTracking}
          onHome={() => router.push('/')}
          stages={[
            {
              label: 'Product created — awaiting supplier',
              showArrow: false,
            },
          ]}
        />
      </DashboardPageShell>
    )
  }

  return (
    <DashboardPageShell heading="Track Materials" subheading="Traceability">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Track Materials</h1>
                <p className="text-sm text-muted-foreground">Follow a product across the supply chain</p>
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

        {/* Search Section */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-center gap-3 space-y-0">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <CardTitle className="text-foreground">Look up product ID</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
          <form onSubmit={handlerSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <Input
                className="py-6 pl-12 text-base"
                type="text"
                onChange={handlerChangeProductId}
                placeholder="Enter product ID (e.g., 1, 2, 3…)"
                value={productIdInput}
                required
              />
            </div>
            <Button
              type="submit"
              className="px-8 py-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Track
            </Button>
          </form>
          </CardContent>
        </Card>

        {/* Products table — keys match on-chain ProductStock ids */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <div className="flex items-center gap-2">
              <svg className="h-6 w-6 shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <CardTitle className="text-foreground">Products on chain</CardTitle>
            </div>
            <Badge variant="secondary" className="shrink-0">
              Total: {Object.keys(products).length}
            </Badge>
          </CardHeader>
          <CardContent>
          {Object.keys(products).length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto mb-4 h-16 w-16 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-lg text-muted-foreground">No products yet</p>
              <p className="mt-2 text-sm text-muted-foreground/80">Add one from Order Materials</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {Object.keys(products).map((key) => {
                    const chainProductId = parseInt(key, 10)
                    const stage = productStages[chainProductId]
                    return (
                      <TableRow
                        key={key}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => trackProduct(chainProductId)}
                      >
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
                        <TableCell>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              trackProduct(chainProductId)
                            }}
                            size="sm"
                            variant="outline"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Button>
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
