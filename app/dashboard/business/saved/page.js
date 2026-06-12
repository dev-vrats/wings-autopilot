"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { PillButton } from "@/components/ui/Buttons";
import { User, BookmarkX } from "lucide-react";
import Link from "next/link";

export default function SavedProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const savedDoc = await getDoc(doc(db, "users", user.uid, "data", "saved"));
      if (savedDoc.exists()) {
        const savedIds = savedDoc.data().providerIds || [];
        
        if (savedIds.length > 0) {
          // Fetch profiles
          const pSnapshot = await getDocs(collection(db, "providers"));
          const profiles = pSnapshot.docs.reduce((acc, d) => {
            acc[d.id] = d.data();
            return acc;
          }, {});

          // Fetch users manually because 'in' query is limited to 10
          const qUsers = query(collection(db, "users"), where("role", "==", "provider"));
          const userSnapshot = await getDocs(qUsers);
          
          const merged = userSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(u => savedIds.includes(u.id))
            .map(u => ({ ...u, profile: profiles[u.id] }));

          setProviders(merged);
        } else {
          setProviders([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const removeSaved = async (providerId) => {
    if (!user) return;
    const newSaved = providers.filter(p => p.id !== providerId).map(p => p.id);
    setProviders(prev => prev.filter(p => p.id !== providerId));
    
    try {
      await setDoc(doc(db, "users", user.uid, "data", "saved"), {
        providerIds: newSaved
      });
    } catch (err) {
      console.error("Failed to remove saved provider:", err);
    }
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Saved Providers</h1>
        <p className="text-muted mt-2">Experts you&apos;ve bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2].map(i => <div key={i} className="h-48 bg-glass-bg rounded-2xl" />)}
        </div>
      ) : providers.length === 0 ? (
        <GlassCard className="text-center py-16">
          <BookmarkX className="w-16 h-16 mx-auto text-muted mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No saved providers</h2>
          <p className="text-muted mb-6">Browse the marketplace and save experts you like.</p>
          <Link href="/dashboard/business">
            <PillButton>Discover Providers</PillButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(p => (
            <GlassCard key={p.id} className="flex flex-col h-full relative group">
              <button 
                onClick={() => removeSaved(p.id)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                title="Remove from saved"
              >
                <BookmarkX className="w-5 h-5 text-muted hover:text-red-400 transition-colors" />
              </button>
              
              <div className="flex items-center gap-4 mb-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-muted" />
                </div>
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-muted">{p.profile?.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {p.profile?.skills?.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-0.5 text-[10px] bg-glass-bg border border-glass-border rounded-full text-muted truncate max-w-full">
                    {skill}
                  </span>
                ))}
              </div>

              <Link href="/dashboard/business" className="mt-auto w-full">
                <PillButton className="w-full">Go to Discover to Contact</PillButton>
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
