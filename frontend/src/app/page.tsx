'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';

// Define IPFS client with proper typing
const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [cid, setCid] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    try {
      const added = await ipfs.add(file);
      setCid(added.path); // CID from IPFS
      alert(`File uploaded successfully! CID: ${added.path}`);
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
    }
  };

  const registerFile = async () => {
    if (!cid) {
      alert('No CID to register.');
      return;
    }
    try {
      if (!window.ethereum) {
        alert('MetaMask is not installed. Please install it to use this feature.');
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        'YOUR_CONTRACT_ADDRESS',
        ['function storeFile(string cid) public'],
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Decentralized Cloud Storage
          </h1>
          <p className="text-lg text-purple-800">Secure, immutable file storage on IPFS and Blockchain</p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-4 border-purple-100">
          {/* File Upload Section */}
          <section className="mb-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">Upload File</h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <div className="relative w-full">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-purple-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 transition-all duration-300 file:shadow-md file:cursor-pointer"
                />
              </div>
              <button
                onClick={handleFileUpload}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
              >
                Upload to IPFS
              </button>
            </div>
            {cid && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                <p className="text-sm text-blue-800 text-center font-medium">
                  <span className="font-bold">CID:</span> {cid}
                </p>
              </div>
            )}
          </section>

          {/* Register File Section */}
          <section className="mb-12 p-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
            <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">Register File</h2>
            <div className="flex justify-center">
              <button
                onClick={registerFile}
                disabled={!cid}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold rounded-full shadow-lg hover:from-teal-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Register File on Blockchain
              </button>
            </div>
          </section>

          {/* File List Section */}
          <section className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
            <h2 className="text-2xl font-bold text-rose-800 mb-6 text-center">Your Files</h2>
            {files.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-pink-600">No files registered yet.</p>
                <div className="mt-4 text-4xl">📁</div>
              </div>
            ) : (
              <ul className="space-y-3">
                {files.map((fileCid, index) => (
                  <li 
                    key={index} 
                    className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 border-rose-400"
                  >
                    <a
                      href={`https://ipfs.io/ipfs/${fileCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-300 flex items-center"
                    >
                      <span className="mr-2">🔗</span>
                      <span className="truncate">{fileCid}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-600 text-sm">
          <p>Powered by IPFS & Ethereum Blockchain</p>
        </div>
      </div>
    </div>
  );
}