"use client";

import { useAuth } from "@/context/AuthContext";
import { Cake, CalendarDays, Heart, Share2, Sparkles, Star } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";

export default function HomeDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Good morning, {user?.displayName || 'Ajay'} 👋
        </h1>
        <p className="text-white/60 text-lg">
          The best thing about memories is making them.
        </p>
      </div>

      {/* Relationship Dashboard Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <GlassPanel className="p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,77,141,0.15)] transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Cake size={80} />
          </div>
          <h3 className="text-[#FF4D8D] font-bold flex items-center gap-2 mb-2">
            <Cake size={18} /> Today's Family Updates
          </h3>
          <p className="text-xl font-medium text-white">Mom's Birthday Tomorrow</p>
          <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
            Send a Memory
          </button>
        </GlassPanel>

        <GlassPanel className="p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Share2 size={80} />
          </div>
          <h3 className="text-[#8B5CF6] font-bold flex items-center gap-2 mb-2">
            <Share2 size={18} /> Shared Memories
          </h3>
          <p className="text-xl font-medium text-white">3 new memories added to Goa Trip</p>
          <button className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors">
            View Memories
          </button>
        </GlassPanel>

      </div>

      {/* Secondary Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassPanel className="p-4 flex flex-col items-center justify-center text-center">
          <Heart className="w-8 h-8 text-[#00E5FF] mb-2" />
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-xs text-white/50 uppercase tracking-wider">Relationship Milestones</p>
        </GlassPanel>

        <GlassPanel className="p-4 flex flex-col items-center justify-center text-center">
          <CalendarDays className="w-8 h-8 text-[#FF4D8D] mb-2" />
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-xs text-white/50 uppercase tracking-wider">Upcoming Events</p>
        </GlassPanel>

        <GlassPanel className="p-4 flex flex-col items-center justify-center text-center">
          <Star className="w-8 h-8 text-[#FACC15] mb-2" />
          <p className="text-2xl font-bold text-white">5</p>
          <p className="text-xs text-white/50 uppercase tracking-wider">Community Highlights</p>
        </GlassPanel>
      </div>

      {/* Discovery Section (Former Feed) */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sparkles className="text-[#00E5FF]" /> Discovery
          </h2>
          <button className="text-sm text-[#00E5FF] hover:underline">View All</button>
        </div>
        
        <GlassPanel className="p-8 text-center text-white/40">
          <p>Discover new communities, events, and people.</p>
          <button className="mt-4 px-6 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white rounded-full font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow">
            Start Exploring
          </button>
        </GlassPanel>
      </div>

    </div>
  );
}
