"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { PillButton } from "@/components/ui/Buttons";
import { SideDrawer } from "@/components/ui/SideDrawer";
import { User, Bookmark, Search } from "lucide-react";

export default function DiscoverProviders() {
  const { user } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedProviders, setSavedProviders] = useState([]);
  
  const [inquiryService, setInquiryService] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all providers from users collection
        const qUsers = query(collection(db, "users"), where("role", "==", "provider"));
        const userSnapshot = await getDocs(qUsers);
        const usersData = userSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch their profiles from providers collection
        const pSnapshot = await getDocs(collection(db, "providers"));
        const profiles = pSnapshot.docs.reduce((acc, d) => {
          acc[d.id] = d.data();
          return acc;
        }, {});

        // Merge and filter published ones
        const merged = usersData
          .map(u => ({ ...u, profile: profiles[u.id] }))
          .filter(u => u.profile?.status === "published");

        setProviders(merged);

        // Fetch saved providers
        if (user) {
          const savedDoc = await getDoc(doc(db, "users", user.uid, "data", "saved"));
          if (savedDoc.exists()) {
            setSavedProviders(savedDoc.data().providerIds || []);
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const toggleSave = async (providerId) => {
    if (!user) return;
    const isSaved = savedProviders.includes(providerId);
    const newSaved = isSaved 
      ? savedProviders.filter(id => id !== providerId)
      : [...savedProviders, providerId];
    
    setSavedProviders(newSaved);
    
    // Save to Firestore subcollection
    try {
      await setDoc(doc(db, "users", user.uid, "data", "saved"), {
        providerIds: newSaved
      });
    } catch (err) {
      console.error("Failed to save provider:", err);
    }
  };

  const handleSendInquiry = async (e) => {
    e.preventDefault();
    if (!user || !selectedProvider || !inquiryService) return;
    setSendingInquiry(true);

    try {
      const inquiryId = Date.now().toString(); // simple ID generator for mockup
      await setDoc(doc(db, "inquiries", inquiryId), {
        businessId: user.uid,
        businessName: user.displayName || "Local Business",
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        service: inquiryService,
        message: inquiryMessage,
        status: "new",
        createdAt: new Date().toISOString()
      });
      alert("Inquiry sent successfully!");
      setIsDrawerOpen(false);
      setInquiryMessage("");
      setInquiryService("");
    } catch (err) {
      console.error(err);
      alert("Failed to send inquiry.");
    } finally {
      setSendingInquiry(false);
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.profile?.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find Experts Near You</h1>
          <p className="text-muted mt-2">Discover skilled providers to grow your brand.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-glass-bg rounded-2xl" />)}
        </div>
      ) : filteredProviders.length === 0 ? (
        <GlassCard className="text-center py-16 text-muted">
          No published providers found matching your search.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map(p => (
            <GlassCard key={p.id} className="flex flex-col h-full relative group">
              <button 
                onClick={() => toggleSave(p.id)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <Bookmark className={`w-5 h-5 ${savedProviders.includes(p.id) ? "fill-white text-white" : "text-muted"}`} />
              </button>
              
              <div className="flex items-center gap-4 mb-4 pt-2">
                <div className="w-12 h-12 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-muted" />
                </div>
                <div>
                  <h3 className="font-bold">{p.name}</h3>
                  <p className="text-xs text-muted">{p.profile.location}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.profile.skills?.slice(0, 3).map(skill => (
                  <span key={skill} className="px-2 py-0.5 text-[10px] bg-glass-bg border border-glass-border rounded-full text-muted truncate max-w-full">
                    {skill}
                  </span>
                ))}
                {p.profile.skills?.length > 3 && (
                  <span className="px-2 py-0.5 text-[10px] bg-glass-bg border border-glass-border rounded-full text-muted">
                    +{p.profile.skills.length - 3}
                  </span>
                )}
              </div>

              <p className="text-sm text-muted flex-1 line-clamp-2 mb-6">
                {p.profile.bio}
              </p>

              <PillButton 
                onClick={() => {
                  setSelectedProvider(p);
                  setIsDrawerOpen(true);
                }}
                className="w-full mt-auto"
              >
                View Profile
              </PillButton>
            </GlassCard>
          ))}
        </div>
      )}

      <SideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        title="Provider Profile"
      >
        {selectedProvider && (
          <div className="space-y-8 flex flex-col h-full">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-muted" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedProvider.name}</h2>
                  <p className="text-sm text-muted">{selectedProvider.profile.location}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6">{selectedProvider.profile.bio}</p>

              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Skills & Experience</h3>
              <div className="space-y-4 mb-6">
                {selectedProvider.profile.skills?.map(skill => (
                  <div key={skill} className="p-3 rounded-lg bg-glass-bg border border-glass-border">
                    <p className="font-medium text-sm mb-1">{skill}</p>
                    <p className="text-xs text-muted">
                      {selectedProvider.profile.experience?.[skill] || "No details provided."}
                    </p>
                  </div>
                ))}
              </div>

              {selectedProvider.profile.portfolioLinks?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Portfolio</h3>
                  <ul className="space-y-2">
                    {selectedProvider.profile.portfolioLinks.map((link, i) => (
                      link && (
                        <li key={i}>
                          <a href={link} target="_blank" rel="noreferrer" className="text-xs hover:underline text-muted hover:text-white transition-colors truncate block">
                            {link}
                          </a>
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-divider">
              <h3 className="text-sm font-semibold mb-4">Send an Inquiry</h3>
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Service Needed</label>
                  <select
                    required
                    value={inquiryService}
                    onChange={(e) => setInquiryService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-glass-bg border border-glass-border text-white text-sm focus:outline-none focus:ring-1 focus:ring-white"
                  >
                    <option value="" disabled>Select a service</option>
                    {selectedProvider.profile.skills?.map(s => (
                      <option key={s} value={s} className="bg-black text-white">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5">Message</label>
                  <textarea
                    required
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe your project needs..."
                    className="w-full px-3 py-2 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white text-sm resize-none"
                  />
                </div>
                <PillButton type="submit" className="w-full" disabled={sendingInquiry}>
                  {sendingInquiry ? "Sending..." : "Submit Inquiry"}
                </PillButton>
              </form>
            </div>
          </div>
        )}
      </SideDrawer>
    </PageTransition>
  );
}
