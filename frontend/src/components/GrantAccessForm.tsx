"use client";

import { useState } from "react";
import {
  getAccessControlContract,
  getEncryptionKeyRegistryContract,
} from "@/utils/contracts";
import { useParams } from "next/navigation";
import * as ethUtil from "@metamask/eth-sig-util";
import { Buffer } from "buffer";
import { getOwnerAddress } from "@/utils/ethereum";

interface GrantAccessFormProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function GrantAccessForm({
  onSuccess,
  onError,
}: GrantAccessFormProps) {
  const { cid } = useParams<{ cid: string }>();
  const [newAccessor, setNewAccessor] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Helper: Decrypt symmetric key with owner's private key using MetaMask
  const decryptSymmetricKeyWithOwner = async (
    encryptedKey: string,
    ownerAddress: string
  ) => {
    // Pass the hex string directly to MetaMask
    const decrypted = await window.ethereum.request({
      method: "eth_decrypt",
      params: [encryptedKey, ownerAddress],
    });
    // The result is base64, convert to Uint8Array
    return Uint8Array.from(Buffer.from(decrypted, "base64"));
  };

  // Helper: Encrypt symmetric key with accessor's public encryption key from registry
  const encryptSymmetricKeyForAccessor = async (
    key: Uint8Array,
    accessorAddress: string
  ) => {
    // Fetch accessor's public encryption key from EncryptionKeyRegistry contract
    const encryptionKeyRegistry = getEncryptionKeyRegistryContract();
    const publicKey = await encryptionKeyRegistry.getPublicEncryptionKey(
      accessorAddress
    );

    if (!publicKey || publicKey === "") {
      throw new Error(
        "Accessor has not registered their public encryption key."
      );
    }

    const encrypted = ethUtil.encrypt({
      publicKey,
      data: Buffer.from(key).toString("base64"),
      version: "x25519-xsalsa20-poly1305",
    });

    return (
      "0x" + Buffer.from(JSON.stringify(encrypted), "utf8").toString("hex")
    );
  };

  // Grant access with encrypted key
  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) onSuccess(""); // Clear previous success
    if (onError) onError(""); // Clear previous error
    setLoading(true);
    try {
      if (!newAccessor) throw new Error("Accessor address required");

      // 1. Get owner address
      const ownerAddress = await getOwnerAddress();

      // 2. Check if accessor already has access
      const accessControl = getAccessControlContract();
      const existingAccessors = await accessControl.getFileAccessors(
        ownerAddress,
        cid
      );
      if (
        existingAccessors
          .map((a: string) => a.toLowerCase())
          .includes(newAccessor.toLowerCase())
      ) {
        throw new Error("Accessor already has access to this file.");
      }

      // 3. Fetch encrypted key for owner from contract
      const encryptedKeyForOwner = await accessControl.getEncryptedKey(
        ownerAddress,
        cid
      );

      // 4. Decrypt symmetric key with owner's private key
      const symmetricKey = await decryptSymmetricKeyWithOwner(
        encryptedKeyForOwner,
        ownerAddress
      );

      // 5. Encrypt symmetric key for accessor using their registered public encryption key
      const encryptedKeyForAccessor = await encryptSymmetricKeyForAccessor(
        symmetricKey,
        newAccessor
      );

      // 6. Grant access to accessor
      const tx = await accessControl.grantAccessWithKey(
        cid,
        newAccessor,
        encryptedKeyForAccessor
      );
      await tx.wait();

      if (onSuccess) onSuccess("Access granted successfully!");
      setNewAccessor("");
    } catch (err) {
      if (onError)
        onError(err instanceof Error ? err.message : "Failed to grant access");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleGrantAccess}
      className="mb-8 bg-white/80 p-6 rounded-xl shadow flex flex-col gap-4"
    >
      <h3 className="text-lg font-semibold text-purple-700">Grant Access</h3>
      <input
        type="text"
        className="border border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg px-4 py-2 text-gray-700 placeholder-gray-400 transition-all outline-none"
        placeholder="Accessor Address (0x...)"
        value={newAccessor}
        onChange={(e) => setNewAccessor(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded px-6 py-2 shadow hover:from-purple-700 hover:to-blue-700 transition-all"
        disabled={loading}
      >
        {loading ? "Processing..." : "Grant Access"}
      </button>
    </form>
  );
}
