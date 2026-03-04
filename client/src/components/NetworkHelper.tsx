'use client'

import { useState, useEffect } from 'react'
import { showNotification } from './Notification'
import { switchToNetwork } from '@/lib/web3'
import deployments from '../deployments.json'

export default function NetworkHelper() {
  const [showHelper, setShowHelper] = useState(false)
  const [currentNetwork, setCurrentNetwork] = useState<string>('')

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          const networkId = await window.ethereum.request({ method: 'eth_chainId' })
          const chainId = parseInt(networkId, 16).toString()
          setCurrentNetwork(chainId)
          
          // Show helper if NOT on a network where we have deployments
          const availableNetworks = Object.keys(deployments.networks)
          if (!availableNetworks.includes(chainId)) {
            setShowHelper(true)
          }
        } catch (err) {
          console.error('Error checking network:', err)
        }
      }
    }

    checkNetwork()

    // Listen for network changes
    if (window.ethereum) {
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', () => {
          window.location.reload()
        })
      }
    }
  }, [])

  const handleSwitchNetwork = async () => {
    try {
      // Switch to the first available network (usually 1337)
      const availableNetworks = Object.keys(deployments.networks)
      if (availableNetworks.length > 0) {
        await switchToNetwork(availableNetworks[0])
        setShowHelper(false)
        window.location.reload()
      }
    } catch (err: any) {
      showNotification(`Failed to switch network: ${err?.message || 'Unknown error'}`, 'error')
    }
  }

  if (!showHelper) return null

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">Wrong Network</h3>
          <p className="mt-1 text-sm">
            You&apos;re connected to network {currentNetwork || 'unknown'}. The contract is deployed on network 1337. Please switch to network 1337 or deploy the contract to network {currentNetwork}.
          </p>
          <div className="mt-3">
            <button
              onClick={handleSwitchNetwork}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded text-sm"
            >
              Switch to Network 1337
            </button>
            <button
              onClick={() => setShowHelper(false)}
              className="ml-2 text-yellow-700 hover:text-yellow-900 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

