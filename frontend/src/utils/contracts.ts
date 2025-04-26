import { ethers } from "ethers";
import StorageRegistryArtifact from "../abis/StorageRegistry.json";
import AccessControlArtifact from "../abis/AccessControl.json";
import EncryptionKeyRegistryArtifact from "../abis/EncryptionKeyRegistry.json";

const StorageRegistryABI = StorageRegistryArtifact.abi;
const AccessControlABI = AccessControlArtifact.abi;
const EncryptionKeyRegistryABI = EncryptionKeyRegistryArtifact.abi;

export const STORAGE_REGISTRY_ADDRESS =
  "0x12e9C1f6BF857e9a40292121B31cDdC9e54B9123";
export const ACCESS_CONTROL_ADDRESS =
  "0xf987F7f8834052AEE9F8F497a2C5F094Dc269858";
export const ENCRYPTION_KEY_REGISTRY_ADDRESS =
  "0x1a0336B00b8be0262BE1c9CF9219442C1B299ab5";

export const getProvider = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not available");
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = () => getProvider().getSigner();

export const getStorageRegistryContract = () =>
  new ethers.Contract(
    STORAGE_REGISTRY_ADDRESS,
    StorageRegistryABI,
    getSigner()
  );

export const getAccessControlContract = () =>
  new ethers.Contract(ACCESS_CONTROL_ADDRESS, AccessControlABI, getSigner());

export const getEncryptionKeyRegistryContract = () =>
  new ethers.Contract(
    ENCRYPTION_KEY_REGISTRY_ADDRESS,
    EncryptionKeyRegistryABI,
    getSigner()
  );
