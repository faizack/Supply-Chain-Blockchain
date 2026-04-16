import Web3 from 'web3'
import { SupplyChainArtifact } from './contracts'
import deployments from '../deployments.json'

declare global {
  interface Window {
    ethereum?: any
    web3?: Web3
  }
}

export const loadWeb3 = async (): Promise<void> => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum)
    await window.ethereum.request({ method: 'eth_requestAccounts' })
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider)
  } else {
    window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
  }
}

export const getContract = async () => {
  if (!window.web3) {
    await loadWeb3()
  }

  const web3 = window.web3!
  const accounts = await web3.eth.getAccounts()
  // Use EIP-155 chainId (NOT "network id") to match deployments.json keys.
  // Ganache commonly reports network id 5777 while chainId is 1337 (or vice versa).
  const chainId = await web3.eth.getChainId()
  const chainIdStr = chainId.toString()
  const networkData = deployments.networks[chainIdStr as keyof typeof deployments.networks]

  if (networkData && networkData.SupplyChain && networkData.SupplyChain.address) {
    const contract = new web3.eth.Contract(SupplyChainArtifact.abi as any, networkData.SupplyChain.address)
    return { contract, account: accounts[0], web3 }
  } else {
    // Get available networks from deployments
    const availableNetworks = Object.keys(deployments.networks).join(', ')
    throw new Error(
      `Contract not found on chainId ${chainIdStr}.\n\n` +
      `Available networks: ${availableNetworks}\n` +
      `Please switch MetaMask to one of these networks or deploy the contract to chainId ${chainIdStr}.\n\n` +
      `To deploy: npx hardhat run scripts/deploy.ts --network <network>`
    )
  }
}

export const switchToNetwork = async (chainId: string | number) => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed')
  }

  const chainIdNum = Number(chainId)
  const chainIdHex = `0x${chainIdNum.toString(16)}`
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      // Try to add the network
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: chainIdNum === 1337 || chainIdNum === 5777 ? 'Ganache Local' : 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: chainIdNum === 1337 || chainIdNum === 5777
                ? ['http://127.0.0.1:7545'] 
                : ['http://127.0.0.1:8545'],
            },
          ],
        })
      } catch (addError) {
        throw new Error('Failed to add network to MetaMask')
      }
    } else {
      throw switchError
    }
  }
}

