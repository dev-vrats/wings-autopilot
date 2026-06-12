"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bookmark, Inbox, TrendingUp, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { NotificationBell } from "@/components/ui/NotificationBell";

const navItems = [
  { name: "Discover Providers", href: "/dashboard/business", icon: Search },
  { name: "Saved Providers", href: "/dashboard/business/saved", icon: Bookmark },
  { name: "My Requests", href: "/dashboard/business/requests", icon: Inbox },
  { name: "Growth Insights", href: "/dashboard/business/insights", icon: TrendingUp },
];

export default function BusinessLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();

  if (!loading && (!user || role !== "business")) {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-divider bg-background flex flex-col hidden md:flex">
        <div className="p-6 border-b border-divider">
          <h1 className="text-xl font-bold tracking-tight">WINGS AutoPilot</h1>
          <p className="text-xs text-muted mt-1 uppercase tracking-wider font-semibold">Business Portal</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/business" && pathname.startsWith(item.href));
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background/50">
        {/* Topbar */}
        <header className="h-16 border-b border-divider flex items-center justify-end px-6 shrink-0 bg-background/80 backdrop-blur-md">
          {user && <NotificationBell userId={user.uid} />}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav (simplified) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-divider bg-background z-50 flex justify-around p-2">
        {navItems.map((item) => {
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

