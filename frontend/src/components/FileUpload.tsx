"use client";

import { pinata } from "@/utils/config";
import { useState, useRef } from "react";

interface FileUploadProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function FileUpload({ onSuccess, onError }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Upload file using Pinata's signed URL flow
  const handleFileUpload = async () => {
    if (!file) {
      if (onError) onError("Please select a file.");
      return;
    }
    setIsUploading(true);
    if (onError) onError(""); // Clear previous error
    if (onSuccess) onSuccess(""); // Clear previous success

    try {
      // Get the signed upload URL from your backend
      const urlRequest = await fetch("/api/upload");
      if (!urlRequest.ok) throw new Error("Failed to get upload URL");
      const urlResponse = await urlRequest.json();

      const upload = await pinata.upload.public.file(file).url(urlResponse.url);

      if (onSuccess) onSuccess(`File: ${upload.name} uploaded successfully`);

      // Deselect the file after successful upload
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      if (onError) onError("Error uploading file. Please try again.");
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
