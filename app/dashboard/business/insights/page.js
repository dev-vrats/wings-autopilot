"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, ArrowRight, TrendingUp, Users, Target, Search } from "lucide-react";

const reachData = [
  { month: "Jan", reach: 4000 },
  { month: "Feb", reach: 5500 },
  { month: "Mar", reach: 7200 },
  { month: "Apr", reach: 11000 },
  { month: "May", reach: 18500 },
  { month: "Jun", reach: 24000 },
];

export default function BusinessInsights() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const handleAskAgent = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsAsking(true);
    setAnswer("");

    // Mock AI response
    setTimeout(() => {
      setAnswer("Based on your current platform data and industry trends, I recommend focusing on updating your Google Business Profile weekly with photos of recent work. Additionally, starting a targeted Meta Ads campaign with a $15/day budget could increase your local reach by up to 35% within the first month. Would you like me to find a provider who specializes in this?");
      setIsAsking(false);
    }, 1500);
  };

  return (
    <PageTransition className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8" /> Your Brand Growth Dashboard
        </h1>
        <p className="text-muted mt-2">AI-driven insights and projections for your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted font-medium">Est. Monthly Reach</p>
            <Users className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold">24,000</p>
          <p className="text-xs text-green-400 mt-2">+12% from last month</p>
        </GlassCard>
        <GlassCard>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted font-medium">Content Pieces Needed</p>
            <Target className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold">8</p>
          <p className="text-xs text-muted mt-2">per month for optimal growth</p>
        </GlassCard>
        <GlassCard>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted font-medium">Recommended Ad Budget</p>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold">$450</p>
          <p className="text-xs text-muted mt-2">Monthly on Meta/Google</p>
        </GlassCard>
        <GlassCard>
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm text-muted font-medium">GBP Score</p>
            <Search className="w-4 h-4 text-white" />
          </div>
          <p className="text-3xl font-bold">85/100</p>
          <p className="text-xs text-muted mt-2">Missing recent updates</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard>
            <h2 className="text-xl font-bold mb-6">Estimated Reach Growth (90 Days)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reachData}>
                  <XAxis dataKey="month" stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                  <YAxis stroke="#666" tick={{fill: '#666', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#fff" fill="rgba(255,255,255,0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-center text-muted mt-4">Projection based on activating recommended services</p>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5" /> Ask the Growth Agent
            </h2>
            
            <div className="mb-6 min-h-[120px] rounded-lg bg-black/40 border border-glass-border p-5 text-sm leading-relaxed">
              {isAsking ? (
                <div className="flex space-x-2 items-center h-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              ) : answer ? (
                <TypewriterText text={answer} delay={20} />
              ) : (
                <p className="text-muted italic flex items-center h-full">
                  Ask me anything about growing your business, improving your local SEO, or which services you should invest in...
                </p>
              )}
            </div>

            <form onSubmit={handleAskAgent} className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g., How do I get more Google reviews?"
                className="w-full pl-4 pr-12 py-3 rounded-full bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white transition-all text-sm"
              />
              <button 
                type="submit"
                disabled={isAsking || !question.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <h2 className="text-xl font-bold mb-6">AI Growth Plan</h2>
            <div className="relative border-l border-divider ml-3 space-y-8 pb-4">
              {[
                { week: "Week 1", title: "Foundation", desc: "Optimize Google Business Profile and set up review generation system." },
                { week: "Week 2", title: "Content Creation", desc: "Shoot and edit 4 high-quality Reels for Instagram and Facebook." },
                { week: "Week 3", title: "Paid Acquisition", desc: "Launch targeted Meta Ads campaign focusing on local radius." },
                { week: "Week 4", title: "Optimization", desc: "Analyze ad performance and refine targeting. Publish next batch of posts." },
              ].map((step, i) => (
                <div key={i} className="relative pl-6">
                  <div className="absolute w-3 h-3 bg-white rounded-full -left-[6.5px] top-1" />
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted mb-1">{step.week}</h3>
                  <h4 className="font-bold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
