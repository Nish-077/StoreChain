import { ethers } from 'ethers';
import { STORAGE_REGISTRY_ADDRESS, ACCESS_CONTROL_ADDRESS } from '../contracts/addresses';
import StorageRegistryABI from '../contracts/StorageRegistry.json';
import AccessControlABI from '../contracts/AccessControl.json';

export const getProvider = () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed.');
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getStorageRegistryContract = (signer: ethers.Signer) => {
  return new ethers.Contract(STORAGE_REGISTRY_ADDRESS, StorageRegistryABI.abi, signer);
};

export const getAccessControlContract = (signer: ethers.Signer) => {
  return new ethers.Contract(ACCESS_CONTROL_ADDRESS, AccessControlABI.abi, signer);
};