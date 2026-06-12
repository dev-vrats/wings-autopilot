"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge } from "@/components/ui/Badges";
import { GhostButton } from "@/components/ui/Buttons";
import { SideDrawer } from "@/components/ui/SideDrawer";

export default function BusinessRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, "inquiries"), where("businessId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Requests</h1>
        <p className="text-muted mt-2">Inquiries you&apos;ve sent to service providers.</p>
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase border-b border-divider">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Service Type</th>
              <th className="px-4 py-3">Date Sent</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-divider last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 font-medium">{r.providerName || "Provider"}</td>
                <td className="px-4 py-4 text-muted">{r.service}</td>
                <td className="px-4 py-4 text-muted">
                  {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={r.status || "new"} />
                </td>
                <td className="px-4 py-4 text-right">
                  <GhostButton 
                    className="py-1 px-3 text-xs" 
                    onClick={() => {
                      setSelected(r);
                      setIsDrawerOpen(true);
                    }}
                  >
                    View
                  </GhostButton>
                </td>
              </tr>
            ))}
            {requests.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-muted">No requests sent yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Request Details"
      >
        {selected && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted mb-1">Provider</p>
                <p className="font-semibold">{selected.providerName || "Provider"}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Service Requested</p>
                <p className="font-semibold">{selected.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Date Sent</p>
                <p>{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-2">Original Message</p>
                <div className="p-4 rounded-lg bg-glass-bg border border-glass-border">
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted mb-2">Status</p>
                <StatusBadge status={selected.status || "new"} />
              </div>
            </div>
          </div>
        )}
      </SideDrawer>
    </PageTransition>
  );
}
