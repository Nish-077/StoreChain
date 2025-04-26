"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
} from "react";
import {
  getAccessControlContract,
  getStorageRegistryContract,
} from "@/utils/contracts";
import { pinata } from "@/utils/config";
import { useRouter } from "next/navigation";
import { getOwnerAddress } from "@/utils/ethereum";
import { useWallet } from "@/context/WalletContext";

interface PinataFile {
  id: string;
  cid: string;
  timestamp: number;
  filename?: string;
}

interface UploadedFilesListProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

const UploadedFilesList = forwardRef(function UploadedFilesList(
  { onSuccess, onError }: UploadedFilesListProps,
  ref
) {
  const [files, setFiles] = useState<PinataFile[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isWalletConnected } = useWallet();

  const fetchFiles = React.useCallback(async () => {
    setLoading(true);
    try {
      const ownerAddress = await getOwnerAddress();
      const storageRegistry = getStorageRegistryContract();
      const [cids, timestamps] = await storageRegistry.getUserFiles(
        ownerAddress
      );

      // Fetch filename for each CID from your API route
      const filesList: PinataFile[] = await Promise.all(
        cids.map(async (cid: string, idx: number) => {
          let filename = "";
          let id = "";
          try {
            // Call your API route with the CID as a query parameter
            const res = await fetch(`/api/owned-files?cid=${cid}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.files?.length > 0) {
                filename = data.files[0].name || "";
              }
              if (data?.files?.length > 0) {
                id = data.files[0].id || "";
              }
            }
          } catch {
            filename = "";
            id = "";
          }
          return {
            id,
            cid,
            timestamp: timestamps[idx]?.toNumber
              ? timestamps[idx].toNumber()
              : Number(timestamps[idx]),
            filename,
          };
        })
      );
      setFiles(filesList);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useImperativeHandle(ref, () => ({
    refreshFiles: fetchFiles,
  }));

  useEffect(() => {
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      for (const file of files) {
        urls[file.cid] = await pinata.gateways.public.convert(file.cid);
      }
      setFileUrls(urls);
    };
    if (files.length > 0) fetchUrls();
  }, [files]);

  const handleDownload = async (file: PinataFile) => {
    if (onSuccess) onSuccess("Starting download...");
    if (onError) onError(""); // clear error
    try {
      // 1. Fetch encrypted file from IPFS
      const response = await fetch(fileUrls[file.cid]);
      if (!response.ok) {
        if (onError) onError("Failed to fetch file from IPFS.");
        return;
      }
      const encryptedFileBuffer = await response.arrayBuffer();
      const encryptedFile = new Uint8Array(encryptedFileBuffer);

      // 2. Fetch encrypted key from AccessControl contract
      const userAddress = await getOwnerAddress();

      const accessControl = getAccessControlContract();
      const encryptedKeyHex = await accessControl.getEncryptedKey(
        userAddress,
        file.cid
      );

      if (!encryptedKeyHex || encryptedKeyHex === "0x") {
        if (onError) onError("No encrypted key found for this file.");
        return;
      }

      // 3. Decrypt the encrypted key using MetaMask's eth_decrypt
      const decryptedKeyBase64 = await window.ethereum.request({
        method: "eth_decrypt",
        params: [encryptedKeyHex, userAddress],
      });

      // 4. The decrypted key is base64 encoded
      const decryptedKey = Uint8Array.from(atob(decryptedKeyBase64), (c) =>
        c.charCodeAt(0)
      );

      // 5. Extract IV and ciphertext from the encrypted file
      const iv = encryptedFile.slice(0, 12);
      const ciphertext = encryptedFile.slice(12);

      // 6. Decrypt the file using AES-GCM
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        decryptedKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
      );
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        ciphertext
      );

      // 7. Trigger download in browser
      const blob = new Blob([decryptedBuffer]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename || `${file.cid}.bin`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      if (onSuccess) onSuccess("File downloaded and decrypted successfully!");
    } catch (e) {
      if (onError) onError("Failed to download or decrypt file.");
      console.error(e);
    }
  };

  // Delete file handler
  const handleDelete = async (file: PinataFile) => {
    if (onSuccess) onSuccess(""); // Clear previous success
    if (onError) onError(""); // Clear previous error
    setLoading(true);
    try {
      if (onSuccess) onSuccess("Deleting file from StorageRegistry...");
      // 1. Remove from StorageRegistry contract
      await getOwnerAddress();
      const storageRegistry = getStorageRegistryContract();
      const tx = await storageRegistry.deleteFile(file.cid);
      await tx.wait();
      if (onSuccess) onSuccess("File removed from StorageRegistry.");

      // 2. Remove from Pinata via API route
      if (onSuccess) onSuccess("Deleting file from Pinata...");
      const res = await fetch(`/api/delete-file?id=${file.id}`);
      if (!res.ok) {
        if (onError) onError("Failed to delete file from Pinata.");
      } else {
        if (onSuccess) onSuccess("File deleted from Pinata.");
      }

      // 3. Refresh file list
      setFiles((prev) => prev.filter((f) => f.cid !== file.cid));
      if (onSuccess) onSuccess("File deleted successfully!");
    } catch (e) {
      if (onError) onError("Failed to delete file.");
      console.error(e);
    }
    setLoading(false);
  };

  if (!isWalletConnected) {
    return (
      <section className="p-6 bg-gradient-to-r from-pink-50/90 to-rose-50/90 rounded-xl border border-pink-200/50">
        <h2 className="text-2xl font-bold text-rose-800 mb-6 text-center">
          Your Files
        </h2>
        <div className="text-center py-12 text-pink-600 text-lg font-semibold">
          Connect to MetaMask to view your files.
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 bg-gradient-to-r from-pink-50/90 to-rose-50/90 rounded-xl border border-pink-200/50">
      <h2 className="text-2xl font-bold text-rose-800 mb-6 text-center">
        Your Files
      </h2>
      {loading ? (
        <div className="text-center py-6 text-pink-600">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-pink-600">No files registered yet.</p>
          <div className="mt-4 text-4xl animate-bounce">📁</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {files.map((file, idx) => (
            <li
              key={file.cid + idx}
              className="p-3 bg-white/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-rose-400 hover:translate-x-1"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="flex-1 md:pl-2">
                  <div className="font-extrabold text-rose-700 text-xl mb-2 leading-tight">
                    {file.filename
                      ? file.filename
                      : file.cid.slice(0, 8) + "..." + file.cid.slice(-6)}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 break-all mb-1">
                    <span className="font-semibold text-gray-400">CID:</span>{" "}
                    {file.cid}
                  </div>
                  <div className="text-xs md:text-sm text-gray-400">
                    <span className="font-semibold text-gray-400">
                      Uploaded:
                    </span>{" "}
                    {file.timestamp
                      ? new Date(file.timestamp * 1000).toLocaleString()
                      : ""}
                  </div>
                </div>
                <div className="flex flex-row md:flex-col gap-2 md:gap-3 md:ml-6 mt-2 md:mt-0">
                  <button
                    onClick={() => router.push(`/manage_access/${file.cid}`)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-full font-medium shadow hover:from-blue-500 hover:to-purple-500 transition-colors w-full"
                  >
                    Manage Access
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload(file);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-medium shadow hover:from-pink-500 hover:to-rose-500 transition-colors w-full"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(file)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-full font-medium shadow hover:from-red-500 hover:to-rose-600 transition-colors w-full"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});

export default UploadedFilesList;
