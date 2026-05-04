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

interface Medicine {
  id: string
  name: string
  description: string
  RMSid: string
  MANid: string
  DISid: string
  RETid: string
  stage: string
}

export default function Supply() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medStage, setMedStage] = useState<string[]>([])
  const [rmsId, setRmsId] = useState('')
  const [manId, setManId] = useState('')
  const [disId, setDisId] = useState('')
  const [retId, setRetId] = useState('')
  const [soldId, setSoldId] = useState('')

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoader(true)
      const { contract } = await getContract()
      const account = await getActiveAccount()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const medCtr = await contract.methods.medicineCtr().call()
      const medData: { [key: number]: Medicine } = {}
      const medStageData: string[] = []

      for (let i = 0; i < medCtr; i++) {
        medData[i] = await contract.methods.MedicineStock(i + 1).call()
        medStageData[i] = await contract.methods.showStage(i + 1).call()
      }

      setMed(medData)
      setMedStage(medStageData)
      setLoader(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  const handlerChangeRMSId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRmsId(event.target.value)
  }

  const handlerChangeManId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setManId(event.target.value)
  }

  const handlerChangeDisId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisId(event.target.value)
  }

  const handlerChangeRetId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRetId(event.target.value)
  }

  const handlerChangeSoldId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSoldId(event.target.value)
  }

  const handlerSubmitRMSsupply = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.RMSsupply(rmsId).send({ from: account })
      if (receipt) {
        loadBlockchainData()
        setRmsId('')
        showNotification('Raw materials supplied successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitManufacturing = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.Manufacturing(manId).send({ from: account })
      if (receipt) {
        loadBlockchainData()
        setManId('')
        showNotification('Manufacturing completed successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitDistribute = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.Distribute(disId).send({ from: account })
      if (receipt) {
        loadBlockchainData()
        setDisId('')
        showNotification('Distribution completed successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitRetail = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.Retail(retId).send({ from: account })
      if (receipt) {
        loadBlockchainData()
        setRetId('')
        showNotification('Retail completed successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmitSold = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.sold(soldId).send({ from: account })
      if (receipt) {
        loadBlockchainData()
        setSoldId('')
        showNotification('Item marked as sold successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const getStageColor = (stage: string) => {
    if (stage.includes('Ordered')) return 'border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-300'
    if (stage.includes('Raw Material')) return 'border border-green-500/30 bg-green-500/15 text-green-700 dark:text-green-300'
    if (stage.includes('Manufacturing')) return 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-800 dark:text-yellow-300'
    if (stage.includes('Distribution')) return 'border border-purple-500/30 bg-purple-500/15 text-purple-700 dark:text-purple-300'
    if (stage.includes('Retail')) return 'border border-orange-500/30 bg-orange-500/15 text-orange-700 dark:text-orange-300'
    if (stage.includes('Sold')) return 'border border-zinc-500/30 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
    return 'border border-zinc-500/30 bg-zinc-500/15 text-zinc-700 dark:text-zinc-300'
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <DashboardPageShell heading="Supply Materials" subheading="Flow Control">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Supply Chain Flow</h1>
                <p className="text-muted-foreground text-sm">Manage the flow of materials through the supply chain</p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </Button>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            Account: {currentAccount}
          </div>
        </div>

        {/* Flow Visualization */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Supply Chain Process Flow</CardTitle>
          </CardHeader>
          <CardContent>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Supply Chain Process Flow
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 p-6 rounded-xl border bg-muted/40">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
              <span className="text-xs mt-2 text-foreground font-semibold text-center">Order</span>
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
              <span className="text-xs mt-2 text-foreground font-semibold text-center">RMS</span>
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
              <span className="text-xs mt-2 text-foreground font-semibold text-center">Manufacture</span>
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
              <span className="text-xs mt-2 text-foreground font-semibold text-center">Retail</span>
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

        {/* Medicines Table */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Available Batteries
            </CardTitle>
            <Badge variant="secondary">Total: {Object.keys(med).length}</Badge>
          </CardHeader>
          <CardContent>
          
          {Object.keys(med).length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted-foreground text-lg">No batteries available yet</p>
              <p className="text-muted-foreground text-sm mt-2">Add batteries in the Order Materials page</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Current Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {Object.keys(med).map((key) => {
                    const index = parseInt(key)
                    const stage = medStage[index]
                    return (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <span className="font-semibold">{med[index].id}</span>
                          </div>
                        </TableCell>
                        <TableCell>{med[index].name}</TableCell>
                        <TableCell>{med[index].description}</TableCell>
                        <TableCell>
                          <Badge className={getStageColor(stage)}>{stage}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          )}
          </CardContent>
        </Card>

        {/* Supply Chain Steps */}
        <div className="space-y-6">
          {/* Step 1: RMS Supply */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/15 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">
                  Step 1: Supply Raw Materials
                </h5>
                <p className="text-sm text-muted-foreground mt-1">Only a registered Raw Material Supplier can perform this step</p>
              </div>
              <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                1
              </div>
            </div>
            <form onSubmit={handlerSubmitRMSsupply} className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <Input
                  className="pl-12 border-blue-500/30 bg-background/80"
                  type="text"
                  onChange={handlerChangeRMSId}
                  placeholder="Enter Battery ID"
                  value={rmsId}
                  required
                />
              </div>
              <Button
                type="submit"
                className="px-8 py-3 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Supply
              </Button>
            </form>
          </div>

          {/* Step 2: Manufacturing */}
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 dark:bg-green-500/15 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">
                  Step 2: Manufacture
                </h5>
                <p className="text-sm text-muted-foreground mt-1">Only a registered Manufacturer can perform this step</p>
              </div>
              <div className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                2
              </div>
            </div>
            <form onSubmit={handlerSubmitManufacturing} className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <Input
                  className="pl-12 border-green-500/30 bg-background/80"
                  type="text"
                  onChange={handlerChangeManId}
                  placeholder="Enter Battery ID"
                  value={manId}
                  required
                />
              </div>
              <Button
                type="submit"
                className="px-8 py-3 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Manufacture
              </Button>
            </form>
          </div>

          {/* Step 3: Distribute */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 dark:bg-purple-500/15 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">
                  Step 3: Distribute
                </h5>
                <p className="text-sm text-muted-foreground mt-1">Only a registered Distributor can perform this step</p>
              </div>
              <div className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs font-bold">
                3
              </div>
            </div>
            <form onSubmit={handlerSubmitDistribute} className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <Input
                  className="pl-12 border-purple-500/30 bg-background/80"
                  type="text"
                  onChange={handlerChangeDisId}
                  placeholder="Enter Battery ID"
                  value={disId}
                  required
                />
              </div>
              <Button
                type="submit"
                className="px-8 py-3 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Distribute
              </Button>
            </form>
          </div>

          {/* Step 4: Retail */}
          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 dark:bg-orange-500/15 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">
                  Step 4: Retail
                </h5>
                <p className="text-sm text-muted-foreground mt-1">Only a registered Retailer can perform this step</p>
              </div>
              <div className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                4
              </div>
            </div>
            <form onSubmit={handlerSubmitRetail} className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <Input
                  className="pl-12 border-orange-500/30 bg-background/80"
                  type="text"
                  onChange={handlerChangeRetId}
                  placeholder="Enter Battery ID"
                  value={retId}
                  required
                />
              </div>
              <Button
                type="submit"
                className="px-8 py-3 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Retail
              </Button>
            </form>
          </div>

          {/* Step 5: Sold */}
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 dark:bg-red-500/15 p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-xl font-bold text-foreground">
                  Step 5: Mark as Sold
                </h5>
                <p className="text-sm text-muted-foreground mt-1">Only a registered Retailer can perform this step</p>
              </div>
              <div className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                5
              </div>
            </div>
            <form onSubmit={handlerSubmitSold} className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <Input
                  className="pl-12 border-red-500/30 bg-background/80"
                  type="text"
                  onChange={handlerChangeSoldId}
                  placeholder="Enter Battery ID"
                  value={soldId}
                  required
                />
              </div>
              <Button
                type="submit"
                className="px-8 py-3 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark as Sold
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}
