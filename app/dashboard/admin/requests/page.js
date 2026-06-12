"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge } from "@/components/ui/Badges";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = collection(db, "inquiries");
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Usually you would populate businessName and providerName from their respective IDs
      // For now, assuming they are stored in the inquiry doc or using placeholders
      setRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "inquiries", id), { status: newStatus });
      fetchRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Service Requests</h1>
        <p className="text-muted mt-2">Overview of platform inquiries.</p>
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase border-b border-divider">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-divider last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 font-medium">{r.businessName || "Unknown Business"}</td>
                <td className="px-4 py-4">{r.providerName || "Unknown Provider"}</td>
                <td className="px-4 py-4 text-muted">{r.service}</td>
                <td className="px-4 py-4 text-muted">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={r.status || "new"} />
                </td>
                <td className="px-4 py-4 text-right">
                  <select
                    value={r.status || "new"}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    className="bg-glass-bg border border-glass-border text-white text-xs rounded px-2 py-1 outline-none"
                  >
                    <option value="new">New</option>
                    <option value="in review">In Review</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                </td>
              </tr>
            ))}
            {requests.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-muted">No requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>
    </PageTransition>
  );
}
