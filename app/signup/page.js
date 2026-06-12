"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/Buttons";
import { PageTransition } from "@/components/ui/PageTransition";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setSelectedRole] = useState("business"); // default
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { user, role: currentRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && currentRole) {
      router.push(`/dashboard/${currentRole}`);
    }
  }, [user, currentRole, authLoading, router]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save user to Firestore
      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });

      // Redirect
      router.push(`/dashboard/${role}`);
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <PageTransition className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">WINGS AutoPilot</h1>
          <p className="text-muted mt-2 text-sm">Create a new account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5" htmlFor="confirmPassword">
                Confirm
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-muted mb-2">
              Select Role
            </label>
            <div className="flex gap-2">
              {["business", "provider", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`
                    flex-1 py-2 px-3 rounded-full text-xs font-medium transition-all
                    ${role === r 
                      ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                      : "bg-glass-bg text-muted border border-glass-border hover:border-white/30"
                    }
                  `}
                >
                  {r === "business" ? "Business" : r === "provider" ? "Provider" : "Admin"}
                </button>
              ))}
            </div>
            {role === "admin" && (
              <p className="text-[10px] text-muted text-center mt-2 italic">
                * Admin access requires manual approval later.
              </p>
            )}
          </div>
          
          <PillButton type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </PillButton>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline">
            Login
          </Link>
        </div>
      </GlassCard>
    </PageTransition>
  );
}
