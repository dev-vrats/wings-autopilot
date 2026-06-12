"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserCircle, PenTool, LayoutList, Inbox, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";

const navItems = [
  { name: "My Profile", href: "/dashboard/provider", icon: UserCircle },
  { name: "Build My Profile", href: "/dashboard/provider/build-profile", icon: PenTool },
  { name: "My Services", href: "/dashboard/provider/services", icon: LayoutList },
  { name: "Inquiries", href: "/dashboard/provider/inquiries", icon: Inbox },
  { name: "WINGS AI Tools", href: "/dashboard/provider/ai-tools", icon: Sparkles },
];

export default function ProviderLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  if (!loading && (!user || role !== "provider")) {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-divider bg-background flex flex-col hidden md:flex">
        <div className="p-6 border-b border-divider">
          <h1 className="text-xl font-bold tracking-tight">WINGS AutoPilot</h1>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider font-semibold">Provider Portal</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-white/10 text-white" 
                    : "text-muted hover:bg-glass-hover hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-divider">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted hover:bg-glass-hover hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        {children}
      </main>

      {/* Mobile Nav (simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-divider bg-background z-50 flex justify-around p-2">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} className={`p-2 rounded-lg ${isActive ? "text-white" : "text-muted"}`}>
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
