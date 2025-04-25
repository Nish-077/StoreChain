"use client";

import { useState } from "react";
import FileUpload from "../components/FileUpload";
import UploadedFilesList from "../components/UploadedFilesList";
import ConnectWallet from "../components/ConnectWallet";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Animation */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4 animate-gradient">
            StoreChain
          </h1>
          <p className="text-lg md:text-xl text-purple-800 opacity-90">
            Secure, immutable, decentralized file storage on IPFS and Blockchain
          </p>
        </div>

        {/* Error & Success Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 text-xl font-bold focus:outline-none"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex justify-between items-center">
            <p className="text-green-700">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-500 hover:text-green-700 text-xl font-bold focus:outline-none"
              aria-label="Close success"
            >
              ×
            </button>
          </div>
        )}

        <ConnectWallet onSuccess={setSuccess} onError={setError} />

        {/* Main Card with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-purple-100/50">
          <FileUpload onSuccess={setSuccess} onError={setError} />
          <UploadedFilesList />
        </div>

        {/* Footer with Links */}
        <div className="mt-8 text-center text-purple-600 text-sm">
          <p className="mb-2">Powered by Pinata IPFS & Polygon Blockchain</p>
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:text-purple-800 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-purple-800 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
