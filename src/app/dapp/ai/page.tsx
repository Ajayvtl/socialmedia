"use client";

import { useState } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Bot, Sparkles, MessageSquare, Wand2, Search, Cpu, ArrowRight } from "lucide-react";

export default function AIAssistantPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: "profile", name: "Profile Optimizer", desc: "AI analyzes your bio and photos to maximize dating and creator reach.", icon: Search, color: "text-primary", bg: "bg-primary/10" },
    { id: "caption", name: "Caption Generator", desc: "Instantly generate engaging captions for your feed posts with relevant hashtags.", icon: MessageSquare, color: "text-secondary", bg: "bg-secondary/10" },
    { id: "match", name: "Match Suggestions", desc: "Let our ML engine scan the network to find hyper-compatible connections.", icon: Sparkles, color: "text-warning", bg: "bg-warning/10" },
    { id: "avatar", name: "Avatar Style AI", desc: "Get AI recommendations for 3D wearable drops based on your aesthetic.", icon: Wand2, color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 h-full">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" /> AI Copilot
          </h1>
          <p className="text-foreground/60">Your personal intelligence engine for maximizing growth and connections.</p>
        </div>
      </AnimatedContainer>

      <BentoGrid>
        {/* Main AI Hero Interface */}
        <BentoItem colSpan={4} className="p-8 bg-gradient-to-br from-surface to-surface-secondary border-primary/20 relative overflow-hidden">
           <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
             <Cpu className="w-[400px] h-[400px] text-primary" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center border-4 border-background shrink-0 shadow-glow animate-pulse-slow">
                <Bot className="w-12 h-12 text-background" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you today?</h2>
                <p className="text-foreground/60 mb-4 max-w-xl">
                  I can rewrite your dating bio for higher conversions, suggest the best hashtags for your next creator post, or scan the grid for your perfect match.
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <GlowButton variant="primary" className="py-2"><Wand2 className="w-4 h-4 mr-2"/> Optimize Bio</GlowButton>
                  <GlowButton variant="secondary" className="py-2 bg-surface-secondary text-foreground"><Search className="w-4 h-4 mr-2"/> Find Matches</GlowButton>
                </div>
              </div>
           </div>
        </BentoItem>

        {/* AI Tools Grid */}
        <BentoItem colSpan={4} className="p-0 border-none bg-transparent mt-4">
           <h3 className="text-xl font-bold text-foreground mb-4">AI Toolkit</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {tools.map((tool) => (
               <GlassPanel 
                  key={tool.id} 
                  className={`p-6 rounded-3xl flex flex-col items-start border border-border cursor-pointer transition-all hover:scale-[1.02] ${activeTool === tool.id ? "border-primary shadow-glow bg-primary/5" : "hover:border-primary/50 bg-surface/50"}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                 <div className="flex justify-between items-start w-full mb-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-border ${tool.bg}`}>
                     <tool.icon className={`w-6 h-6 ${tool.color}`} />
                   </div>
                   <ArrowRight className="w-5 h-5 text-foreground/20" />
                 </div>
                 <h4 className="font-bold text-lg text-foreground mb-2">{tool.name}</h4>
                 <p className="text-sm text-foreground/60">{tool.desc}</p>
               </GlassPanel>
             ))}
           </div>
        </BentoItem>

        {/* Active Tool Workspace Placeholder */}
        {activeTool && (
           <BentoItem colSpan={4} className="p-8 border-primary/50 bg-surface/80 backdrop-blur mt-4">
              <div className="flex items-center gap-3 mb-6">
                 <Sparkles className="w-6 h-6 text-primary" />
                 <h3 className="text-xl font-bold text-foreground">
                   {tools.find(t => t.id === activeTool)?.name} Workspace
                 </h3>
              </div>
              <div className="w-full h-48 border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-foreground/50">
                 AI generation interface will initialize here.
              </div>
           </BentoItem>
        )}

      </BentoGrid>
    </div>
  );
}
