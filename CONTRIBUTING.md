# Contributing to Supply Chain Blockchain

First off, thank you for taking the time to contribute! 🎉  
This project aims to be a clear, production-like example of a blockchain-based supply chain system using Solidity, Hardhat, Next.js, and Web3.

## How to Get Started

### 1. Fork & Clone

1. Fork the repository to your GitHub account.
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/Supply-Chain-Blockchain.git
cd Supply-Chain-Blockchain
```

3. Add the upstream remote (optional but recommended):

```bash
git remote add upstream https://github.com/faizack/Supply-Chain-Blockchain.git
```

### 2. Set Up the Development Environment

**Requirements:**

- Node.js 18+
- npm (or yarn)
- Ganache (or Hardhat network)
- MetaMask

**Install dependencies:**

```bash
# Backend (Hardhat + Solidity)
cd backend
npm install

# Frontend (Next.js + Web3)
cd ../client
npm install
```

### 3. Run the Project Locally

In one terminal, run a local Ethereum node (Ganache or Hardhat):

```bash
# using Ganache: start the GUI app or CLI
# or using Hardhat:
cd backend
npx hardhat node
```

Deploy the `SupplyChain` contract:

```bash
cd backend
npx hardhat compile
npx hardhat run scripts/deploy.ts --network ganache   # or localhost / your network
```

The deploy script updates `client/src/deployments.json` with the contract address.

Start the frontend:

```bash
cd client
npm run dev
```

Then open `http://localhost:3000` and connect MetaMask to the same network.

### 4. Running Tests & Linting

**Backend tests:**

```bash
cd backend
npx hardhat test
```

**Frontend linting & build:**

```bash
cd client
npm run lint
npm run build
```

Please make sure tests pass and the app builds before opening a pull request.

## Contribution Workflow

1. **Create a new branch** from `master`:

```bash
git checkout -b feature/my-awesome-change
```

2. **Make your changes** (code, tests, docs).
3. **Run tests and linting** (see above).
4. **Commit with a clear message:**

```bash
git commit -m "feat: add XYZ"       # features
git commit -m "fix: handle ABC"     # bug fixes
git commit -m "docs: improve README"
```

5. **Push your branch**:

```bash
git push origin feature/my-awesome-change
```

6. **Open a Pull Request** against `faizack/Supply-Chain-Blockchain:master` and fill in the PR template (if available).

## What to Work On

Good starter ideas:

- **Docs**: improve README, add screenshots/GIFs, clarify setup steps.
- **Tests**:
  - More Hardhat tests for `SupplyChain.sol` (role registration, reverts, edge cases).
  - Basic frontend tests for critical flows (ordering, tracking).
- **UI/UX**:
  - Additional status indicators, better error messages, responsive tweaks.
- **Features**:
  - New role types or permissions.
  - Additional tracking metadata (timestamps, batch numbers, etc.).

Issues labeled `good first issue`, `help wanted`, or `documentation` are especially suitable for new contributors.

## Code Style & Guidelines

- Use **TypeScript** in the frontend and keep types explicit where reasonable.
- Keep Solidity code readable and prefer clear `require` messages for new checks.
- Follow the existing formatting conventions (Prettier / ESLint for frontend).
- Avoid large, mixed-purpose pull requests; smaller focused PRs are easier to review.

## Reporting Bugs

Please include:

- What you did (steps to reproduce)
- What you expected to happen
- What actually happened
- Environment details (OS, browser, network, branch/commit, etc.)
- Screenshots or console logs if helpful

## Security

If you believe you’ve found a security issue in the smart contracts or infrastructure, **do not** open a public GitHub issue. Instead, please contact the maintainer directly via GitHub profile email if available.

## Thank You

Your contributions help make this project more useful for learners and real-world builders. 🙏

