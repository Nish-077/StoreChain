"use client";

import { useEffect, useState } from "react";
import { connectMetaMask, getConnectedAccount } from "@/utils/metamask";
import { getEncryptionKeyRegistryContract } from "@/utils/contracts";

interface ConnectWalletProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function ConnectWallet({
  onSuccess,
  onError,
}: ConnectWalletProps) {
  const [account, setAccount] = useState<string | null>(null);

  const registerEncryptionKey = async (address: string) => {
    try {
      const registry = getEncryptionKeyRegistryContract();
      // Check if already registered
      const existingKey = await registry.getPublicEncryptionKey(address);
      if (existingKey && existingKey !== "") {
        return;
      }

      // Get the public encryption key from MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [accounts[0]],
      });
      // Register it in the EncryptionKeyRegistry contract
      await registry.setPublicEncryptionKey(publicKey);
    } catch (err) {
      // User may reject the MetaMask prompt, or already registered
      if (onError)
        onError(
          err instanceof Error
            ? err.message
            : "Failed to register public encryption key."
        );
    }
  };

  const connectWallet = async () => {
    try {
      const acc = await connectMetaMask();
      setAccount(acc);
      await registerEncryptionKey(acc);
      if (onSuccess)
        onSuccess("Wallet connected and encryption key registered!");
    } catch (error) {
      if (onError)
        onError(
          (error instanceof Error
            ? error.message
            : "An unknown error occurred") || "Failed to connect wallet."
        );
    }
  };

  // Listen for account disconnect/change
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAccount(null);
        if (onError) onError("Wallet disconnected.");
      } else {
        setAccount(accounts[0]);
        registerEncryptionKey(accounts[0]);
        if (onSuccess)
          onSuccess("Wallet account changed and encryption key registered.");
      }
    };

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const acc = await getConnectedAccount();
        if (acc) {
          setAccount(acc);
          await registerEncryptionKey(acc);
        }
      } catch (error) {
        if (onError)
          onError(
            (error instanceof Error
              ? error.message
              : "An unknown error occurred") ||
              "Failed to check wallet connection."
          );
      }
    };
    checkWalletConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex justify-center mb-6">
      {account ? (
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-purple-700 bg-purple-100/60 px-4 py-2 rounded-full shadow hover:bg-purple-200 transition-all duration-300 cursor-default">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
