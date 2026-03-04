'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadWeb3, getContract } from '@/lib/web3'
import { QRCodeCanvas } from 'qrcode.react'
import { parseTransactionError } from '@/lib/errorUtils'
import { showNotification } from '@/components/Notification'

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

interface Role {
  addr: string
  id: string
  name: string
  place: string
}

export default function Track() {
  const router = useRouter()
  const [currentAccount, setCurrentAccount] = useState('')
  const [loader, setLoader] = useState(true)
  const [supplyChain, setSupplyChain] = useState<any>(null)
  const [med, setMed] = useState<{ [key: number]: Medicine }>({})
  const [medStage, setMedStage] = useState<{ [key: number]: string }>({})
  const [id, setId] = useState('')
  const [rms, setRMS] = useState<{ [key: number]: Role }>({})
  const [man, setMAN] = useState<{ [key: number]: Role }>({})
  const [dis, setDIS] = useState<{ [key: number]: Role }>({})
  const [ret, setRET] = useState<{ [key: number]: Role }>({})
  const [trackTillSold, setTrackTillSold] = useState(false)
  const [trackTillRetail, setTrackTillRetail] = useState(false)
  const [trackTillDistribution, setTrackTillDistribution] = useState(false)
  const [trackTillManufacture, setTrackTillManufacture] = useState(false)
  const [trackTillRMS, setTrackTillRMS] = useState(false)
  const [trackTillOrdered, setTrackTillOrdered] = useState(false)

  useEffect(() => {
    loadWeb3()
    loadBlockchainData()
  }, [])

  const loadBlockchainData = async () => {
    try {
      setLoader(true)
      const { contract, account } = await getContract()
      setSupplyChain(contract)
      setCurrentAccount(account)

      const medCtr = await contract.methods.medicineCtr().call()
      const medData: { [key: number]: Medicine } = {}
      const medStageData: { [key: number]: string } = {}

      for (let i = 0; i < medCtr; i++) {
        medData[i + 1] = await contract.methods.MedicineStock(i + 1).call()
        medStageData[i + 1] = await contract.methods.showStage(i + 1).call()
      }

      setMed(medData)
      setMedStage(medStageData)

      const rmsCtr = await contract.methods.rmsCtr().call()
      const rmsData: { [key: number]: Role } = {}
      for (let i = 0; i < rmsCtr; i++) {
        rmsData[i + 1] = await contract.methods.RMS(i + 1).call()
      }
      setRMS(rmsData)

      const manCtr = await contract.methods.manCtr().call()
      const manData: { [key: number]: Role } = {}
      for (let i = 0; i < manCtr; i++) {
        manData[i + 1] = await contract.methods.MAN(i + 1).call()
      }
      setMAN(manData)

      const disCtr = await contract.methods.disCtr().call()
      const disData: { [key: number]: Role } = {}
      for (let i = 0; i < disCtr; i++) {
        disData[i + 1] = await contract.methods.DIS(i + 1).call()
      }
      setDIS(disData)

      const retCtr = await contract.methods.retCtr().call()
      const retData: { [key: number]: Role } = {}
      for (let i = 0; i < retCtr; i++) {
        retData[i + 1] = await contract.methods.RET(i + 1).call()
      }
      setRET(retData)

      setLoader(false)
    } catch (err: any) {
      console.error('Error loading blockchain data:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
      setLoader(false)
    }
  }

  if (loader) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-700">Loading...</h1>
        </div>
      </div>
    )
  }

  const handlerChangeID = (event: React.ChangeEvent<HTMLInputElement>) => {
    setId(event.target.value)
  }

  const trackMedicine = async (medicineId: number) => {
    try {
      const ctr = await supplyChain.methods.medicineCtr().call()
      if (!(medicineId > 0 && medicineId <= parseInt(ctr))) {
        showNotification('Invalid Battery ID!', 'error')
        return
      }
      
      if (!med[medicineId]) {
        showNotification('Battery data not found. Please wait for data to load.', 'warning')
        return
      }

      const stage = parseInt(med[medicineId].stage)
      setId(medicineId.toString())
      
      if (stage === 5) setTrackTillSold(true)
      else if (stage === 4) setTrackTillRetail(true)
      else if (stage === 3) setTrackTillDistribution(true)
      else if (stage === 2) setTrackTillManufacture(true)
      else if (stage === 1) setTrackTillRMS(true)
      else setTrackTillOrdered(true)
    } catch (err: any) {
      console.error('Error tracking medicine:', err)
      const parsedError = parseTransactionError(err)
      showNotification(parsedError.message, 'error')
    }
  }

  const handlerSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const medicineId = parseInt(id)
    if (isNaN(medicineId)) {
      showNotification('Please enter a valid Battery ID!', 'error')
      return
    }
    await trackMedicine(medicineId)
  }

  const resetTracking = () => {
    setTrackTillSold(false)
    setTrackTillRetail(false)
    setTrackTillDistribution(false)
    setTrackTillManufacture(false)
    setTrackTillRMS(false)
    setTrackTillOrdered(false)
    setId('')
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

  const TrackComponent = ({
    title,
    stages,
  }: {
    title: string
    stages: Array<{ label: string; data?: Role; showArrow?: boolean; icon?: JSX.Element }>
  }) => {
    const medicineId = parseInt(id)
    const batteryData = {
      id: med[medicineId]?.id,
      name: med[medicineId]?.name,
      description: med[medicineId]?.description,
      currentStage: medStage[medicineId],
    }

    return (
      <div className="max-w-6xl mx-auto">
        {/* Medicine Info Card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">Battery Information</h3>
                <p className="text-purple-100 text-sm">Track ID: {med[medicineId]?.id}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">Name</div>
              <div className="text-lg font-semibold">{med[medicineId]?.name}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">Description</div>
              <div className="text-lg font-semibold truncate">{med[medicineId]?.description}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-purple-100 mb-1">Current Stage</div>
              <div className="text-lg font-semibold">{medStage[medicineId]}</div>
            </div>
          </div>
        </div>

        {/* Supply Chain Timeline */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Supply Chain Journey
          </h4>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 hidden md:block"></div>
            
            <div className="space-y-8">
              {stages.map((stage, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                    {stage.icon || (
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content card */}
                  <div className="ml-6 flex-1 bg-gray-50 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h5 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      {stage.label}
                      {stage.data && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          ✓ Completed
                        </span>
                      )}
                    </h5>
                    {stage.data ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">ID</div>
                          <div className="font-semibold text-gray-800">{stage.data.id}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">Name</div>
                          <div className="font-semibold text-gray-800">{stage.data.name}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">Location</div>
                          <div className="font-semibold text-gray-800">{stage.data.place}</div>
                        </div>
                        <div className="md:col-span-3 bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-gray-500 mb-1">Address</div>
                          <div className="font-mono text-xs text-gray-700 break-all">{stage.data.addr}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <p className="text-yellow-800 font-medium">⏳ Not yet processed</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow connector */}
                  {stage.showArrow && index < stages.length - 1 && (
                    <div className="hidden md:block absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-purple-400 to-pink-400"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {trackTillOrdered && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h4 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR Code
            </h4>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <QRCodeCanvas 
                  value={JSON.stringify(batteryData)} 
                  size={250}
                  level="H"
                  includeMargin={true}
                />
                <p className="text-center text-sm text-gray-600 mt-4 font-semibold">
                  Scan to view battery details
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={resetTracking}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Track Another Item
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            HOME
          </button>
        </div>
      </div>
    )
  }

  if (trackTillSold) {
    const medicineId = parseInt(id)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
        <TrackComponent
          title="Sold"
          stages={[
            {
              label: 'Raw Materials Supplied by',
              data: rms[parseInt(med[medicineId]?.RMSid)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Manufactured by',
              data: man[parseInt(med[medicineId]?.MANid)],
              showArrow: true,
              icon: stageIcons.manufacture,
            },
            {
              label: 'Distributed by',
              data: dis[parseInt(med[medicineId]?.DISid)],
              showArrow: true,
              icon: stageIcons.distribute,
            },
            {
              label: 'Retailed by',
              data: ret[parseInt(med[medicineId]?.RETid)],
              showArrow: true,
              icon: stageIcons.retail,
            },
            { 
              label: 'Sold to Consumer', 
              showArrow: false,
              icon: stageIcons.sold,
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillRetail) {
    const medicineId = parseInt(id)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
        <TrackComponent
          title="Retail"
          stages={[
            {
              label: 'Raw Materials Supplied by',
              data: rms[parseInt(med[medicineId]?.RMSid)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Manufactured by',
              data: man[parseInt(med[medicineId]?.MANid)],
              showArrow: true,
              icon: stageIcons.manufacture,
            },
            {
              label: 'Distributed by',
              data: dis[parseInt(med[medicineId]?.DISid)],
              showArrow: true,
              icon: stageIcons.distribute,
            },
            {
              label: 'Retailed by',
              data: ret[parseInt(med[medicineId]?.RETid)],
              showArrow: false,
              icon: stageIcons.retail,
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillDistribution) {
    const medicineId = parseInt(id)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
        <TrackComponent
          title="Distribution"
          stages={[
            {
              label: 'Raw Materials Supplied by',
              data: rms[parseInt(med[medicineId]?.RMSid)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Manufactured by',
              data: man[parseInt(med[medicineId]?.MANid)],
              showArrow: true,
              icon: stageIcons.manufacture,
            },
            {
              label: 'Distributed by',
              data: dis[parseInt(med[medicineId]?.DISid)],
              showArrow: false,
              icon: stageIcons.distribute,
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillManufacture) {
    const medicineId = parseInt(id)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
        <TrackComponent
          title="Manufacture"
          stages={[
            {
              label: 'Raw Materials Supplied by',
              data: rms[parseInt(med[medicineId]?.RMSid)],
              showArrow: true,
              icon: stageIcons.rms,
            },
            {
              label: 'Manufactured by',
              data: man[parseInt(med[medicineId]?.MANid)],
              showArrow: false,
              icon: stageIcons.manufacture,
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillRMS) {
    const medicineId = parseInt(id)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
        <TrackComponent
          title="RMS"
          stages={[
            {
              label: 'Raw Materials Supplied by',
              data: rms[parseInt(med[medicineId]?.RMSid)],
              showArrow: false,
              icon: stageIcons.rms,
            },
          ]}
        />
      </div>
    )
  }

  if (trackTillOrdered) {
    const medicineId = parseInt(id)
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
        <TrackComponent
          title="Ordered"
          stages={[
            {
              label: 'Battery Not Yet Processed...',
              showArrow: false,
            },
          ]}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Track Materials</h1>
                <p className="text-gray-600 text-sm">Monitor your battery journey through the supply chain</p>
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

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center mb-6">
            <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Enter Battery ID to Track</h2>
          </div>
          <form onSubmit={handlerSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                type="text"
                onChange={handlerChangeID}
                placeholder="Enter Battery ID (e.g., 1, 2, 3...)"
                value={id}
                required
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Track
            </button>
          </form>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Available Batteries
            </h2>
            <div className="text-sm text-gray-500">
              Total: {Object.keys(med).length} items
            </div>
          </div>
          
          {Object.keys(med).length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-lg">No batteries available yet</p>
              <p className="text-gray-400 text-sm mt-2">Add batteries in the Order Materials page</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Current Stage</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.keys(med).map((key) => {
                    const medicineId = parseInt(key)
                    const stage = medStage[medicineId]
                    const getStageColor = (stage: string) => {
                      if (stage.includes('Ordered')) return 'bg-blue-100 text-blue-700'
                      if (stage.includes('Raw Material')) return 'bg-green-100 text-green-700'
                      if (stage.includes('Manufacturing')) return 'bg-yellow-100 text-yellow-700'
                      if (stage.includes('Distribution')) return 'bg-purple-100 text-purple-700'
                      if (stage.includes('Retail')) return 'bg-orange-100 text-orange-700'
                      if (stage.includes('Sold')) return 'bg-gray-100 text-gray-700'
                      return 'bg-gray-100 text-gray-700'
                    }
                    return (
                      <tr key={key} className="hover:bg-purple-50 transition-colors cursor-pointer" onClick={() => trackMedicine(medicineId)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                              {med[medicineId].id}
                            </div>
                            <span className="font-semibold text-gray-800">{med[medicineId].id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">{med[medicineId].name}</td>
                        <td className="px-6 py-4 text-gray-600">{med[medicineId].description}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(stage)}`}>
                            {stage}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              trackMedicine(medicineId)
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all text-sm font-semibold flex items-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
