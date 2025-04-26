"use client";

import { useEffect, useState } from "react";
import { getAccessControlContract } from "@/utils/contracts";
import { ethers } from "ethers";
import { pinata } from "@/utils/config";
import { getOwnerAddress } from "@/utils/ethereum";
import { useWallet } from "@/context/WalletContext";

interface AccessibleFile {
  owner: string;
  cid: string;
  filename?: string;
}

interface AccessibleFilesListProps {
  onError?: (msg: string) => void;
  onSuccess?: (msg: string) => void;
}

export default function AccessibleFilesList({
  onError,
  onSuccess,
}: AccessibleFilesListProps) {
  const [files, setFiles] = useState<AccessibleFile[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { isWalletConnected } = useWallet();

  useEffect(() => {
    if (!isWalletConnected) {
      setFiles([]);
      setLoading(false);
      return;
    }
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const accessControl = getAccessControlContract();
        const filesList: AccessibleFile[] =
          await accessControl.getAccessibleFiles(userAddress);

        // Optionally fetch filenames (if you have an API for that)
        const filesWithNames: AccessibleFile[] = await Promise.all(
          filesList.map(async (file) => {
            let filename = "";
            try {
              const res = await fetch(`/api/owned-files?cid=${file.cid}`);
              if (res.ok) {
                const data = await res.json();
                if (data?.files?.length > 0) {
                  filename = data.files[0].name || "";
                }
              }
            } catch {
              filename = "";
            }
            return { ...file, filename };
          })
        );

        setFiles(filesWithNames);
      } catch (e) {
        setFiles([]);
        if (onError) onError("Failed to fetch accessible files.");
        console.error(e);
      }
      setLoading(false);
    };
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected]);

  useEffect(() => {
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      for (const file of files) {
        urls[file.owner + file.cid] = await pinata.gateways.public.convert(
          file.cid
        );
      }
      setFileUrls(urls);
    };
    if (files.length > 0) fetchUrls();
  }, [files]);

  // Download and decrypt file using accessor's key (same as UploadedFilesList)
  const handleDownload = async (file: AccessibleFile) => {
    try {
      if (onSuccess) onSuccess("Starting download...");
      if (onError) onError(""); // clear error

      // 1. Fetch encrypted file from IPFS
      const response = await fetch(fileUrls[file.owner + file.cid]);
      if (!response.ok) {
        if (onError) onError("Failed to fetch file from IPFS.");
        console.error("handleDownload: Failed to fetch file from IPFS");
        return;
      }
      const encryptedFileBuffer = await response.arrayBuffer();
      const encryptedFile = new Uint8Array(encryptedFileBuffer);

      // 2. Fetch encrypted key from AccessControl contract
      const userAddress = await getOwnerAddress();

      const accessControl = getAccessControlContract();
      const encryptedKeyHex = await accessControl.getEncryptedKey(
        file.owner,
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
      console.error("handleDownload: Error", e);
    }
  };

  if (!isWalletConnected) {
    return (
      <section className="mt-10 p-6 bg-gradient-to-r from-blue-50/90 to-purple-50/90 rounded-xl border border-blue-200/50">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
          Files Shared With You
        </h2>
        <div className="text-center py-12 text-blue-600 text-lg font-semibold">
          Connect to MetaMask to view your files.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 p-6 bg-gradient-to-r from-blue-50/90 to-purple-50/90 rounded-xl border border-blue-200/50">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Files Shared With You
      </h2>
      {loading ? (
        <div className="text-center py-6 text-blue-600">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-blue-600">No files shared with you yet.</p>
          <div className="mt-4 text-4xl animate-bounce">🔑</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {files.map((file, idx) => (
            <li
              key={file.owner + file.cid + idx}
              className="p-3 bg-white/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-blue-400 hover:translate-x-1"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold text-blue-700">
                    {file.filename
                      ? file.filename
                      : file.cid.slice(0, 8) + "..." + file.cid.slice(-6)}
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    CID: {file.cid}
                  </div>
                  <div className="text-xs text-gray-400">
                    Owner: {file.owner}
                  </div>
                </div>
                <div className="flex flex-row gap-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload(file);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-medium shadow hover:from-pink-500 hover:to-rose-500 transition-colors"
                  >
                    Download
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
