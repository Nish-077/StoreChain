'use client';

interface FileListProps {
  files: string[]; // Array of file CIDs
}

export default function FileList({ files }: FileListProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-blue-700 mb-6">Your Files</h2>
      {files.length === 0 ? (
        <p className="text-gray-500 text-center">No files registered yet.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-4">
          {files.map((fileCid, index) => (
            <li key={index} className="text-sm text-gray-700">
              <a
                href={`https://ipfs.io/ipfs/${fileCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline hover:text-blue-800 transition-colors"
              >
                {fileCid}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}