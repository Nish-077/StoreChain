"use client";

import { pinata } from "@/utils/config";
import { useState } from "react";
import {
  getAccessControlContract,
  getStorageRegistryContract,
  getEncryptionKeyRegistryContract,
} from "@/utils/contracts";
import * as ethUtil from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { getOwnerAddress } from "@/utils/ethereum";
import { useDropzone } from "react-dropzone";
import { useWallet } from "@/context/WalletContext";

interface FileUploadProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { isWalletConnected } = useWallet();

  // Drag & Drop: Accept only a single file
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxFiles: 1,
  });

  // Helper: Generate random key and IV
  const generateKeyAndIV = () => {
    const key = window.crypto.getRandomValues(new Uint8Array(32));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    return { key, iv };
  };

  // Helper: Encrypt file with AES-GCM
  const encryptFile = async (file: File, key: Uint8Array, iv: Uint8Array) => {
    const fileBuffer = await file.arrayBuffer();
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      fileBuffer
    );
    // Combine IV + encrypted data
    return new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
  };

  // Helper: Encrypt symmetric key with owner's public key from EncryptionKeyRegistry
  const encryptSymmetricKeyWithOwner = async (
    key: Uint8Array,
    ownerAddress: string
  ) => {
    // Get the public encryption key from the registry (no MetaMask prompt)
    const encryptionKeyRegistry = getEncryptionKeyRegistryContract();
    const publicKey = await encryptionKeyRegistry.getPublicEncryptionKey(
      ownerAddress
    );

    if (!publicKey || publicKey === "") {
      throw new Error(
        "No public encryption key found for your address. Please register your key first."
      );
    }

    // Encrypt the symmetric key using ECIES
    const encrypted = ethUtil.encrypt({
      publicKey,
      data: Buffer.from(key).toString("base64"),
      version: "x25519-xsalsa20-poly1305",
    });

    // Return as hex string for storage
    return (
      "0x" + Buffer.from(JSON.stringify(encrypted), "utf8").toString("hex")
    );
  };

  const handleFileUpload = async () => {
    if (!file) {
      if (onError) onError("Please select a file.");
      return;
    }
    setIsUploading(true);
    if (onError) onError("");
    if (onSuccess) onSuccess("");

    let uploadCid: string | null = null;
    let uploadId: string | null = null;
    let storageRegistered = false;

    try {
      // 1. Generate key and IV
      const { key, iv } = generateKeyAndIV();

      // 2. Encrypt file
      const encryptedData = await encryptFile(file, key, iv);
      const encryptedBlob = new Blob([encryptedData]);

      // 3. Get the signed upload URL from backend
      const urlRequest = await fetch("/api/upload-file");
      if (!urlRequest.ok) throw new Error("Failed to get upload URL");
      const urlResponse = await urlRequest.json();

      // 4. Upload to IPFS (Pinata)
      const upload = await pinata.upload.public
        .file(new File([encryptedBlob], file.name))
        .url(urlResponse.url);
      uploadCid = upload.cid;
      uploadId = upload.id;

      // 5. Register file in StorageRegistry
      const storageRegistry = getStorageRegistryContract();
      const tx = await storageRegistry.storeFile(upload.cid);
      await tx.wait(); // Wait for mining
      storageRegistered = true;

      // Optionally, verify registration before proceeding
      const ownerAddress = await getOwnerAddress();
      const [cids] = await storageRegistry.getUserFiles(ownerAddress);
      if (!cids.includes(upload.cid)) {
        throw new Error(
          "File not yet registered in StorageRegistry. Please try again."
        );
      }

      // 6. Encrypt key with owner's public key from registry
      const encryptedKey = await encryptSymmetricKeyWithOwner(
        key,
        ownerAddress
      );

      // 7. Store the encrypted key for the owner in AccessControl
      const accessControl = getAccessControlContract();
      await accessControl.setOwnerEncryptedKey(upload.cid, encryptedKey);

      if (onSuccess)
        onSuccess(
          `File uploaded and encrypted key stored for owner! CID: ${upload.cid}`
        );

      // Deselect the file after successful upload
      setFile(null);
    } catch (e) {
      // Cleanup if uploadCid and/or storageRegistered are set
      if (uploadCid) {
        try {
          await fetch(`/api/delete-file?id=${uploadId}`);
        } catch (err) {
          console.error("Cleanup: Failed to delete from IPFS", err);
        }
      }
      if (uploadCid && storageRegistered) {
        try {
          const storageRegistry = getStorageRegistryContract();
          const tx = await storageRegistry.deleteFile(uploadCid);
          await tx.wait();
        } catch (err) {
          console.error("Cleanup: Failed to delete from StorageRegistry", err);
        }
      }
      if (onError) onError("Error uploading file. Cleaned up partial upload.");
      console.error("Error uploading file:", e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="mb-12 p-6 bg-gradient-to-r from-blue-50/90 to-purple-50/90 rounded-xl border border-blue-200/50">
      <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
        Upload File
      </h2>
      {/* Drag & Drop Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 mb-4 ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-100"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 16l4-4m0 0l4 4m-4-4v12m13-4h-3m-4 0h-3m-4 0H3m13-4h3m4 0h3"
            />
          </svg>
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Drop the file here...</p>
          ) : (
            <p className="text-gray-600 font-medium">
              Drag & drop a file here, or click to select
            </p>
          )}
        </div>
      </div>
      {/* Show selected file */}
      {file && (
        <div className="mt-4 flex items-center justify-between p-2 bg-blue-100 rounded-lg border border-blue-300">
          <p className="text-sm text-blue-800 font-medium">{file.name}</p>
          <button
            onClick={() => setFile(null)}
            className="text-red-500 hover:text-red-700 text-lg font-bold focus:outline-none"
            aria-label="Remove file"
            disabled={isUploading}
          >
            ×
          </button>
        </div>
      )}
      {/* Centered Upload Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleFileUpload}
          disabled={isUploading || !file || !isWalletConnected}
          className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 
                  text-white font-bold rounded-full shadow-lg transition-all duration-300 
                  transform hover:scale-105 focus:outline-none focus:ring-2 
                  focus:ring-purple-400 focus:ring-opacity-50 disabled:opacity-50 
                  disabled:cursor-not-allowed disabled:transform-none
                  ${
                    isUploading
                      ? "animate-pulse"
                      : "hover:from-purple-700 hover:to-blue-700"
                  }`}
        >
          {isWalletConnected
            ? isUploading
              ? "Uploading..."
              : "Upload to IPFS"
            : "Connect MetaMask to Upload"}
        </button>
      </div>
    </section>
  );
}
