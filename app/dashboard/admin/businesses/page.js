"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge } from "@/components/ui/Badges";
import { GhostButton } from "@/components/ui/Buttons";
import { SideDrawer } from "@/components/ui/SideDrawer";

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "business"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: "Active" }));
      setBusinesses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Local Businesses</h1>
        <p className="text-muted mt-2">Manage businesses on the platform.</p>
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase border-b border-divider">
            <tr>
              <th className="px-4 py-3">Business / Owner</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-b border-divider last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 font-medium">{b.name}</td>
                <td className="px-4 py-4 text-muted">{b.email}</td>
                <td className="px-4 py-4 text-muted">
                  {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={b.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <GhostButton 
                    className="py-1 px-3 text-xs" 
                    onClick={() => {
                      setSelected(b);
                      setIsDrawerOpen(true);
                    }}
                  >
                    View
                  </GhostButton>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-muted">No businesses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Business Details"
      >
        {selected && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">{selected.name}</h3>
              <p className="text-muted">{selected.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted mb-2">Joined</p>
              <p>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        )}
      </SideDrawer>
    </PageTransition>
  );
}
