"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { StatusBadge, SkillPill } from "@/components/ui/Badges";
import { PillButton } from "@/components/ui/Buttons";
import { User } from "lucide-react";

export default function ProviderProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "providers", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) return null;

  return (
    <PageTransition className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <PillButton onClick={() => router.push("/dashboard/provider/build-profile")}>
          {profile ? "Edit Profile" : "Create Profile"}
        </PillButton>
      </div>

      {!profile ? (
        <GlassCard className="text-center py-16">
          <User className="w-16 h-16 mx-auto text-muted mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">No Profile Yet</h2>
          <p className="text-muted mb-6">Create your provider profile to start receiving inquiries.</p>
          <PillButton onClick={() => router.push("/dashboard/provider/build-profile")}>
            Build My Profile
          </PillButton>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-glass-bg border border-glass-border flex justify-between items-center">
            <span className="font-medium text-muted">Profile Status</span>
            <StatusBadge status={profile.status} />
          </div>

          <GlassCard className="relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar placeholder */}
              <div className="w-32 h-32 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center shrink-0">
                <User className="w-12 h-12 text-muted" />
              </div>
              
              <div className="flex-1 space-y-6 w-full">
                <div>
                  <h2 className="text-3xl font-bold">{profile.name}</h2>
                  <p className="text-muted mt-1">{profile.location}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">About</h3>
                  <p className="text-sm leading-relaxed">{profile.bio}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Skills & Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill) => (
                      <SkillPill key={skill} skill={skill} />
                    ))}
                  </div>
                </div>

                {profile.portfolioLinks?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Portfolio</h3>
                    <ul className="space-y-2">
                      {profile.portfolioLinks.map((link, i) => (
                        link && (
                          <li key={i}>
                            <a href={link} target="_blank" rel="noreferrer" className="text-sm hover:underline text-muted hover:text-white transition-colors">
                              {link}
                            </a>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </PageTransition>
  );
}
