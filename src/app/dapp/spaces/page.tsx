"use client";

import { useState } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Headset, Mic, MicOff, Users, Box, Sparkles, MessageSquare, Gift, LogOut, Radio, Crown } from "lucide-react";

export default function VirtualSpacesPage() {
  const [activeSpace, setActiveSpace] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);

  const spaces = [
    { id: 1, name: "Neon Lounge", type: "Public Hangout", users: 142, max: 200, bg: "bg-gradient-to-tr from-primary/20 to-secondary/20", color: "text-primary" },
    { id: 2, name: "Cyber Club 99", type: "Music & Voice", users: 85, max: 100, bg: "bg-gradient-to-tr from-secondary/20 to-warning/20", color: "text-secondary" },
    { id: 3, name: "Speed Dating Room", type: "Matchmaking", users: 24, max: 50, bg: "bg-gradient-to-tr from-danger/20 to-primary/20", color: "text-danger" },
    { id: 4, name: "VIP Creator Hub", type: "Exclusive", users: 8, max: 20, bg: "bg-gradient-to-tr from-warning/20 to-success/20", color: "text-warning", locked: true },
  ];

  const connectedAvatars = [
    { id: 1, name: "Alice_X", role: "Host", speaking: true },
    { id: 2, name: "Neon_D", role: "Listener", speaking: false },
    { id: 3, name: "Crypto_Bro", role: "Listener", speaking: false },
  ];

  if (activeSpace) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
        {/* Active Space Header */}
        <AnimatedContainer animation="slideUp" className="flex justify-between items-center bg-surface-secondary/50 p-4 rounded-3xl border border-border backdrop-blur">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center">
               <Headset className={`w-6 h-6 ${activeSpace.color}`} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-foreground flex items-center gap-2">{activeSpace.name} <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-danger/20 text-danger animate-pulse">Live</span></h2>
               <p className="text-xs text-foreground/60 flex items-center gap-1"><Users className="w-3 h-3"/> {activeSpace.users} Connected Avatars</p>
             </div>
           </div>
           <GlowButton variant="ghost" onClick={() => setActiveSpace(null)} className="text-danger hover:bg-danger/10"><LogOut className="w-4 h-4 mr-2"/> Leave Space</GlowButton>
        </AnimatedContainer>

        {/* 3D Viewport & Chat Split */}
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          
          {/* Main 3D Viewport Placeholder */}
          <GlassPanel className="flex-1 rounded-3xl relative overflow-hidden flex flex-col border border-border items-center justify-center group">
            <div className={`absolute inset-0 ${activeSpace.bg} opacity-50 -z-10`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#0a0f18_100%)] opacity-80" />
            
            <Box className="w-24 h-24 text-foreground/20 mb-4 animate-bounce" />
            <h3 className="text-2xl font-bold text-foreground mb-2 tracking-widest uppercase">Spatial Engine Active</h3>
            <p className="text-foreground/50 text-sm max-w-sm text-center">Three.js avatars will render in this volumetric environment, allowing spatial voice and proximity chat.</p>
            
            {/* HUD Voice Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-background/80 backdrop-blur px-6 py-3 rounded-full border border-border shadow-glow">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-danger/20 text-danger border border-danger/50" : "bg-primary/20 text-primary border border-primary/50"}`}
              >
                {isMuted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
              </button>
              <button className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-secondary text-foreground hover:bg-surface border border-border transition-colors">
                <Gift className="w-5 h-5 text-warning"/>
              </button>
              <button className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-secondary text-foreground hover:bg-surface border border-border transition-colors">
                <Sparkles className="w-5 h-5 text-secondary"/>
              </button>
            </div>
          </GlassPanel>

          {/* Connected Users / Chat Sidebar */}
          <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
            <GlassPanel className="flex-1 rounded-3xl p-5 border border-border flex flex-col">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2"><Radio className="w-4 h-4 text-success"/> Voice Channel</h3>
              
              <div className="space-y-3 overflow-y-auto hide-scrollbar flex-1">
                {connectedAvatars.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-secondary transition">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full bg-surface border ${user.speaking ? 'border-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'border-border'} flex items-center justify-center font-bold text-xs`}>
                          {user.name[0]}
                        </div>
                        {user.role === "Host" && <Crown className="w-4 h-4 text-warning absolute -top-2 -right-1" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{user.name}</h4>
                        <p className="text-[10px] text-foreground/50 uppercase">{user.role}</p>
                      </div>
                    </div>
                    {user.speaking ? <Mic className="w-4 h-4 text-success animate-pulse" /> : <MicOff className="w-4 h-4 text-foreground/30" />}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-border relative">
                <input type="text" placeholder="Type in room chat..." className="w-full bg-surface-secondary border border-border rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-primary transition" />
                <MessageSquare className="w-4 h-4 text-foreground/50 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </GlassPanel>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Headset className="w-8 h-8 text-secondary" /> Virtual Spaces
          </h1>
          <p className="text-foreground/60">Enter volumetric 3D rooms with your avatar and spatial voice chat.</p>
        </div>
      </AnimatedContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
           <GlassPanel key={space.id} className="p-6 rounded-3xl flex flex-col border border-border group overflow-hidden relative cursor-pointer hover:border-foreground/30 transition" onClick={() => !space.locked && setActiveSpace(space)}>
             <div className={`absolute inset-0 ${space.bg} opacity-20 group-hover:opacity-40 transition-opacity`} />
             
             <div className="flex justify-between items-start relative z-10 mb-8">
               <div className={`w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center ${space.color}`}>
                 <Box className="w-6 h-6" />
               </div>
               {space.locked && <span className="px-2 py-1 bg-surface-secondary rounded text-[10px] font-bold text-foreground/60 uppercase border border-border flex items-center gap-1"><Crown className="w-3 h-3 text-warning"/> VIP Only</span>}
             </div>
             
             <div className="relative z-10 mt-auto">
               <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--tw-colors-foreground-60)" }}>{space.type}</p>
               <h3 className="text-xl font-bold text-foreground mb-4">{space.name}</h3>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-sm text-foreground/80">
                   <Users className="w-4 h-4" /> {space.users} / {space.max}
                 </div>
                 <GlowButton variant={space.locked ? "ghost" : "primary"} size="sm" className={space.locked ? "opacity-50" : ""}>
                   {space.locked ? "Locked" : "Enter Space"}
                 </GlowButton>
               </div>
             </div>
           </GlassPanel>
        ))}
      </div>
    </div>
  );
}
