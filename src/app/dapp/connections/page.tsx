"use client";

import { useState } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Users, UserPlus, ShieldCheck, Sparkles, Hash, Link as LinkIcon, Search, Star, MessageCircle } from "lucide-react";

export default function SocialGraphPage() {
  const [activeTab, setActiveTab] = useState<"FOLLOWERS" | "CLOSE_FRIENDS" | "SUGGESTED">("FOLLOWERS");

  const connections = [
    { id: 1, name: "Alice Explorer", handle: "@alice_x", role: "Creator", type: "Mutual", closeFriend: true },
    { id: 2, name: "Bob Metaverse", handle: "@bob_m", role: "Member", type: "Follower", closeFriend: false },
    { id: 3, name: "Cyber Ninja", handle: "@ninja_99", role: "Creator", type: "Following", closeFriend: false },
    { id: 4, name: "Neon Dreamer", handle: "@neon_d", role: "Member", type: "Mutual", closeFriend: true },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <LinkIcon className="w-8 h-8 text-primary" /> Social Graph
          </h1>
          <p className="text-foreground/60">Manage your connections, close friends, and interest network.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
           <input 
              type="text" 
              placeholder="Search graph..." 
              className="w-full bg-surface-secondary border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors text-foreground"
           />
        </div>
      </AnimatedContainer>

      <BentoGrid>
        {/* Graph Overview */}
        <BentoItem colSpan={4} className="p-6 bg-gradient-to-br from-surface to-surface-secondary border-border flex flex-col md:flex-row gap-8 items-center justify-between">
           <div className="flex gap-6 w-full md:w-auto overflow-x-auto hide-scrollbar">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-foreground">12.4K</span>
                <span className="text-sm font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1"><Users className="w-4 h-4 text-primary"/> Followers</span>
              </div>
              <div className="w-px h-12 bg-border hidden md:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-foreground">845</span>
                <span className="text-sm font-bold text-foreground/60 uppercase tracking-wider flex items-center gap-1"><UserPlus className="w-4 h-4 text-secondary"/> Following</span>
              </div>
              <div className="w-px h-12 bg-border hidden md:block"></div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-extrabold text-success">24</span>
                <span className="text-sm font-bold text-success/60 uppercase tracking-wider flex items-center gap-1"><Star className="w-4 h-4 text-success"/> Close Friends</span>
              </div>
           </div>
           <GlowButton variant="secondary" className="shrink-0 w-full md:w-auto"><Sparkles className="w-4 h-4 mr-2"/> View Interest Map</GlowButton>
        </BentoItem>

        {/* Main List Area */}
        <BentoItem colSpan={3} className="p-0 border-none bg-transparent">
          <div className="flex bg-surface-secondary p-1 rounded-2xl w-fit border border-border mb-6">
            <button
              onClick={() => setActiveTab("FOLLOWERS")}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition ${
                activeTab === "FOLLOWERS" ? "bg-surface text-primary shadow-soft" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Network
            </button>
            <button
              onClick={() => setActiveTab("CLOSE_FRIENDS")}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                activeTab === "CLOSE_FRIENDS" ? "bg-success/20 text-success shadow-soft" : "text-foreground/60 hover:text-success"
              }`}
            >
              <Star className="w-4 h-4"/> Close Friends
            </button>
            <button
              onClick={() => setActiveTab("SUGGESTED")}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition ${
                activeTab === "SUGGESTED" ? "bg-surface text-secondary shadow-soft" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Suggested
            </button>
          </div>

          <AnimatedContainer animation="fade" className="space-y-3">
            {connections
              .filter(c => activeTab === "CLOSE_FRIENDS" ? c.closeFriend : true)
              .map((conn) => (
              <GlassPanel key={conn.id} intensity="light" className="p-4 rounded-2xl flex items-center justify-between border-border hover:border-primary/50 transition">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/50 to-secondary/50 flex items-center justify-center text-foreground font-bold border-2 border-background">
                      {conn.name[0]}
                    </div>
                    {conn.closeFriend && <Star className="absolute -bottom-1 -right-1 w-5 h-5 text-success fill-success bg-background rounded-full border border-background" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      {conn.name}
                      {conn.role === "Creator" && <ShieldCheck className="w-4 h-4 text-primary" />}
                    </h4>
                    <p className="text-xs text-foreground/60">{conn.handle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-xs font-bold text-foreground/50 bg-surface-secondary px-3 py-1 rounded-full uppercase tracking-wider">
                    {conn.type}
                  </span>
                  <GlowButton variant="ghost" size="sm" className="hidden sm:flex text-foreground/60 hover:text-primary"><MessageCircle className="w-4 h-4"/></GlowButton>
                  <GlowButton variant="secondary" size="sm">
                    {conn.type === "Following" || conn.type === "Mutual" ? "Following" : "Follow Back"}
                  </GlowButton>
                </div>
              </GlassPanel>
            ))}
          </AnimatedContainer>
        </BentoItem>

        {/* Interest Graph Sidebar */}
        <BentoItem colSpan={1} className="p-6 bg-surface">
           <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2"><Hash className="w-5 h-5 text-secondary"/> Top Interests</h3>
           <p className="text-sm text-foreground/60 mb-6">Based on your mutual connections and engagement.</p>
           
           <div className="flex flex-wrap gap-2">
             {["#Web3", "#DigitalArt", "#VR", "#MusicProduction", "#Metaverse", "#Gaming"].map(tag => (
               <span key={tag} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface-secondary text-secondary border border-border hover:border-secondary/50 cursor-pointer transition">
                 {tag}
               </span>
             ))}
           </div>

           <div className="mt-8 pt-6 border-t border-border">
             <h4 className="font-bold text-sm text-foreground mb-3">Graph Synced</h4>
             <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full border-2 border-background bg-primary z-30"></div>
               <div className="w-10 h-10 rounded-full border-2 border-background bg-secondary z-20"></div>
               <div className="w-10 h-10 rounded-full border-2 border-background bg-warning z-10"></div>
               <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-secondary flex items-center justify-center text-xs font-bold z-0">+8k</div>
             </div>
           </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
