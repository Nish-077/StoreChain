# StoreChain Smart Contracts

This directory contains the Solidity smart contracts for the StoreChain project, which power decentralized file storage, access control, and encryption key management.

---

## 🚀 Deployed Contracts (Polygon Amoy Testnet)

You can use the already deployed public contracts below. Their ABIs are available in the frontend at `src/abis/`.

| Contract                  | Address                                      | ABI Location                                   |
| ------------------------- | -------------------------------------------- | ---------------------------------------------- |
| **StorageRegistry**       | `0x12e9C1f6BF857e9a40292121B31cDdC9e54B9123` | `frontend/src/abis/StorageRegistry.json`       |
| **AccessControl**         | `0xf987F7f8834052AEE9F8F497a2C5F094Dc269858` | `frontend/src/abis/AccessControl.json`         |
| **EncryptionKeyRegistry** | `0x1a0336B00b8be0262BE1c9CF9219442C1B299ab5` | `frontend/src/abis/EncryptionKeyRegistry.json` |

- **Network:** Polygon Amoy Testnet (Chain ID: 80002)
- **Block Explorer:** [OKLink Amoy](https://www.oklink.com/amoy)

---

## 📝 Using the Contracts

- You can interact with these contracts directly from your frontend using the provided ABIs and addresses.
- All contract interaction examples (using ethers.js) are available in the main project documentation and frontend codebase.

---

## 🛠️ Deploying Your Own Contracts

If you want to deploy your own version of the contracts (for development, testing, or production):

### 1. Prerequisites

- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/) 
- A funded wallet on Polygon Amoy testnet
- RPC URL for Amoy (e.g., Infura or Alchemy)

### 2. Install Dependencies

```bash
cd contracts
npm install
```

### 3. Configure Environment

Create a `.env` file in the `contracts` directory:

> **Note:** The example below uses an Infura RPC URL, which you can obtain by creating a project at [https://developer.metamask.io/](https://developer.metamask.io/) (Infura).

```
AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/<YOUR_INFURA_PROJECT_ID>
PRIVATE_KEY=<YOUR_DEPLOYER_PRIVATE_KEY>
```

### 4. Compile Contracts

```bash
npx hardhat compile
```

### 5. Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network amoy
```

- The deployment script will output the addresses of the deployed contracts.
- Update your frontend `.env` and ABI files as needed.

---

## 📄 Contract Descriptions

- **StorageRegistry:**  
  Manages file CIDs per user, supports storing, updating, and deleting files, and provides file metadata (timestamp).

- **AccessControl:**  
  Handles secure, per-user access control for encrypted file keys. Owners can grant/revoke access to files for any address. Only encrypted keys are stored.

- **EncryptionKeyRegistry:**  
  Stores public encryption keys for users, enabling decentralized access control and secure key sharing.

---

## 🔗 Contract Verification

- After deployment, verify your contracts on [OKLink Amoy Explorer](https://www.oklink.com/amoy) for transparency and public access.

---

## 📦 ABI Files

- ABI files for the deployed contracts are available in the frontend at `src/abis/`.
- Use these ABIs for contract interaction in your dApp or scripts.

---

**You can use the public contracts above, or deploy your own for full control.**
