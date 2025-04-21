## 🚀 StoreChain Smart Contracts Deployment

### Network
- **Polygon Amoy Testnet**
  - **Chain ID:** 80002
  - **Block Explorer:** [OKLink Amoy](https://www.oklink.com/amoy)

---

### 📦 Deployed Contracts

#### 1. StorageRegistry
- **Address:** `0xF8DDf14d5dcE5983254adE70272469A83F8C9b68`
- **ABI:**  
  See [`abis/StorageRegistry.json`](abis/StorageRegistry.json)

#### 2. AccessControl
- **Address:** `0xa32013ad98A1e29Deab3B1038d01161bf53b41e3`
- **ABI:**  
  See [`abis/AccessControl.json`](abis/AccessControl.json)

---

### 📝 Usage

- Use the contract addresses above and the corresponding ABIs from the `abis/` directory to interact with the contracts from your frontend or scripts.
- Example (ethers.js):
  ```js
  import StorageRegistryABI from './abis/StorageRegistry.json';
  const storageRegistry = new ethers.Contract(
    "0xF8DDf14d5dcE5983254adE70272469A83F8C9b68",
    StorageRegistryABI,
    providerOrSigner
  );
  ```

---

### 📄 How to Verify

- Visit [OKLink Amoy Explorer](https://www.oklink.com/amoy)
- Search for the contract address to view transactions and contract details.

---

### 🔗 Environment

- **RPC URL:** (from your `.env`)  
  `AMOY_RPC_URL=https://polygon-amoy.infura.io/v3/<YOUR_INFURA_PROJECT_ID>`
- **Deployer Address:** (your MetaMask account)

---

**For full ABIs, see the `abis/` directory.**