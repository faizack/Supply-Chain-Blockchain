import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './client/src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 1337,
    },
    ganache: {
      url: 'http://127.0.0.1:7545',
      chainId: 1337, // Default Ganache chainId
      // Ganache provides pre-funded accounts, so we don't need to specify accounts here
      // Make sure Ganache is running and has accounts with funds
    },
    ganache5777: {
      url: 'http://127.0.0.1:7545',
      chainId: 5777, // Alternative Ganache chainId
      // For Ganache instances using chainId 5777
    },
  },
}

export default config

