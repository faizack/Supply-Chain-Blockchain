'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { checkIsOwner, getContractOwner } from '@/lib/contractUtils'
import { parseTransactionError } from '@/lib/errorUtils'
import { showNotification } from '@/components/Notification'

interface Role {
  addr: string
  id: string
  name: string
  place: string
}

export default function AssignRoles() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loading, setLoading] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
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

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoading(true)
      const { contract, account } = await getContract()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const rmsCount = await contract.methods.rmsCtr().call()
      const manCount = await contract.methods.manCtr().call()
      const disCount = await contract.methods.disCtr().call()
      const retCount = await contract.methods.retCtr().call()

      const rms = await Promise.all(
        Array(parseInt(rmsCount))
          .fill(null)
          .map((_, i) => contract.methods.RMS(i + 1).call())
      )
      const man = await Promise.all(
        Array(parseInt(manCount))
          .fill(null)
          .map((_, i) => contract.methods.MAN(i + 1).call())
      )
      const dis = await Promise.all(
        Array(parseInt(disCount))
          .fill(null)
          .map((_, i) => contract.methods.DIS(i + 1).call())
      )
      const ret = await Promise.all(
        Array(parseInt(retCount))
          .fill(null)
          .map((_, i) => contract.methods.RET(i + 1).call())
      )

      setRoles({ rms, man, dis, ret })
      
      // Check if current account is the owner
      const ownerStatus = await checkIsOwner()
      setIsOwner(ownerStatus)
      const owner = await getContractOwner()
      if (owner) setContractOwner(owner)
      
      setLoading(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoading(false)
    }
  }

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
      let receipt
      switch (type) {
        case 'rms':
          receipt = await supplyChain.methods.addRMS(address, name, place).send({ from: currentAccount })
          break
        case 'man':
          receipt = await supplyChain.methods.addManufacturer(address, name, place).send({ from: currentAccount })
          break
        case 'dis':
          receipt = await supplyChain.methods.addDistributor(address, name, place).send({ from: currentAccount })
          break
        case 'ret':
          receipt = await supplyChain.methods.addRetailer(address, name, place).send({ from: currentAccount })
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
    } catch (err: any) {
      console.error('Transaction error:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Loading...</h1>
        </div>
      </div>
    )
  }

  const roleConfig = {
    rms: {
      label: 'Raw Material Supplier',
      plural: 'Raw Material Suppliers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-500',
    },
    man: {
      label: 'Manufacturer',
      plural: 'Manufacturers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-500',
    },
    dis: {
      label: 'Distributor',
      plural: 'Distributors',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-500',
    },
    ret: {
      label: 'Retailer',
      plural: 'Retailers',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-500',
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Register Roles</h1>
                <p className="text-gray-600 text-sm">Assign roles to participants in the supply chain</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              HOME
            </button>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Account: {currentAccount}
          </div>
        </div>

        {/* Owner Warning */}
        {!isOwner && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-red-500">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Owner Access Required</h3>
                <p className="text-red-700 text-sm mb-2">
                  Only the contract owner can register new roles in the supply chain.
                </p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center text-red-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Contract Owner: <span className="font-mono ml-1">{contractOwner || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center text-red-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Account: <span className="font-mono ml-1">{currentAccount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className={`bg-gradient-to-br ${roleConfig[newRole.type as keyof typeof roleConfig].bgGradient} rounded-2xl shadow-xl p-8 mb-6 border-l-4 ${roleConfig[newRole.type as keyof typeof roleConfig].borderColor}`}>
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 bg-gradient-to-r ${roleConfig[newRole.type as keyof typeof roleConfig].gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg text-white`}>
              {roleConfig[newRole.type as keyof typeof roleConfig].icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Register New Role</h2>
              <p className="text-gray-600 text-sm">Add a new participant to the supply chain</p>
            </div>
          </div>

          <form onSubmit={handleRoleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Role Type
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white appearance-none cursor-pointer"
                  name="type"
                  onChange={handleInputChange}
                  value={newRole.type}
                  required
                >
                  <option value="rms">Raw Material Supplier</option>
                  <option value="man">Manufacturer</option>
                  <option value="dis">Distributor</option>
                  <option value="ret">Retailer</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Ethereum Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15l1.5 1.5M17 15l-1.5 1.5M9 5h6m-6 0v2m0-2a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2m-6 0V3m0 2v2" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white font-mono text-sm"
                  type="text"
                  name="address"
                  placeholder="0x..."
                  onChange={handleInputChange}
                  value={newRole.address}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                  type="text"
                  name="name"
                  placeholder="Enter participant name"
                  onChange={handleInputChange}
                  value={newRole.name}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                  type="text"
                  name="place"
                  placeholder="Enter location (e.g., City, Country)"
                  onChange={handleInputChange}
                  value={newRole.place}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isOwner}
              className={`w-full px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform ${
                isOwner
                  ? `bg-gradient-to-r ${roleConfig[newRole.type as keyof typeof roleConfig].gradient} text-white hover:scale-105 cursor-pointer`
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              } flex items-center justify-center`}
            >
              {isOwner ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Register {roleConfig[newRole.type as keyof typeof roleConfig].label}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Only Owner Can Register
                </>
              )}
            </button>
          </form>
        </div>

        {/* Registered Roles */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Registered Roles
          </h2>

          {(['rms', 'man', 'dis', 'ret'] as const).map((roleType) => {
            const config = roleConfig[roleType]
            const roleList = roles[roleType]
            const totalCount = roleList.length

            return (
              <div key={roleType} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${config.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{config.plural}</h3>
                      <p className="text-sm text-gray-500">{totalCount} registered</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 bg-gradient-to-r ${config.bgGradient} rounded-lg border ${config.borderColor} border-2`}>
                    <span className="text-sm font-bold text-gray-700">{totalCount}</span>
                  </div>
                </div>

                {totalCount === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No {config.plural.toLowerCase()} registered yet</p>
                    <p className="text-gray-400 text-sm mt-2">Register the first {config.label.toLowerCase()} using the form above</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className={`bg-gradient-to-r ${config.bgGradient}`}>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Location</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Ethereum Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {roleList.map((role, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 bg-gradient-to-r ${config.gradient} rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-md`}>
                                  {role.id}
                                </div>
                                <span className="font-semibold text-gray-800">{role.id}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-800">{role.name}</td>
                            <td className="px-6 py-4 text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {role.place}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center font-mono text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  )
}
