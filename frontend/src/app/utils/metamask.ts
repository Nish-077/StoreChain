import { ethers } from 'ethers';

export const connectMetaMask = async (): Promise<string> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed.');
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0]; // Return the connected account
};

export const getConnectedAccount = async (): Promise<string | null> => {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const accounts = await provider.listAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};