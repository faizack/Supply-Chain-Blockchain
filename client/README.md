# Supply Chain Blockchain - Next.js Frontend

This is a Next.js application with TypeScript and Tailwind CSS for managing a blockchain-based supply chain.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask browser extension

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
client/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home page
│   │   ├── roles/        # Assign roles page
│   │   ├── addmed/       # Add medicine page
│   │   ├── supply/       # Supply chain flow page
│   │   └── track/        # Track medicine page
│   ├── lib/              # Utility functions
│   │   └── web3.ts       # Web3 integration
│   └── artifacts/        # Smart contract ABIs
├── public/               # Static assets
└── package.json
```

## Features

- **Home Page**: Navigation hub with links to all features
- **Register Roles**: Assign roles (Raw Material Supplier, Manufacturer, Distributor, Retailer)
- **Order Materials**: Add new medicine orders
- **Supply Materials**: Manage supply chain flow (supply, manufacture, distribute, retail, sell)
- **Track Materials**: Track medicine through the supply chain with QR codes

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Web3.js**: Ethereum blockchain interaction
- **QRCode.react**: QR code generation

## Building for Production

```bash
npm run build
npm start
```

## Notes

- Make sure your smart contract is deployed and the network ID matches in `SupplyChain.json`
- Connect MetaMask to the correct network before using the application
- Only the contract owner can assign roles and add medicines
