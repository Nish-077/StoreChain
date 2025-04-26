# StoreChain Frontend

[Live Demo](https://store-chain.vercel.app/)

This is the **frontend** for [StoreChain](https://github.com/Nish-077/StoreChain), a decentralized file storage and sharing dApp built with [Next.js](https://nextjs.org), [React](https://react.dev), [Tailwind CSS](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com/).

## Features

- Upload files to IPFS (via Pinata) with client-side encryption.
- Manage your uploaded files and their access permissions.
- Share files securely using blockchain-based access control.
- Download and decrypt files you have access to.
- Connect your Ethereum wallet (MetaMask) to interact with the dApp.
- Register and use public encryption keys for secure sharing.
- Modern UI with Tailwind CSS and shadcn/ui components.

## Getting Started

### 1. Install dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 2. Run the development server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure Environment

Create a `.env` file with your Pinata and blockchain settings:

```
PINATA_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
# Add any other required environment variables
```

### 4. UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for dropdowns and menus.  
To add more components, use:

```bash
npx shadcn-ui@latest add dropdown-menu
```

### 5. Wallet & Blockchain

- Requires [MetaMask](https://metamask.io/) for wallet connection and encryption key management.
- Interacts with smart contracts deployed on Polygon Amoy testnet.

## Project Structure

- `src/app/` - Next.js app directory (pages, layout, etc.)
- `src/components/` - React components (file upload, file list, wallet, etc.)
- `src/utils/` - Utility functions for contracts, IPFS, and MetaMask
- `src/app/globals.css` - Tailwind CSS and global styles

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [MetaMask Docs](https://docs.metamask.io/)

## License

MIT

---

**Note:** This is only the frontend. For smart contract and backend details, see the [main StoreChain repository](https://github.com/Nish-077/StoreChain).
