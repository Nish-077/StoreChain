"use client";

import { pinata } from "@/utils/config";
import { useState, useRef } from "react";
import {
  getAccessControlContract,
  getStorageRegistryContract,
  getEncryptionKeyRegistryContract,
} from "@/utils/contracts";
import * as ethUtil from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { getOwnerAddress } from "@/utils/ethereum";

interface FileUploadProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      // Cleanup if uploadCid and/or storageRegistered are set
      if (uploadCid) {
        try {
          await fetch(`/api/delete-file?id=${uploadId}`); // <-- changed cid to id
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
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <div className="relative w-full group flex items-center">
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
            }}
            className="block w-full text-sm text-purple-700 file:mr-4 file:py-3 file:px-6 
      file:rounded-full file:border-0 file:text-sm file:font-semibold 
      file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 
      transition-all duration-300 file:shadow-md file:cursor-pointer
      group-hover:file:translate-x-1"
            disabled={isUploading}
          />
          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="ml-2 text-purple-600 hover:text-red-600 text-xl font-bold focus:outline-none"
              title="Remove selected file"
              disabled={isUploading}
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={handleFileUpload}
          disabled={isUploading || !file}
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
          {isUploading ? "Uploading..." : "Upload to IPFS"}
        </button>
      </div>
    </section>
  );
}
