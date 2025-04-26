import type { Ethereum } from "@metamask/providers";

interface Window {
  ethereum?: Ethereum; // MetaMask injects the `ethereum` object
}
