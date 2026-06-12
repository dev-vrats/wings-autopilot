"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { PillButton, GhostButton } from "@/components/ui/Buttons";
import { SkillPill } from "@/components/ui/Badges";

const AVAILABLE_SKILLS = [
  "Web Development", "Social Media Marketing", "Google Business Profile Management",
  "Meta Ads", "Professional Photography/Videography", "Content Creation (Reels)",
  "Post Design", "Copywriting"
];

export default function BuildProfile() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
    skills: [],
    experience: {},
    portfolioLinks: ["", "", ""],
  });

  const handleSkillToggle = (skill) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const submitProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "providers", user.uid), {
        ...formData,
        status: "pending",
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      router.push("/dashboard/provider");
    } catch (err) {
      console.error(err);
      alert("Failed to submit profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Build Your Service Profile</h1>
        <p className="text-muted mt-2">Complete these steps to list your services.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-white" : "bg-divider"}`} />
        ))}
      </div>

      <GlassCard>
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 1: Personal Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">City / Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Short Bio (max 200 chars)</label>
                <textarea
                  maxLength={200}
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <PillButton onClick={() => setStep(2)}>Next Step</PillButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 2: Skills & Services</h2>
            <div className="flex flex-wrap gap-3">
              {AVAILABLE_SKILLS.map(skill => (
                <SkillPill 
                  key={skill} 
                  skill={skill} 
                  active={formData.skills.includes(skill)}
                  onClick={() => handleSkillToggle(skill)}
                />
              ))}
            </div>

            {formData.skills.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-divider mt-6">
                <h3 className="text-sm font-medium text-muted">Describe your experience</h3>
                {formData.skills.map(skill => (
                  <div key={skill}>
                    <label className="block text-sm mb-1.5">{skill}</label>
                    <textarea
                      rows={2}
                      placeholder={`Years of experience and brief details about your work in ${skill}...`}
                      value={formData.experience[skill] || ""}
                      onChange={(e) => setFormData({
                        ...formData, 
                        experience: {...formData.experience, [skill]: e.target.value}
                      })}
                      className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white text-sm resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <GhostButton onClick={() => setStep(1)}>Back</GhostButton>
              <PillButton onClick={() => setStep(3)}>Next Step</PillButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 3: Portfolio & Proof</h2>
            <div className="space-y-4">
              {[0, 1, 2].map(index => (
                <div key={index}>
                  <label className="block text-sm font-medium text-muted mb-1.5">Portfolio Link {index + 1}</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={formData.portfolioLinks[index]}
                    onChange={(e) => {
                      const newLinks = [...formData.portfolioLinks];
                      newLinks[index] = e.target.value;
                      setFormData({...formData, portfolioLinks: newLinks});
                    }}
                    className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <GhostButton onClick={() => setStep(2)}>Back</GhostButton>
              <PillButton onClick={() => setStep(4)}>Review</PillButton>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 4: Review & Submit</h2>
            <div className="space-y-4 text-sm bg-glass-bg p-6 rounded-xl border border-glass-border">
              <div className="grid grid-cols-3 border-b border-divider pb-2">
                <span className="text-muted">Name</span>
                <span className="col-span-2 font-medium">{formData.name}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-divider pb-2">
                <span className="text-muted">Location</span>
                <span className="col-span-2 font-medium">{formData.location}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-divider pb-2">
                <span className="text-muted">Bio</span>
                <span className="col-span-2 font-medium">{formData.bio}</span>
              </div>
              <div className="grid grid-cols-3 border-b border-divider pb-2">
                <span className="text-muted">Skills</span>
                <span className="col-span-2 font-medium">{formData.skills.join(", ") || "None"}</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <GhostButton onClick={() => setStep(3)}>Back</GhostButton>
              <PillButton onClick={submitProfile} disabled={loading}>
                {loading ? "Submitting..." : "Submit for Review"}
              </PillButton>
            </div>
          </div>
        )}
      </GlassCard>
    </PageTransition>
  );
}
