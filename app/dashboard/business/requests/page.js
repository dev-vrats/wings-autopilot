"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge } from "@/components/ui/Badges";
import { PillButton } from "@/components/ui/Buttons";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessRequests() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Requests</h1>
        <p className="text-muted mt-2">Inquiries you&apos;ve sent to service providers.</p>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-muted">Loading requests...</p>}
        
        {!loading && requests.length === 0 && (
          <GlassCard className="p-4 md:p-8 text-center text-muted">
            No requests sent yet.
          </GlassCard>
        )}

        {!loading && requests.map((r) => (
          <GlassCard key={r.id} className="overflow-hidden p-0 transition-all">
            {/* Header Row */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleExpand(r.id)}
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <p className="font-semibold">{r.providerName || "Provider"}</p>
                  <p className="text-xs text-muted mt-1">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-muted">{r.service}</p>
                </div>
                <div className="flex items-center gap-4 justify-end md:justify-start">
                  <StatusBadge status={r.status || "new"} />
                </div>
              </div>
              <div className="pl-4">
                {expandedId === r.id ? (
                  <ChevronUp className="w-5 h-5 text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === r.id && (
              <div className="p-4 border-t border-divider bg-white/[0.02]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Service Details</p>
                      <p className="text-sm">{r.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Original Message</p>
                      <div className="p-3 rounded-lg bg-glass-bg border border-glass-border">
                        <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between items-end">
                    <div className="text-right">
                      <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Status Updates</p>
                      <p className="text-sm">
                        {r.status === "accepted" 
                          ? "Provider has accepted your request! You can now chat." 
                          : r.status === "ignored" 
                          ? "Provider declined the request."
                          : "Awaiting provider response."}
                      </p>
                    </div>

                    {r.status === "accepted" && (
                      <PillButton 
                        className="mt-4 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/business/chat/${r.id}`);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Go to Chat
                      </PillButton>
                    )}
                  </div>
                </div>
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </PageTransition>
  );
}
