import { getActiveAccount, getContract } from './web3'

export const checkIsOwner = async (): Promise<boolean> => {
  try {
    const { contract } = await getContract()
    const account = await getActiveAccount()
    const owner = await contract.methods.owner().call()
    return owner.toLowerCase() === account.toLowerCase()
  } catch (err) {
    console.error('Error checking owner:', err)
    return false
  }
}

export const getContractOwner = async (): Promise<string | null> => {
  try {
    const { contract } = await getContract()
    const owner = await contract.methods.owner().call()
    return owner
  } catch (err) {
    console.error('Error getting owner:', err)
    return null
  }
}

