"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge, SkillPill } from "@/components/ui/Badges";
import { GhostButton } from "@/components/ui/Buttons";
import { SideDrawer } from "@/components/ui/SideDrawer";

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "provider"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Merge with providers collection details if needed, for now just basic data
      // (assuming profile details are in a subcollection or separate 'providers' collection)
      const providersRef = collection(db, "providers");
      const pSnapshot = await getDocs(providersRef);
      const profiles = pSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      const merged = data.map(user => ({
        ...user,
        profile: profiles[user.id] || { status: "pending", skills: [], location: "N/A" }
      }));

      setProviders(merged);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleApprove = async (id) => {
    try {
      await updateDoc(doc(db, "providers", id), { status: "published" });
      fetchProviders();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const filtered = providers.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Service Providers</h1>
          <p className="text-muted mt-2">Manage and approve provider profiles.</p>
        </div>
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white w-full md:w-64"
        />
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase border-b border-divider">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((provider) => (
              <tr key={provider.id} className="border-b border-divider last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 font-medium">{provider.name}</td>
                <td className="px-4 py-4 text-muted">{provider.profile.location}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={provider.profile.status} />
                </td>
                <td className="px-4 py-4 text-right">
                  <GhostButton 
                    className="py-1 px-3 text-xs" 
                    onClick={() => {
                      setSelectedProvider(provider);
                      setIsDrawerOpen(true);
                    }}
                  >
                    View
                  </GhostButton>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-muted">No providers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Provider Details"
      >
        {selectedProvider && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold">{selectedProvider.name}</h3>
              <p className="text-muted">{selectedProvider.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted mb-2">Location</p>
              <p>{selectedProvider.profile.location}</p>
            </div>

            <div>
              <p className="text-sm text-muted mb-2">Status</p>
              <StatusBadge status={selectedProvider.profile.status} />
            </div>

            <div>
              <p className="text-sm text-muted mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {selectedProvider.profile.skills?.length > 0 ? (
                  selectedProvider.profile.skills.map(s => <SkillPill key={s} skill={s} />)
                ) : (
                  <span className="text-muted text-sm">No skills listed.</span>
                )}
              </div>
            </div>

            {selectedProvider.profile.status === "pending" && (
              <div className="pt-6 border-t border-divider">
                <GhostButton 
                  className="w-full justify-center bg-white text-black hover:bg-gray-200"
                  onClick={() => handleApprove(selectedProvider.id)}
                >
                  Approve Profile
                </GhostButton>
              </div>
            )}
          </div>
        )}
      </SideDrawer>
    </PageTransition>
  );
}
