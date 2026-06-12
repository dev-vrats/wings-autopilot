"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge } from "@/components/ui/Badges";
import { GhostButton, PillButton } from "@/components/ui/Buttons";
import { SideDrawer } from "@/components/ui/SideDrawer";

export default function ProviderInquiries() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(collection(db, "inquiries"), where("providerId", "==", user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInquiries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, [user]);

  const handleReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    alert("Reply sent! (Mock implementation)");
    setReplyText("");
    setIsDrawerOpen(false);
  };

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-muted mt-2">Messages from local businesses requesting your services.</p>
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted uppercase border-b border-divider">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Message Snippet</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-b border-divider last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-4 font-medium">{inq.businessName || "Local Business"}</td>
                <td className="px-4 py-4">{inq.service}</td>
                <td className="px-4 py-4 text-muted max-w-[200px] truncate">{inq.message}</td>
                <td className="px-4 py-4">
                  <StatusBadge status={inq.status || "new"} />
                </td>
                <td className="px-4 py-4 text-right">
                  <GhostButton 
                    className="py-1 px-3 text-xs" 
                    onClick={() => {
                      setSelected(inq);
                      setIsDrawerOpen(true);
                    }}
                  >
                    View
                  </GhostButton>
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && !loading && (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-muted">No inquiries yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </GlassCard>

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Inquiry Details"
      >
        {selected && (
          <div className="space-y-6 flex flex-col h-full">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted mb-1">From</p>
                <p className="font-semibold">{selected.businessName || "Local Business"}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Service Requested</p>
                <p className="font-semibold">{selected.service}</p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Message</p>
                <div className="p-4 rounded-lg bg-glass-bg border border-glass-border">
                  <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-divider">
              <form onSubmit={handleReply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-1.5">Reply</label>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response..."
                    className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white text-sm resize-none"
                  />
                </div>
                <PillButton type="submit" className="w-full">Send Reply</PillButton>
              </form>
            </div>
          </div>
        )}
      </SideDrawer>
    </PageTransition>
  );
}
