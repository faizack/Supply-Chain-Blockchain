# Supply Chain Blockchain

A blockchain-based supply chain management system built with Hardhat, Next.js, TypeScript, and Tailwind CSS.

## Project Structure

```
Supply-Chain-Blockchain/
├── contracts/          # Solidity smart contracts
├── scripts/            # Hardhat deployment scripts
├── ignition/           # Hardhat Ignition modules
├── test/               # Test files
├── client/             # Next.js frontend application
└── hardhat.config.ts   # Hardhat configuration
```

## Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client
npm install
```

## Smart Contract Development

### Compile Contracts

```bash
npm run compile
```

### Deploy Contracts

Deploy to Hardhat Network (default):
```bash
npm run deploy
```

Deploy to local Hardhat node:
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy to localhost
npm run deploy:local
```

Deploy to Ganache:
```bash
npm run deploy:ganache
```

After deployment, update `client/src/deployments.json` with the deployed contract address.

### Run Tests

```bash
npm test
```

## Frontend Development

1. Navigate to the client directory:
```bash
cd client
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Hardhat Networks

The project is configured with the following networks:
- `hardhat`: Local Hardhat Network (chainId: 1337)
- `localhost`: Connect to a running Hardhat node (chainId: 1337)
- `ganache`: Connect to Ganache at `http://127.0.0.1:7545` (chainId: **1337**)
- `ganache5777`: Same RPC URL if your Ganache workspace uses chain ID **5777**

### Contract Deployment

After deploying the contract, you need to update the deployment address in `client/src/deployments.json`:

```json
{
  "networks": {
    "1337": {
      "SupplyChain": {
        "address": "0xYourDeployedAddress"
      }
    }
  }
}
```

## Features

- **Register Roles**: Assign roles (Raw Material Supplier, Manufacturer, Distributor, Retailer)
- **Order Materials**: Add new medicine orders
- **Supply Materials**: Manage supply chain flow
- **Track Materials**: Track medicine through the supply chain with QR codes

## Technology Stack

### Smart Contracts
- **Hardhat**: Development environment
- **Solidity**: Smart contract language
- **TypeScript**: Type-safe development

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Web3.js**: Ethereum blockchain interaction

## License

MIT
