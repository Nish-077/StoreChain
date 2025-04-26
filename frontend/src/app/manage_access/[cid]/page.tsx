"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ConnectWallet from "@/components/ConnectWallet";
import GrantAccessForm from "@/components/GrantAccessForm";
import AccessorsList from "@/components/AccessorsList";

export default function ManageAccessPage() {
  const { cid } = useParams<{ cid: string }>();
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilename = async () => {
      try {
        const res = await fetch(`/api/owned-pinata-files?cid=${cid}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.files?.length > 0) {
            setFilename(data.files[0].name || null);
          }
        }
      } catch {
        setFilename(null);
      }
    };
    fetchFilename();
  }, [cid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 rounded-full font-medium shadow hover:from-gray-300 hover:to-gray-200 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Connect Wallet */}
        <ConnectWallet onSuccess={setSuccess} onError={setError} />

        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
            Manage Access
          </h2>
          <p className="text-md text-purple-800 opacity-90">
            Grant and revoke access for file{" "}
            <span className="font-mono bg-purple-100 px-2 py-1 rounded">
              {filename ? filename : cid}
            </span>
          </p>
        </div>

        {/* Error & Success Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded flex justify-between items-center">
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 text-xl font-bold focus:outline-none"
            >
              ×
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded flex justify-between items-center">
            <span className="text-green-700">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-500 hover:text-green-700 text-xl font-bold focus:outline-none"
            >
              ×
            </button>
          </div>
        )}

        <GrantAccessForm onError={setError} onSuccess={setSuccess} />
        <AccessorsList onError={setError} onSuccess={setSuccess} />
      </div>
    </div>
  );
}
