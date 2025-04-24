'use client';

import { useState } from 'react';
import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' }); // Replace with your IPFS endpoint

interface FileUploadProps {
  onUploadAction: (cid: string) => void; // Updated to match the naming convention for Server Actions
}

export default function FileUpload({ onUploadAction }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = async () => {
    if (!file) return alert('Please select a file to upload.');
    try {
      setLoading(true);
      const added = await ipfs.add(file);
      onUploadAction(added.path); // Pass the CID back to the parent component
      alert(`File uploaded successfully! CID: ${added.path}`);
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      alert('Failed to upload file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">Upload File</h2>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full md:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={handleFileUpload}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload to IPFS'}
        </button>
      </div>
    </div>
  );
}