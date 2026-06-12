"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PageTransition } from "@/components/ui/PageTransition";
import { PillButton } from "@/components/ui/Buttons";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { Sparkles } from "lucide-react";

export default function ProviderAITools() {
  const [activeTool, setActiveTool] = useState("adCopy");
  const [inputData, setInputData] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const tools = [
    { id: "adCopy", name: "Ad Copy Generator", desc: "Generate Meta ad copy from product description" },
    { id: "caption", name: "Caption Generator", desc: "Create social media captions with hashtags" },
    { id: "gbp", name: "GBP Post Writer", desc: "Draft Google Business Profile updates" }
  ];

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!inputData.trim()) return;
    
    setIsGenerating(true);
    setOutput("");

    // Mock AI generation delay
    setTimeout(() => {
      let result = "";
      if (activeTool === "adCopy") {
        result = "🚀 Ready to scale your brand? \n\nIntroducing our latest solution designed for maximum growth. Tap the link below to discover how we can help you dominate your market today! \n\n👉 Click Here: [Link]\n#Growth #Marketing";
      } else if (activeTool === "caption") {
        result = "Feeling inspired today! 🌟 Here's a quick look at what we've been working on. When you put passion into your craft, the results speak for themselves. Drop a 💯 if you agree!\n\n#Inspiration #BehindTheScenes #CreativeWork";
      } else {
        result = "📢 UPDATE: We've just expanded our service offerings! Visit us this week to check out the new features designed to serve you better. Call us at [Phone] or visit our website to book your spot! ✅";
      }
      
      setOutput(result);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <PageTransition className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="w-8 h-8" /> WINGS AI Tools
        </h1>
        <p className="text-muted mt-2">Accelerate your workflow with AI-powered generators.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              setOutput("");
              setInputData("");
            }}
            className={`
              flex-shrink-0 p-4 rounded-xl border text-left min-w-[240px] transition-all
              ${activeTool === tool.id 
                ? "bg-white/10 border-white/30" 
                : "bg-glass-bg border-glass-border hover:bg-white/5"
              }
            `}
          >
            <h3 className="font-semibold text-white">{tool.name}</h3>
            <p className="text-xs text-muted mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard>
          <h2 className="text-xl font-semibold mb-6">Input</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                What do you want to write about?
              </label>
              <textarea
                rows={6}
                required
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-glass-bg border border-glass-border text-white placeholder-muted focus:outline-none focus:ring-1 focus:ring-white resize-none"
                placeholder="E.g., A new summer discount for my web design services..."
              />
            </div>
            <div className="flex justify-end">
              <PillButton type="submit" disabled={isGenerating || !inputData.trim()}>
                {isGenerating ? "Generating..." : "Generate with AI"}
              </PillButton>
            </div>
          </form>
        </GlassCard>

        <GlassCard className="flex flex-col min-h-[400px]">
          <h2 className="text-xl font-semibold mb-6">AI Output</h2>
          <div className="flex-1 rounded-lg bg-black/40 border border-glass-border p-6 overflow-y-auto font-mono text-sm leading-relaxed">
            {isGenerating ? (
              <div className="flex space-x-2 items-center h-full justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            ) : output ? (
              <TypewriterText text={output} delay={20} className="whitespace-pre-wrap text-white" />
            ) : (
              <p className="text-muted h-full flex items-center justify-center italic text-center">
                Results will appear here.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
