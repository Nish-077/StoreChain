import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <Link
        href="/"
        className="inline-block mb-6 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition"
      >
        ← Back to Home
      </Link>
      <h1 className="text-4xl font-extrabold text-pink-600 mb-6">
        About StoreChain
      </h1>
      <p className="mb-6 text-lg text-purple-600">
        <span className="font-semibold text-purple-700">StoreChain</span> is a
        decentralized application (dApp) that empowers users to securely store,
        share, and manage files on the{" "}
        <span className="font-semibold text-blue-700">IPFS</span> network, with
        robust access and ownership management powered by blockchain smart
        contracts.
      </p>
      <h2 className="text-2xl font-bold text-pink-600 mt-8 mb-3">
        Key Features
      </h2>
      <ul className="list-disc list-inside mb-6 text-purple-600">
        <li>
          <span className="font-semibold text-purple-700">
            Decentralized Storage:
          </span>{" "}
          Files are encrypted and stored on IPFS, ensuring immutability and
          censorship resistance.
        </li>
        <li>
          <span className="font-semibold text-purple-700">
            Blockchain Access Control:
          </span>{" "}
          Access and ownership are managed by smart contracts on the Polygon
          Amoy testnet, providing transparent and tamper-proof permissions.
        </li>
        <li>
          <span className="font-semibold text-purple-700">
            Granular Sharing:
          </span>{" "}
          File owners can grant or revoke access to individual users, with all
          permissions enforced on-chain.
        </li>
        <li>
          <span className="font-semibold text-purple-700">
            End-to-End Encryption:
          </span>{" "}
          Files are encrypted client-side. Only authorized users can decrypt and
          access the content.
        </li>
        <li>
          <span className="font-semibold text-purple-700">
            Self-Sovereign Keys:
          </span>{" "}
          Public encryption keys are registered on-chain, enabling secure key
          exchange without centralized intermediaries.
        </li>
        <li>
          <span className="font-semibold text-purple-700">
            User-Friendly Interface:
          </span>{" "}
          Easily upload, download, share, and manage your files through a modern
          web interface.
        </li>
      </ul>
      <h2 className="text-2xl font-bold text-pink-600 mt-8 mb-3">
        How It Works
      </h2>
      <ol className="list-decimal list-inside mb-6 text-purple-600">
        <li>
          <span className="font-semibold text-purple-700">Connect Wallet:</span>{" "}
          Users connect their Ethereum wallet (MetaMask) to interact with the
          dApp and register their public encryption key.
        </li>
        <li>
          <span className="font-semibold text-purple-700">Upload Files:</span>{" "}
          Files are encrypted in the browser and uploaded to IPFS via Pinata.
          The file&apos;s CID and metadata are registered on-chain.
        </li>
        <li>
          <span className="font-semibold text-purple-700">Manage Access:</span>{" "}
          Owners can grant or revoke access to files for any Ethereum address.
          Accessors receive an encrypted key, allowing them to decrypt the file.
        </li>
        <li>
          <span className="font-semibold text-purple-700">
            Download & Decrypt:
          </span>{" "}
          Authorized users can download and decrypt files using their private
          key, with all access checks enforced by smart contracts.
        </li>
      </ol>
      <h2 className="text-2xl font-bold text-pink-600 mt-8 mb-3">
        Technology Stack
      </h2>
      <ul className="list-disc list-inside mb-6 text-purple-600">
        <li>Frontend: Next.js, React, Tailwind CSS</li>
        <li>Smart Contracts: Solidity (Polygon Amoy Testnet)</li>
        <li>Storage: IPFS via Pinata</li>
        <li>Wallet Integration: MetaMask</li>
      </ul>
      <h2 className="text-2xl font-bold text-pink-600 mt-8 mb-3">
        Open Source & Contributions
      </h2>
      <p className="mb-6 text-purple-600">
        StoreChain is open source and welcomes contributions! Check out the
        project on{" "}
        <a
          href="https://github.com/Nish-077/StoreChain"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          GitHub
        </a>
        .
      </p>
      <div className="text-sm text-purple-400 mt-8">
        Powered by Pinata IPFS &amp; Polygon Amoy Blockchain.
      </div>
    </div>
  );
}
