"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge } from "@/components/ui/Badges";
import { GhostButton, PillButton } from "@/components/ui/Buttons";
import { ChevronDown, ChevronUp, Check, X, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProviderInquiries() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

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

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusChange = async (inquiry, newStatus) => {
    try {
      // Update inquiry status
      const inquiryRef = doc(db, "inquiries", inquiry.id);
      await updateDoc(inquiryRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Create a notification for the business owner
      await addDoc(collection(db, "notifications"), {
        userId: inquiry.businessId,
        title: `Inquiry ${newStatus === "accepted" ? "Accepted" : "Ignored"}`,
        body: `Your inquiry for ${inquiry.service} was ${newStatus} by the provider.`,
        type: newStatus === "accepted" ? "inquiry_accepted" : "inquiry_ignored",
        isRead: false,
        createdAt: new Date().toISOString()
      });

      if (newStatus === "accepted") {
        // Create chat document if accepted
        await updateDoc(doc(db, "chats", inquiry.id), {
          inquiryId: inquiry.id,
          businessId: inquiry.businessId,
          providerId: user.uid,
          createdAt: new Date().toISOString()
        }).catch(async (e) => {
           // if chat doc doesn't exist, setDoc instead. actually we should just use setDoc.
        });
        
        // Proper way to initialize chat document:
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "chats", inquiry.id), {
          inquiryId: inquiry.id,
          businessId: inquiry.businessId,
          providerId: user.uid,
          createdAt: new Date().toISOString(),
          lastMessage: "",
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Route to chat
        router.push(`/dashboard/provider/chat/${inquiry.id}`);
      } else {
        // Just refresh the list
        fetchInquiries();
      }
    } catch (err) {
      console.error("Failed to change status:", err);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <PageTransition className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Inquiries</h1>
        <p className="text-muted mt-2">Messages from local businesses requesting your services.</p>
      </div>

      <div className="space-y-4">
        {loading && <p className="text-muted">Loading inquiries...</p>}
        
        {!loading && inquiries.length === 0 && (
          <GlassCard className="p-8 text-center text-muted">
            No inquiries yet.
          </GlassCard>
        )}

        {!loading && inquiries.map((inq) => (
          <GlassCard key={inq.id} className="overflow-hidden p-0 transition-all">
            {/* Header Row */}
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleExpand(inq.id)}
            >
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <p className="font-semibold">{inq.businessName || "Local Business"}</p>
                  <p className="text-xs text-muted mt-1">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-muted">{inq.service}</p>
                </div>
                <div className="flex items-center gap-4 justify-end md:justify-start">
                  <StatusBadge status={inq.status || "new"} />
                </div>
              </div>
              <div className="pl-4">
                {expandedId === inq.id ? (
                  <ChevronUp className="w-5 h-5 text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted" />
                )}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === inq.id && (
              <div className="p-4 border-t border-divider bg-white/[0.02]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Service Requested</p>
                      <p className="text-sm">{inq.service}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Message</p>
                      <div className="p-3 rounded-lg bg-glass-bg border border-glass-border">
                        <p className="text-sm whitespace-pre-wrap">{inq.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-end items-end">
                    {inq.status === "new" ? (
                      <div className="flex gap-3">
                        <GhostButton 
                          className="flex items-center gap-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(inq, "ignored");
                          }}
                        >
                          <X className="w-4 h-4" />
                          Ignore
                        </GhostButton>
                        <PillButton 
                          className="flex items-center gap-2 bg-white text-black hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(inq, "accepted");
                          }}
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </PillButton>
                      </div>
                    ) : inq.status === "accepted" ? (
                      <PillButton 
                        className="flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/provider/chat/${inq.id}`);
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Go to Chat
                      </PillButton>
                    ) : (
                      <p className="text-sm text-muted">Inquiry was ignored.</p>
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
