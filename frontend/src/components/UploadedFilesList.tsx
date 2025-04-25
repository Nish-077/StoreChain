"use client";

import { useEffect, useState } from "react";
import { pinata } from "@/utils/config";

interface PinataFile {
  id: string;
  name: string | null;
  cid: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  group_id: string | null;
  created_at: string;
}

export default function UploadedFilesList() {
  const [files, setFiles] = useState<PinataFile[]>([]);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      const res = await fetch("/api/pinata-files");
      const data = await res.json();
      setFiles(data.files || []);
      setLoading(false);
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      for (const file of files) {
        urls[file.cid] = await pinata.gateways.public.convert(file.cid);
      }
      setFileUrls(urls);
    };
    if (files.length > 0) fetchUrls();
  }, [files]);

  return (
    <section className="p-6 bg-gradient-to-r from-pink-50/90 to-rose-50/90 rounded-xl border border-pink-200/50">
      <h2 className="text-2xl font-bold text-rose-800 mb-6 text-center">
        Your Files
      </h2>
      {loading ? (
        <div className="text-center py-6 text-pink-600">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-pink-600">No files registered yet.</p>
          <div className="mt-4 text-4xl animate-bounce">📁</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {files.map((file, idx) => (
            <li
              key={file.cid + idx}
              className="p-3 bg-white/50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-rose-400 hover:translate-x-1"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold text-rose-700">
                    {file.name || "Unnamed file"}
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    CID: {file.cid}
                  </div>
                </div>
                <a
                  href={fileUrls[file.cid]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full font-medium shadow hover:from-pink-500 hover:to-rose-500 transition-colors"
                >
                  Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
