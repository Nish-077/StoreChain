import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'https://ipfs.infura.io:5001/api/v0' });

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const added = await ipfs.add(file);
    return added.path; // CID of the uploaded file
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

export const getIPFSLink = (cid: string): string => {
  return `https://ipfs.io/ipfs/${cid}`;
};