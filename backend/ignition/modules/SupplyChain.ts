import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const SupplyChainModule = buildModule('SupplyChainModule', (m) => {
  const supplyChain = m.contract('SupplyChain')

  return { supplyChain }
})

export default SupplyChainModule

