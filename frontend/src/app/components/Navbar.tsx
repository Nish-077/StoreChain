'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

export default function Navbar() {
  const [account, setAccount] = useState<string | null>(null);

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed. Please install it to use this app.');
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  useEffect(() => {
    // Check if MetaMask is already connected
    const checkWalletConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    checkWalletConnection();
  }, []);

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo/Title */}
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-white">
            Decentralized Cloud Storage
          </h1>
          <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full">
            Beta
          </span>
        </div>

        {/* Wallet Connection */}
        <div>
          {account ? (
            <div className="flex items-center space-x-3">
              <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white bg-white/20 px-4 py-2 rounded-full shadow hover:bg-white/30 transition-all duration-300 cursor-default">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full shadow-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}