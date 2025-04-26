# StoreChain

[Live Demo](https://store-chain.vercel.app/)

**StoreChain** is a decentralized application (dApp) for secure, private, and user-controlled file storage and sharing. It combines the power of IPFS for decentralized file storage, client-side encryption for privacy, and blockchain smart contracts for transparent access and ownership management.

---

## 🌟 What is StoreChain?

StoreChain lets you:

- **Upload files**: Files are encrypted in your browser and stored on IPFS (via Pinata), ensuring only you and those you authorize can access them.
- **Control access**: You decide who can access each file. Access permissions are managed by smart contracts on the Polygon Amoy testnet.
- **Share securely**: When you grant access, the file’s encryption key is securely shared with the recipient using their on-chain public key.
- **Prove ownership**: All file uploads, access grants, and key registrations are recorded on-chain, providing a transparent and tamper-proof record.

---

## 🛠️ How does it work?

1. **Client-side encryption**: Before uploading, your file is encrypted in your browser. The symmetric key is never sent to any server.
2. **IPFS storage**: The encrypted file is uploaded to IPFS via Pinata, and the resulting CID is registered on-chain.
3. **Smart contracts**:
   - The [StorageRegistry](contracts/README.md) contract tracks which files (CIDs) belong to which users.
   - The [AccessControl](contracts/README.md) contract manages who can access which files, and stores encrypted keys for each accessor.
   - The [EncryptionKeyRegistry](contracts/README.md) contract stores users’ public encryption keys for secure key sharing.
4. **Access management**: When you grant access to another user, the symmetric key is encrypted with their public key and stored on-chain. Only the intended recipient can decrypt it using MetaMask.
5. **Download & decrypt**: When an authorized user downloads a file, the dApp fetches the encrypted file from IPFS, retrieves the encrypted key from the contract, and uses MetaMask to decrypt it—all in the browser.

---

## 🧩 Project Structure

- [`frontend/`](frontend/README.md): Next.js app for the user interface, wallet connection, file upload/download, and contract interaction.
- [`contracts/`](contracts/README.md): Solidity smart contracts for file registry, access control, and encryption key management.

---

## 🔗 Key Technologies

- **Next.js & React**: Modern, fast, and flexible frontend.
- **Tailwind CSS**: Clean, responsive, and accessible UI.
- **IPFS (via Pinata)**: Decentralized, censorship-resistant file storage.
- **Polygon Amoy Testnet**: Low-cost, EVM-compatible blockchain for contract deployment and testing.
- **MetaMask**: Secure wallet and key management in the browser.
- **Ethers.js**: Blockchain interaction from the frontend.

---

## 📚 Learn More

- **Frontend details**: See [`frontend/README.md`](frontend/README.md)
- **Smart contract details & deployment**: See [`contracts/README.md`](contracts/README.md)

---

## 🚀 Quick Start

1. Clone this repository.
2. Visit the deployed app at [https://store-chain.vercel.app/](https://store-chain.vercel.app/) or follow the setup instructions in [`frontend/README.md`](frontend/README.md) to run the dApp locally.
3. Use the public contracts on Polygon Amoy, or deploy your own (see [`contracts/README.md`](contracts/README.md)).

---

## 🦊 MetaMask Network Setup & Test Tokens

After installing the MetaMask browser extension, you need to add the Polygon Amoy testnet as a custom network:

- **Network Name:** Polygon Amoy Testnet (or whatever suggestion appears)
- **New RPC URL:** https://polygon-amoy.infura.io/v3/YOUR_INFURA_PROJECT_ID
- **Chain ID:** 80002
- **Currency Symbol:** POL or MATIC (we used POL )
- **Block Explorer URL:** https://www.oklink.com/amoy

Once the network is added, you must obtain some test POL tokens to pay for transactions. You can get free test tokens from a Polygon Amoy faucet online (search for "Polygon Amoy faucet").

---

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/Nish-077/StoreChain).

---

## 📄 License

MIT
