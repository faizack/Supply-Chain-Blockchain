'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getActiveAccount, getContract } from '@/lib/web3'
import { checkIsOwner, getContractOwner } from '@/lib/contractUtils'
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

export default function AddMed() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medName, setMedName] = useState('')
  const [medDes, setMedDes] = useState('')
  const [medStage, setMedStage] = useState<string[]>([])
  const [isOwner, setIsOwner] = useState(false)
  const [contractOwner, setContractOwner] = useState<string>('')
  const [roleCounts, setRoleCounts] = useState({
    rms: 0,
    man: 0,
    dis: 0,
    ret: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      
      // Check role counts
      const rmsCount = await contract.methods.rmsCtr().call()
      const manCount = await contract.methods.manCtr().call()
      const disCount = await contract.methods.disCtr().call()
      const retCount = await contract.methods.retCtr().call()
      
      setRoleCounts({
        rms: parseInt(rmsCount),
        man: parseInt(manCount),
        dis: parseInt(disCount),
        ret: parseInt(retCount),
      })
      
      // Check if current account is the owner
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      const owner = await getContractOwner()
      if (owner) setContractOwner(owner)
      
      setLoader(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  const handlerChangeNameMED = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMedName(event.target.value)
  }

  const handlerChangeDesMED = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMedDes(event.target.value)
  }

  const handlerSubmitMED = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const account = await getActiveAccount()
      setCurrentAccount(account)
      const receipt = await supplyChain.methods.addMedicine(medName, medDes).send({ from: account })
      if (receipt) {
        loadBlockchainData()
        setMedName('')
        setMedDes('')
        showNotification('Material order created successfully!', 'success')
      }
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStageColor = (stage: string) => {
    if (stage.includes('Ordered')) return 'bg-blue-100 text-blue-700 border-blue-300'
    if (stage.includes('Raw Material')) return 'bg-green-100 text-green-700 border-green-300'
    if (stage.includes('Manufacturing')) return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    if (stage.includes('Distribution')) return 'bg-purple-100 text-purple-700 border-purple-300'
    if (stage.includes('Retail')) return 'bg-orange-100 text-orange-700 border-orange-300'
    if (stage.includes('Sold')) return 'bg-gray-100 text-gray-700 border-gray-300'
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <DashboardPageShell heading="Order Materials" subheading="Material Operations">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Order Materials</h1>
                <p className="text-muted-foreground text-sm">Create new material orders in the supply chain</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </button>
          </div>
          <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded-lg">
            <span className="font-semibold">Account:</span> {currentAccount}
          </div>
        </div>

        {/* Warning Messages */}
        {!isOwner && (
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-xl shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-red-800 font-bold mb-2">Access Restricted</h3>
                <p className="text-red-700 text-sm mb-2">
                  Only the contract owner can create material orders.
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <p className="text-red-600">
                    <span className="font-semibold">Contract Owner:</span> {contractOwner || 'Loading...'}
                  </p>
                  <p className="text-red-600">
                    <span className="font-semibold">Your Account:</span> {currentAccount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Requirements Check */}
        {isOwner && (roleCounts.rms === 0 || roleCounts.man === 0 || roleCounts.dis === 0 || roleCounts.ret === 0) && (
          <div className="mb-6 p-5 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl shadow-lg">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-yellow-800 font-bold mb-2">Requirements Not Met</h3>
                <p className="text-yellow-700 text-sm">
                  You must register at least one role of each type before ordering materials.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className={`p-3 rounded-lg border-2 ${roleCounts.rms > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 mr-2 ${roleCounts.rms > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {roleCounts.rms > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold">Raw Material Supplier</div>
                </div>
                <div className={`text-lg font-bold ${roleCounts.rms > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {roleCounts.rms} registered
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 ${roleCounts.man > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 mr-2 ${roleCounts.man > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {roleCounts.man > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold">Manufacturer</div>
                </div>
                <div className={`text-lg font-bold ${roleCounts.man > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {roleCounts.man} registered
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 ${roleCounts.dis > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 mr-2 ${roleCounts.dis > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {roleCounts.dis > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold">Distributor</div>
                </div>
                <div className={`text-lg font-bold ${roleCounts.dis > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {roleCounts.dis} registered
                </div>
              </div>
              <div className={`p-3 rounded-lg border-2 ${roleCounts.ret > 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-center mb-2">
                  <svg className={`w-5 h-5 mr-2 ${roleCounts.ret > 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {roleCounts.ret > 0 ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                  <div className="text-xs font-semibold">Retailer</div>
                </div>
                <div className={`text-lg font-bold ${roleCounts.ret > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {roleCounts.ret} registered
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/roles')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Go to Register Roles
            </button>
          </div>
        )}
        
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Create New Material Order</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlerSubmitMED} className="space-y-4">
              <Input
                type="text"
                onChange={handlerChangeNameMED}
                placeholder="Material Name"
                value={medName}
                required
                disabled={isSubmitting}
              />
              <Textarea
                onChange={handlerChangeDesMED}
                placeholder="Material Description"
                value={medDes}
                required
                disabled={isSubmitting}
                rows={4}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!isOwner || roleCounts.rms === 0 || roleCounts.man === 0 || roleCounts.dis === 0 || roleCounts.ret === 0 || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Create Order'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ordered Materials</CardTitle>
            <Badge variant="secondary">Total: {Object.keys(med).length}</Badge>
          </CardHeader>
          <CardContent>
            {Object.keys(med).length === 0 ? (
              <p className="text-sm text-muted-foreground">No materials ordered yet. Create your first material order above.</p>
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
                        <TableCell className="font-medium">{med[index].id}</TableCell>
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
      </div>
    </DashboardPageShell>
  )
}

