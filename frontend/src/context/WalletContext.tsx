import React, { createContext, useContext, useEffect, useState } from "react";

interface WalletContextType {
  isWalletConnected: boolean;
  account: string | null;
  setIsWalletConnected: (connected: boolean) => void;
  setAccount: (account: string | null) => void;
}

const WalletContext = createContext<WalletContextType>({
  isWalletConnected: false,
  account: null,
  setIsWalletConnected: () => {},
  setAccount: () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          setIsWalletConnected(accounts && accounts.length > 0);
          setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
        } catch {
          setIsWalletConnected(false);
          setAccount(null);
        }
      } else {
        setIsWalletConnected(false);
        setAccount(null);
      }
    };
    checkConnection();

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setIsWalletConnected(accounts && accounts.length > 0);
        setAccount(accounts && accounts.length > 0 ? accounts[0] : null);
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ isWalletConnected, account, setIsWalletConnected, setAccount }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
