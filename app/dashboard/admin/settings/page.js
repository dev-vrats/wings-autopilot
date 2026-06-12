"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { PillButton } from "@/components/ui/Buttons";

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState("WINGS AutoPilot");
  const [supportEmail, setSupportEmail] = useState("support@wingsautopilot.com");
  const [adminName, setAdminName] = useState("Admin User");
  const [allowSignups, setAllowSignups] = useState(true);
  const [showProviders, setShowProviders] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // In a real app, save to Firestore /settings/platform
    alert("Settings saved successfully.");
  };

  return (
    <PageTransition className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted mt-2">Manage global platform configurations.</p>
      </div>

      <GlassCard>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b border-divider pb-2">General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1.5">Primary Admin Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold border-b border-divider pb-2">Preferences</h2>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-glass-bg border border-glass-border">
              <div>
                <p className="font-medium text-white">Allow New Signups</p>
                <p className="text-sm text-muted">Enable or disable new user registrations.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={allowSignups} onChange={(e) => setAllowSignups(e.target.checked)} />
                <div className="w-11 h-6 bg-glass-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-glass-bg border border-glass-border">
              <div>
                <p className="font-medium text-white">Show Providers to Unverified Businesses</p>
                <p className="text-sm text-muted">Allow businesses to view provider profiles before approval.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={showProviders} onChange={(e) => setShowProviders(e.target.checked)} />
                <div className="w-11 h-6 bg-glass-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/40"></div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-divider flex justify-end">
            <PillButton type="submit">Save Changes</PillButton>
          </div>
        </form>
      </GlassCard>
    </PageTransition>
  );
}
