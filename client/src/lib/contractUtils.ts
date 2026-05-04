import { getActiveAccount, getContract } from './web3'

export const checkIsOwner = async (): Promise<boolean> => {
  try {
    const { contract } = await getContract()
    const account = await getActiveAccount()
    const owner = String(await contract.methods.owner().call())
    return owner.toLowerCase() === account.toLowerCase()
  } catch (err) {
    console.error('Error checking owner:', err)
    return false
  }
}

export const getContractOwner = async (): Promise<string | null> => {
  try {
    const { contract } = await getContract()
    return String(await contract.methods.owner().call())
  } catch (err) {
    console.error('Error getting owner:', err)
    return null
  }
}

/** True if the active wallet is registered as a producer on the contract. */
export const checkIsRegisteredProducer = async (): Promise<boolean> => {
  try {
    const { contract } = await getContract()
    const account = (await getActiveAccount()).toLowerCase()
    const count = Number(await contract.methods.producerCtr().call())
    for (let i = 1; i <= count; i++) {
      const row = (await contract.methods.PRODUCERS(i).call()) as { addr?: string }
      if (String(row.addr).toLowerCase() === account) return true
    }
    return false
  } catch (err) {
    console.error('Error checking producer registration:', err)
    return false
  }
}

