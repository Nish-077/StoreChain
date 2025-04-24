'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' }); // Replace with your IPFS endpoint

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);

  // Handle file upload to IPFS
  const handleFileUpload = async () => {
    if (!file) return alert('Please select a file to upload.');
    try {
      const added = await ipfs.add(file);
      setCid(added.path); // CID from IPFS
      alert(`File uploaded successfully! CID: ${added.path}`);
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
    }
  };

  // Register file on the blockchain
  const registerFile = async () => {
    if (!cid) return alert('No CID to register.');
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to use this feature.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        'YOUR_CONTRACT_ADDRESS', // Replace with your contract address
        ['function storeFile(string cid) public'], // Replace with your contract ABI
        signer
      );
      const tx = await contract.storeFile(cid);
      await tx.wait();
      setFiles([...files, cid]);
      alert('File registered on the blockchain!');
    } catch (error) {
      console.error('Error registering file on blockchain:', error);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-10">
        Decentralized Cloud Storage
      </h1>

      {/* File Upload Section */}
      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload File</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full md:w-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleFileUpload}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
          >
            Upload to IPFS
          </button>
        </div>
        {cid && (
          <p className="mt-4 text-sm text-gray-600">
            <strong>CID:</strong> {cid}
          </p>
        )}
      </section>

      {/* Register File Section */}
      <section className="mb-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register File</h2>
        <button
          onClick={registerFile}
          disabled={!cid}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
        >
          Register File on Blockchain
        </button>
      </section>

      {/* File List Section */}
      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Files</h2>
        {files.length === 0 ? (
          <p className="text-gray-500">No files registered yet.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-2">
            {files.map((fileCid, index) => (
              <li key={index} className="text-sm text-gray-700">
                <a
                  href={`https://ipfs.io/ipfs/${fileCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {fileCid}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}