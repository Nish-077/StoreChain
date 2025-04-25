import { ethers } from "ethers";

export const connectMetaMask = async (): Promise<string> => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed.");
  }
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found.");
    }
    return accounts[0];
  } catch (err) {
    if ((err as { code: number }).code === 4001) {
      // EIP-1193 user rejected request
      throw new Error("User rejected MetaMask connection.");
    }
    throw err;
  }
};

export const getConnectedAccount = async (): Promise<string | null> => {
  if (typeof window.ethereum === "undefined") {
    return null;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.listAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};
