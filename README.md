# Supply Chain Blockchain DApp

<div align="center">

![Supply Chain Blockchain](client/public/supplychainlogo.png)

**A decentralized supply chain management system built on Ethereum blockchain using Solidity smart contracts, Next.js, and Web3.js**

[![CI](https://github.com/faizack/Supply-Chain-Blockchain/actions/workflows/ci.yml/badge.svg)](https://github.com/faizack/Supply-Chain-Blockchain/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/faizack/Supply-Chain-Blockchain?style=social)](https://github.com/faizack/Supply-Chain-Blockchain/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-FFF1E2?logo=hardhat&logoColor=black)](https://hardhat.org/)

[Star](https://github.com/faizack/Supply-Chain-Blockchain) • [Fork](https://github.com/faizack/Supply-Chain-Blockchain/fork) • [Report Bug](https://github.com/faizack/Supply-Chain-Blockchain/issues) • [Request Feature](https://github.com/faizack/Supply-Chain-Blockchain/issues)

</div>

---

<!--
## 🎥 Demo

Watch the demo video: [Canva Design Demo](https://www.canva.com/design/DAFb-i9v_cM/-fK0pKTuOkFq5dfCPQxh_w/watch?utm_content=DAFb-i9v_cM&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink)
-->

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Setting up Ganache (step by step)](#setting-up-ganache-step-by-step)
- [Troubleshooting](#troubleshooting)
- [Running the Project](#-running-the-project)
- [Usage Guide](#-usage-guide)
- [Smart Contract Details](#-smart-contract-details)
- [Contributing](#-contributing)
- [License](#-license)

## Overview

**Supply Chain Blockchain DApp** is an open-source, blockchain-based supply chain management application built with Solidity smart contracts, Hardhat, Next.js, Web3.js, and MetaMask. It demonstrates how to build an end-to-end Ethereum decentralized application (dApp) for transparent, secure, and traceable pharmaceutical supply chains.



<!-- ## Demo and Screenshots

> A short GIF of adding a medicine and tracking it will be added here.

- **Home Dashboard** – overview of the supply chain and navigation  
  _Screenshot placeholder (add `client/public/home.png` and update this line to embed it)._
- **Order Materials** – owner creates a new material order  
  _Screenshot placeholder (add `client/public/order-materials.png`)._
- **Track Materials** – full lifecycle view with QR code  
  _Screenshot placeholder (add `client/public/track-materials.png`)._ -->

### Key Benefits

- **Transparency**: All transactions and product movements are recorded on the blockchain
- **Security**: Immutable records prevent tampering and fraud
- **Efficiency**: Automated processes reduce administrative overhead
- **Traceability**: Complete product journey from raw materials to consumer
- **Decentralization**: No single point of failure

## Features

- **Role-Based Access Control**: Secure role assignment (Owner, Raw Material Supplier, Manufacturer, Distributor, Retailer)
- **Product Management**: Add and track products through the entire supply chain
- **Supply Chain Flow**: Manage product stages (Order → Raw Material Supply → Manufacturing → Distribution → Retail → Sold)
- **Real-Time Tracking**: Track products with detailed stage information and QR codes
- **Modern UI**: Responsive interface built with Next.js and Tailwind CSS
- **Web3 Integration**: Seamless connection with MetaMask wallet
- **Mobile Responsive**: Works well on desktop and mobile devices

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Web3.js** - Ethereum blockchain interaction
- **QRCode.react** - QR code generation for product tracking

### Backend/Blockchain
- **Solidity ^0.8.19** - Smart contract programming language
- **Hardhat** - Ethereum development environment
- **Ganache** - Personal blockchain for development
- **MetaMask** - Web3 wallet integration

### Development Tools
- **Node.js 18+** - JavaScript runtime
- **npm/yarn** - Package management
- **Git** - Version control

## Architecture


![System Architecture](assets/system%20design.png)

The application follows a decentralized architecture where:

1. **Smart Contracts** (Solidity) handle all business logic and data storage on the blockchain
2. **Frontend** (Next.js) provides the user interface and interacts with the blockchain via Web3.js
3. **MetaMask** acts as the bridge between users and the Ethereum network
4. **Ganache** provides a local blockchain for development and testing

### System Flow

```
User → Next.js Frontend → Web3.js → MetaMask → Ethereum Network → Smart Contract
```



### Supply Chain Flow

The product journey through the supply chain:

```
Order → Raw Material Supplier → Manufacturer → Distributor → Retailer → Consumer
```

![Supply Chain Flow](https://cdn-wordpress-info.futurelearn.com/info/wp-content/uploads/8d54ad89-e86f-4d7c-8208-74455976a4a9-2-768x489.png)

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)
- **Ganache** - [Download](https://trufflesuite.com/ganache/)
- **MetaMask** - [Chrome Extension](https://chrome.google.com/webstore/detail/metamask) | [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)
- **VS Code** (Recommended) - [Download](https://code.visualstudio.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/faizack619/Supply-Chain-Blockchain.git
cd Supply-Chain-Blockchain
```

### Step 2: Install Dependencies

Install root dependencies (for Hardhat):

```bash
cd backend
npm install
cd ..
```

Install client dependencies:

```bash
cd client
npm install
cd ..
```

### Step 3: Configure Ganache

Follow the detailed walkthrough: **[Setting up Ganache (step by step)](#setting-up-ganache-step-by-step)**. In short, use **RPC** `http://127.0.0.1:7545` and **chain ID** **1337** so they match `backend/hardhat.config.ts` (`networks.ganache`) and the keys in `client/src/deployments.json`.

## Setting up Ganache (step by step)

This project’s default Hardhat network `ganache` uses **`http://127.0.0.1:7545`** and **chain ID `1337`**. MetaMask, Ganache, and Hardhat must all use the **same** RPC URL and **chain ID** (EIP-155), or you will see “wrong network” or “contract not found”.

### A. Ganache Desktop (recommended)

1. **Install Ganache**  
   Download and install [Ganache](https://trufflesuite.com/ganache/) (Truffle Suite).

2. **Create a workspace**  
   Open Ganache → **New Workspace** (or open an existing workspace). A workspace persists accounts and settings across restarts; **Quickstart** resets when you close the app.

3. **Open workspace settings**  
   Click the **gear / Settings** icon for the workspace.

4. **Server (host and port)**  
   In **Server** (sometimes **HOST & PORT**):
   - **HOSTNAME**: `127.0.0.1` (use this in MetaMask on the same machine).
   - **PORT**: `7545`  
   This must match `networks.ganache.url` in `backend/hardhat.config.ts` (`http://127.0.0.1:7545`).

5. **Chain ID**  
   Set **Chain ID** (or **EIP-155 Chain ID**, depending on your Ganache version) to **`1337`**.  
   If the UI only shows **NETWORK ID**, set it to **`1337`** for this repo so it stays consistent with Hardhat’s `ganache` network and the frontend’s default deployment entry.

6. **Save and restart**  
   Save settings and **restart** the workspace if Ganache prompts you.

7. **Confirm RPC**  
   On the main **Accounts** (or **CONTRACTS**) screen, check that the **RPC SERVER** is `http://127.0.0.1:7545` (or equivalent with `127.0.0.1` and port `7545`).

8. **Deployer account**  
   Hardhat uses Ganache’s **first account** by default when you deploy without a custom `accounts` config. In MetaMask, import that account’s **private key** (key icon in Ganache) if you need to act as the contract **owner**.

**After you change chain ID or reset the chain:** redeploy the contract (`npx hardhat run scripts/deploy.ts --network ganache` from `backend`) so `client/src/deployments.json` gets a valid address for the current chain.

### B. Ganache CLI (optional)

If you use the [Ganache CLI](https://github.com/trufflesuite/ganache) instead of the desktop app, start a node that matches the same host, port, and chain ID:

```bash
npx ganache --host 127.0.0.1 --port 7545 --chain.chainId 1337
```

Leave this process running, then deploy from `backend` with `--network ganache` as usual.

### Using chain ID 5777 instead

If your Ganache instance must use **chain ID `5777`**, use Hardhat’s `ganache5777` network and deploy with:

```bash
cd backend
npx hardhat run scripts/deploy.ts --network ganache5777
```

Ensure MetaMask’s **Chain ID** is **5777** and that `client/src/deployments.json` includes a `"5777"` entry after deploy.

### Step 4: Configure Hardhat

Update `backend/hardhat.config.ts` with your Ganache network settings (default RPC `http://127.0.0.1:7545` and chain ID **1337**):

```typescript
networks: {
  ganache: {
    url: "http://127.0.0.1:7545", // Your Ganache RPC URL
    chainId: 1337, // Your Ganache Chain ID
    accounts: {
      mnemonic: "your ganache mnemonic" // Optional: if using mnemonic
    }
  }
}
```

### Step 5: Deploy Smart Contracts

All Hardhat commands must be run from the **`backend`** folder (where `hardhat.config.ts` lives).

Compile the smart contracts:

```bash
cd backend
npx hardhat compile
```

Deploy to Ganache:

```bash
cd backend
npx hardhat run scripts/deploy.ts --network ganache
```

The deployment script will automatically update `client/src/deployments.json` with the contract address.

### Step 6: Ganache RPC & MetaMask setup (with screenshots)

Use the same **RPC URL** and **chain ID** everywhere: Ganache, `backend/hardhat.config.ts`, MetaMask, and `client/src/deployments.json` (defaults: `http://127.0.0.1:7545`, chain ID **1337**). Images are in [`assets/`](assets/).

**1. Read the RPC server URL from Ganache**  
You will paste this into MetaMask in the next step.

<p align="center">
  <img src="assets/rpc-url.png" alt="Ganache RPC server URL" width="720">
</p>

**2. Add the network in MetaMask**  
Network menu → **Add network** → **Add a network manually**, then set:

- **Network name:** e.g. `Ganache Local`
- **RPC URL:** same as Ganache (e.g. `http://127.0.0.1:7545`)
- **Chain ID:** `1337` (must match Ganache and Hardhat `networks.ganache`)
- **Currency symbol:** `ETH`

Save and **select this network** before using the app.

<p align="center">
  <img src="assets/add-network-wallet.png" alt="MetaMask add custom network" width="720">
</p>

**3. Copy the deployer private key from Ganache**  
Hardhat deploys with Ganache’s **first account** by default. That address is the contract **owner** (Register Roles, Order Materials). Copy its private key from the key icon.

<p align="center">
  <img src="assets/ganache-copy-private-key.jpg" alt="Copy private key from Ganache" width="720">
</p>

**4. Import the account in MetaMask**  
Account menu → **Import account** → paste the private key → **Import**. Keep this account selected when acting as owner.

<p align="center">
  <img src="assets/import-account.png" alt="Import account in MetaMask" width="720">
</p>

**5. Run the app**  
From `client`: `npm run dev` → open [http://localhost:3000](http://localhost:3000). The deploy log line `Deploying with account: 0x...` must match the **active** MetaMask account for owner-only actions.

## Troubleshooting

**Chain ID `5777` vs `1337`:** Some docs confuse **network ID** with **chain ID** (EIP-155). This project expects **chain ID** to match everywhere. If Ganache uses **5777**, deploy with `npx hardhat run scripts/deploy.ts --network ganache5777` from `backend` and ensure `client/src/deployments.json` has a `"5777"` entry after deploy.

| Symptom | What to check |
|--------|----------------|
| **Only owner can do this** | Active MetaMask account must be the **same address** that deployed the contract (see deploy log). Import that account from Ganache if needed. |
| **Contract not found** / wrong network banner | Chain ID in MetaMask must match the key in `client/src/deployments.json`. After resetting Ganache, **redeploy** — old addresses are invalid. |
| **1337 in settings but 5777 in console** | You were likely reading **network ID** vs **chain ID**. Align **chain ID** everywhere; redeploy after changing Ganache. |
| **Transaction fails or wrong balance** | RPC URL in MetaMask must point to the **same** Ganache instance (correct host/port). |

## Running the Project

If you already followed **Installation**, you only need:

1. Ganache running with the same RPC/chain ID as **`backend/hardhat.config.ts`** (see **[Setting up Ganache (step by step)](#setting-up-ganache-step-by-step)**).
2. Deploy (if needed): `cd backend && npx hardhat run scripts/deploy.ts --network ganache`
3. Frontend: `cd client && npm run dev` → [http://localhost:3000](http://localhost:3000)

**Production build:** `cd client && npm run build && npm start`

## Usage Guide

### 1. Register Roles

- Navigate to "Register Roles" page
- Only the contract owner can register new roles
- Add participants: Raw Material Suppliers, Manufacturers, Distributors, and Retailers
- Each role requires: Ethereum address, name, and location

### 2. Order Materials

- Go to "Order Materials" page
- Only the contract owner can create orders
- Enter product details: ID, name, and description
- Ensure at least one participant of each role is registered

### 3. Manage Supply Chain Flow

- Access "Supply Chain Flow" page
- Each role can perform their specific action:
  - **Raw Material Supplier**: Supply raw materials
  - **Manufacturer**: Manufacture products
  - **Distributor**: Distribute products
  - **Retailer**: Retail and mark as sold

### 4. Track Products

- Visit "Track Materials" page
- Enter a product ID to view its complete journey
- View detailed information about each stage
- Generate QR codes for product verification

## Smart Contract Details

The `SupplyChain.sol` smart contract implements a supply chain for the **pharmaceutical** domain: it tracks medicine **stages**, stores names, descriptions, and current stage, and defines **roles** (raw material supplier, manufacturer, distributor, retailer). The **owner** registers participants and creates orders; other functions advance the product and **read** stage and history.


### Roles

- **Owner**: Deploys the contract and can register other roles
- **Raw Material Supplier (RMS)**: Supplies raw materials
- **Manufacturer (MAN)**: Manufactures products
- **Distributor (DIS)**: Distributes products
- **Retailer (RET)**: Sells products to consumers

### Product Stages

1. **Ordered** (Stage 0): Product order created
2. **Raw Material Supplied** (Stage 1): Raw materials supplied
3. **Manufacturing** (Stage 2): Product being manufactured
4. **Distribution** (Stage 3): Product in distribution
5. **Retail** (Stage 4): Product at retailer
6. **Sold** (Stage 5): Product sold to consumer

### Key Functions

- `addRMS()`, `addManufacturer()`, `addDistributor()`, `addRetailer()`: Register participants
- `addMedicine()`: Create new product orders
- `RMSsupply()`, `Manufacturing()`, `Distribute()`, `Retail()`, `sold()`: Progress products through stages
- `showStage()`: Get current stage of a product

![Smart Contract Flow](https://raw.githubusercontent.com/faizack619/Supply-Chain-Gode-Blockchain/master/client/public/Supply%20Chain%20Design%20(1).png)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Read the full [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request
- Follow the project [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Look for issues labeled `good first issue` or `help wanted` if you’re new to the project

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Documentation

### External Resources

- [Solidity Documentation](https://docs.soliditylang.org/en/v0.8.19/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ganache Documentation](https://trufflesuite.com/docs/ganache/overview)
- [MetaMask Documentation](https://docs.metamask.io/)



## Show Your Support

If you find this project helpful, please consider:

- Starring the repository
- Forking the project
- Reporting bugs
- Suggesting new features
- Sharing the repository with others

---

<div align="center">

**Made with Solidity, Next.js, and Web3**

[Back to Top](#supply-chain-blockchain-dapp)

</div>
