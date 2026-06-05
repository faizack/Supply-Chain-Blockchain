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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Role {
  addr: string
  id: string
  name: string
  place: string
  /** On-chain ROLE enum from Actor struct */
  role?: string
}

type ChainContract = Awaited<ReturnType<typeof getContract>>['contract']

export default function RegisterRoles() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<ChainContract | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [contractOwner, setContractOwner] = useState<string>('')
  const [roles, setRoles] = useState<{
    rms: Role[]
    man: Role[]
    dis: Role[]
    ret: Role[]
  }>({
    rms: [],
    man: [],
    dis: [],
    ret: [],
  })

  const [newRole, setNewRole] = useState({
    address: '',
    name: '',
    place: '',
    type: 'rms',
  })

  async function loadBlockchainData() {
    try {
      setLoading(true)
      const { contract } = await getContract()
      const account = await getActiveAccount()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const rmsCount = Number(await contract.methods.supplierCtr().call())
      const manCount = Number(await contract.methods.producerCtr().call())
      const disCount = Number(await contract.methods.distributorCtr().call())
      const retCount = Number(await contract.methods.sellerCtr().call())

      const rms = await Promise.all(
        Array.from({ length: rmsCount }, (_, i) => contract.methods.SUPPLIERS(i + 1).call() as Promise<Role>)
      )
      const man = await Promise.all(
        Array.from({ length: manCount }, (_, i) => contract.methods.PRODUCERS(i + 1).call() as Promise<Role>)
      )
      const dis = await Promise.all(
        Array.from({ length: disCount }, (_, i) => contract.methods.DISTRIBUTORS(i + 1).call() as Promise<Role>)
      )
      const ret = await Promise.all(
        Array.from({ length: retCount }, (_, i) => contract.methods.SELLERS(i + 1).call() as Promise<Role>)
      )

      setRoles({ rms, man, dis, ret })
      
      // Check if current account is the owner
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      const owner = await getContractOwner()
      if (owner) setContractOwner(owner)
      
      setLoading(false)
    } catch (err: unknown) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWeb3()
    queueMicrotask(() => {
      void loadBlockchainData()
    })
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setNewRole((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleRoleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const { address, name, place, type } = newRole
    try {
      if (!supplyChain) {
        showNotification('Contract not ready. Refresh the page.', 'error')
        return
      }
      const account = await getActiveAccount()
      setCurrentAccount(account)
      let receipt
      switch (type) {
        case 'rms':
          receipt = await supplyChain.methods.addSupplier(address, name, place).send({ from: account })
          break
        case 'man':
          receipt = await supplyChain.methods.addProducer(address, name, place).send({ from: account })
          break
        case 'dis':
          receipt = await supplyChain.methods.addDistributor(address, name, place).send({ from: account })
          break
        case 'ret':
          receipt = await supplyChain.methods.addSeller(address, name, place).send({ from: account })
          break
        default:
          showNotification('Invalid role type selected', 'error')
          return
      }
      if (receipt) {
        showNotification('Role registered successfully!', 'success')
        loadBlockchainData()
        setNewRole({ address: '', name: '', place: '', type: 'rms' })
      }
    } catch (err: unknown) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-4 border-primary" />
          <h1 className="text-2xl font-bold text-foreground">Loading...</h1>
        </div>
      </div>
    )
  }

  const roleConfig = {
    rms: {
      label: 'Supplier',
      plural: 'Suppliers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      tableHeaderTint: 'border-blue-500/20 bg-blue-500/10 dark:bg-blue-500/15',
    },
    man: {
      label: 'Producer',
      plural: 'Producers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-600',
      tableHeaderTint: 'border-green-500/20 bg-green-500/10 dark:bg-green-500/15',
    },
    dis: {
      label: 'Distributor',
      plural: 'Distributors',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600',
      tableHeaderTint: 'border-purple-500/20 bg-purple-500/10 dark:bg-purple-500/15',
    },
    ret: {
      label: 'Seller',
      plural: 'Sellers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-orange-600',
      tableHeaderTint: 'border-orange-500/20 bg-orange-500/10 dark:bg-orange-500/15',
    },
  }

  return (
    <DashboardPageShell heading="Register Roles" subheading="Participant Management">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Register Roles</h1>
                <p className="text-muted-foreground text-sm">Assign roles to participants in the supply chain</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => router.push('/')}
            >
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

        {/* Owner Warning */}
        {!isOwner && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 shadow-sm dark:bg-red-500/15">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="mb-2 text-lg font-semibold text-foreground">Owner access required</h3>
                <p className="mb-2 text-sm text-muted-foreground">
                  Only the contract owner can register new participants.
                </p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <svg className="mr-2 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-foreground">Contract owner:</span>
                    <span className="ml-1 font-mono">{contractOwner || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="mr-2 h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-foreground">Your account:</span>
                    <span className="ml-1 font-mono">{currentAccount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle>Register New Role</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 bg-linear-to-r ${roleConfig[newRole.type as keyof typeof roleConfig].gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg text-white`}>
              {roleConfig[newRole.type as keyof typeof roleConfig].icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Register participant</h2>
              <p className="text-sm text-muted-foreground">Add a new participant with a supply-chain role</p>
            </div>
          </div>

          <form onSubmit={handleRoleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Role Type
              </label>
              <Select value={newRole.type} onValueChange={(value) => setNewRole((prev) => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rms">Supplier</SelectItem>
                  <SelectItem value="man">Producer</SelectItem>
                  <SelectItem value="dis">Distributor</SelectItem>
                  <SelectItem value="ret">Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ethereum Address
              </label>
              <Input
                type="text"
                name="address"
                placeholder="0x..."
                onChange={handleInputChange}
                value={newRole.address}
                required
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Name
              </label>
              <Input
                type="text"
                name="name"
                placeholder="Enter participant name"
                onChange={handleInputChange}
                value={newRole.name}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <Input
                type="text"
                name="place"
                placeholder="Enter location (e.g., City, Country)"
                onChange={handleInputChange}
                value={newRole.place}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={!isOwner}
              className="w-full"
            >
              {isOwner ? `Register ${roleConfig[newRole.type as keyof typeof roleConfig].label}` : 'Only Owner Can Register'}
            </Button>
          </form>
          </CardContent>
        </Card>

        {/* Registered Roles */}
        <div className="space-y-6">
          <h2 className="flex items-center text-2xl font-bold text-foreground">
            <svg className="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Registered Roles
          </h2>

          {(['rms', 'man', 'dis', 'ret'] as const).map((roleType) => {
            const config = roleConfig[roleType]
            const roleList = roles[roleType]
            const totalCount = roleList.length

            return (
              <div key={roleType} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-linear-to-r ${config.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{config.plural}</h3>
                      <p className="text-sm text-muted-foreground">{totalCount} registered</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{totalCount}</Badge>
                </div>

                {totalCount === 0 ? (
                  <div className="rounded-xl bg-muted/40 py-12 text-center">
                    <svg className="mx-auto mb-4 h-16 w-16 text-muted-foreground/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-lg text-muted-foreground">No {config.plural.toLowerCase()} registered yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">Register the first {config.label.toLowerCase()} using the form above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={`rounded-t-lg border-b ${config.tableHeaderTint}`}>
                          <th className="px-6 py-4 text-left text-sm font-bold text-foreground">ID</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Location</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {roleList.map((role, index) => (
                          <tr key={index} className="transition-colors hover:bg-muted/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className={`mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-r ${config.gradient} font-bold text-white shadow-md`}>
                                  {role.id}
                                </div>
                                <span className="font-semibold text-foreground">{role.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-foreground">{role.name}</td>
                            <td className="px-6 py-4 text-muted-foreground">
                              <div className="flex items-center">
                                <svg className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {role.place}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                                <svg className="mr-2 h-4 w-4 shrink-0 text-muted-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15l1.5 1.5M17 15l-1.5 1.5M9 5h6m-6 0v2m0-2a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2m-6 0V3m0 2v2" />
                                </svg>
                                {role.addr}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </DashboardPageShell>
  )
}
