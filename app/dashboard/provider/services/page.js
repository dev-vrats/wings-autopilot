"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";

export default function ProviderServices() {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "providers", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSkills(data.skills || []);
          setExperience(data.experience || {});
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const toggleAvailability = async (skill) => {
    // In a real app, you might track availability per service.
    // For this mockup, we'll just show it toggling visually.
    alert(`Toggled availability for ${skill}`);
  };

  if (loading) return null;

  return (
    <PageTransition className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Services</h1>
        <p className="text-muted mt-2">Manage the services you offer to local businesses.</p>
      </div>

      {skills.length === 0 ? (
        <GlassCard className="text-center py-12 text-muted">
          No services listed. Go to Build My Profile to add skills.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map(skill => (
            <GlassCard key={skill} className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{skill}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked onChange={() => toggleAvailability(skill)} />
                  <div className="w-9 h-5 bg-glass-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white/40"></div>
                </label>
              </div>
              <p className="text-sm text-muted flex-1 line-clamp-3">
                {experience[skill] || "No description provided."}
              </p>
            </GlassCard>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
