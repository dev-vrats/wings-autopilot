"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";
import { PillButton } from "@/components/ui/Buttons";
import { PageTransition } from "@/components/ui/PageTransition";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && role) {
      router.push(`/dashboard/${role}`);
    }
  }, [user, role, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Role will be fetched by AuthContext, which will trigger the useEffect redirect
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;
        router.push(`/dashboard/${userRole}`);
      } else {
        setError("User role not found.");
      }
    } catch (err) {
      setError(err.message || "Failed to login.");
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
          <p className="text-muted mt-2 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
          
          <PillButton type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </PillButton>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Sign up
          </Link>
        </div>
      </GlassCard>
    </PageTransition>
  );
}
