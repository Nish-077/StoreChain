"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import UploadedFilesList from "../components/UploadedFilesList";
import ConnectWallet from "../components/ConnectWallet";
import AccessibleFilesList from "@/components/AccessibleFilesList";

export default function HomePage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const uploadedFilesRef = useRef<{ refreshFiles: () => void }>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
      setSuccess(`File(s) added successfully.`);
    }
  };

  const handleUpload = () => {
    if (files.length > 0) {
      setSuccess(`Uploading ${files.length} file(s) to IPFS...`);
      setTimeout(() => {
        setSuccess(`All files uploaded successfully to IPFS!`);
        uploadedFilesRef.current?.refreshFiles();
      }, 2000);
    } else {
      setError("No files selected for upload.");
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setSuccess(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Animation */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4 animate-gradient">
            StoreChain
          </h1>
          <p className="text-lg md:text-xl text-purple-800 opacity-90">
            Secure, immutable, decentralized file storage on IPFS with
            blockchain-based access and ownership management.
          </p>
        </div>

        {/* Error & Success Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 text-xl font-bold focus:outline-none"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl flex justify-between items-center">
            <p className="text-green-700">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-500 hover:text-green-700 text-xl font-bold focus:outline-none"
              aria-label="Close success"
            >
              ×
            </button>
          </div>
        )}

        <ConnectWallet onSuccess={setSuccess} onError={setError} />

        {/* Main Card with Glass Effect */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-purple-100/50">
          {/* Drag-and-Drop File Upload */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
              Drag & Drop File Upload
            </h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-100"
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
            {files.length > 0 && (
              <div className="mt-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-blue-100 rounded-lg border border-blue-300 mb-2"
                  >
                    <p className="text-sm text-blue-800 font-medium">{file.name}</p>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-500 hover:text-red-700 text-lg font-bold focus:outline-none"
                      aria-label="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <button
                onClick={handleUpload}
                className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                disabled={files.length === 0}
              >
                Upload to IPFS
              </button>
            </div>
          </section>

          {/* Uploaded Files List */}
          <UploadedFilesList
            ref={uploadedFilesRef}
            onSuccess={setSuccess}
            onError={setError}
          />

          {/* Accessible Files List */}
          <AccessibleFilesList onSuccess={setSuccess} onError={setError} />
        </div>

        {/* Footer with Links */}
        <div className="mt-8 text-center text-purple-600 text-sm">
          <p className="mb-2">Powered by Pinata IPFS & Polygon Amoy Blockchain</p>
          <div className="flex justify-center gap-4">
            <a href="/about" className="hover:text-purple-800 transition-colors">
              About
            </a>
            <a
              href="https://github.com/Nish-077/StoreChain"
              className="hover:text-purple-800 transition-colors"
              target="_blank"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}