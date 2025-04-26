import { getAccessControlContract } from "@/utils/contracts";
import { getOwnerAddress } from "@/utils/ethereum";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AccessorsListProps {
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function AccessorsList({
  onSuccess,
  onError,
}: AccessorsListProps) {
  const { cid } = useParams<{ cid: string }>();
  const [accessors, setAccessors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState<string>("");

  useEffect(() => {
    const fetchOwner = async () => {
      const address = await getOwnerAddress();
      setOwner(address);
    };
    fetchOwner();
  }, []);

  useEffect(() => {
    if (owner && cid) fetchAccessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, cid]);

  // Fetch accessors for this file
  const fetchAccessors = async () => {
    try {
      setLoading(true);
      const accessControl = getAccessControlContract();
      const result = await accessControl.getFileAccessors(owner, cid);
      setAccessors(result);
      setLoading(false);
    } catch (err) {
      if (onError)
        onError(
          err instanceof Error ? err.message : "Failed to fetch accessors"
        );
      setLoading(false);
    }
  };

  // Revoke access
  const handleRevoke = async (accessor: string) => {
    if (onError) onError("");
    if (onSuccess) onSuccess("");
    setLoading(true);
    try {
      const accessControl = getAccessControlContract();
      await accessControl.revokeAccess(cid, accessor);
      if (onSuccess) onSuccess("Access revoked successfully!");
      fetchAccessors();
    } catch (err) {
      if (onError)
        onError(err instanceof Error ? err.message : "Failed to revoke access");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/80 p-6 rounded-xl shadow">
      <h3 className="text-lg font-semibold text-purple-700 mb-4">
        Current Accessors
      </h3>
      {loading ? (
        <div>Loading...</div>
      ) : accessors.length === 0 ? (
        <div className="text-gray-500">No accessors found.</div>
      ) : (
        <ul className="space-y-3">
          {accessors.map((addr) => (
            <li
              key={addr}
              className="flex items-center justify-between bg-purple-100/60 px-4 py-3 rounded-lg border border-purple-200 shadow-sm"
            >
              <span className="font-mono text-purple-800 text-sm break-all">
                {addr}
              </span>
              <button
                onClick={() => handleRevoke(addr)}
                className="ml-4 px-4 py-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full font-semibold shadow hover:from-red-600 hover:to-rose-600 transition"
                disabled={loading}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
