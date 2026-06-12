"use client";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Day 1", signups: 2 },
  { name: "Day 5", signups: 5 },
  { name: "Day 10", signups: 8 },
  { name: "Day 15", signups: 15 },
  { name: "Day 20", signups: 12 },
  { name: "Day 25", signups: 24 },
  { name: "Day 30", signups: 35 },
];

export default function AdminOverview() {
  const [stats, setStats] = useState({ providers: 0, businesses: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const usersRef = collection(db, "users");
        
        // Providers count
        const qProviders = query(usersRef, where("role", "==", "provider"));
        const pSnapshot = await getDocs(qProviders);
        
        // Businesses count
        const qBusinesses = query(usersRef, where("role", "==", "business"));
        const bSnapshot = await getDocs(qBusinesses);

        setStats({
          providers: pSnapshot.size,
          businesses: bSnapshot.size,
        });

        // Recent users (just get all for now and sort in memory for simplicity)
        const allUsers = await getDocs(usersRef);
        let usersList = [];
        allUsers.forEach(doc => usersList.push({ id: doc.id, ...doc.data() }));
        usersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setRecentUsers(usersList.slice(0, 5));
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <PageTransition className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Platform Overview</h1>
          <p className="text-muted mt-2">Key metrics and recent activity across WINGS AutoPilot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <p className="text-sm text-muted font-medium">Total Service Providers</p>
          <p className="text-3xl font-bold mt-2">{loading ? "-" : stats.providers}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted font-medium">Total Local Businesses</p>
          <p className="text-3xl font-bold mt-2">{loading ? "-" : stats.businesses}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted font-medium">Active Service Listings</p>
          <p className="text-3xl font-bold mt-2">24</p>
        </GlassCard>
        <GlassCard>
          <p className="text-sm text-muted font-medium">Signups This Month</p>
          <p className="text-3xl font-bold mt-2">35</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Signups over last 30 days</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                  <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#fff" fill="rgba(255,255,255,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-bold mb-4">Recent Signups</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-black/20">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 rounded-tr-lg">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-divider last:border-0 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3 text-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-muted">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Activity Feed</h2>
            <div className="space-y-6">
              {[
                { time: "2h ago", text: "New provider joined: Sarah Design" },
                { time: "5h ago", text: "Business 'Local Cafe' signed up" },
                { time: "1d ago", text: "Profile published for Mark M." },
                { time: "2d ago", text: "New service request submitted" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-white mt-1.5" />
                    {i !== 3 && <div className="w-px h-full bg-divider my-1" />}
                  </div>
                  <div>
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
