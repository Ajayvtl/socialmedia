"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Cake, CalendarDays, Heart, Share2, Sparkles, Star, Archive, Loader2, Search, Plus, Bell, MessageCircle } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";

export default function HomeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dashboard states
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);
  const [taggedMemories, setTaggedMemories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    milestones: 0,
    upcomingEvents: 0,
    communityHighlights: 0
  });
  const [vaults, setVaults] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let relationships: any[] = [];
      const today = new Date();

      // 1. Fetch family graph (for birthdays)
      try {
        const graphRes = await api.get('/family-graph/me');
        relationships = graphRes.data?.data?.relationships || [];
        
        // Parse upcoming birthdays
        const birthdaysList = relationships
          .filter((r: any) => r.dob)
          .map((r: any) => {
            const dobDate = new Date(r.dob);
            const birthdayThisYear = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
            if (birthdayThisYear < today) {
              birthdayThisYear.setFullYear(today.getFullYear() + 1);
            }
            const diffTime = Math.abs(birthdayThisYear.getTime() - today.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return {
              name: r.display_name || r.related_name || 'Family member',
              relationship: r.relationship_type,
              daysLeft: diffDays,
              dateStr: dobDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            };
          })
          .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
          .slice(0, 2);
        
        setUpcomingBirthdays(birthdaysList);
      } catch (e) {
        console.error("Failed to load family graph:", e);
      }

      // 2. Fetch shared/tagged memories
      try {
        const taggedRes = await api.get('/shared-memories/tagged/me');
        setTaggedMemories(taggedRes.data?.data || []);
      } catch (e) {
        console.error("Failed to load tagged memories:", e);
        setTaggedMemories([]);
      }

      // 3. Fetch vaults for "Continue your story"
      try {
        const vaultsRes = await api.get('/memory-wallet/vaults');
        setVaults(vaultsRes.data?.data || []);
      } catch (e) {
        console.error("Failed to load vaults:", e);
        setVaults([]);
      }

      // 4. Fetch events & stats
      let events: any[] = [];
      let communities: any[] = [];
      
      try {
        const eventsRes = await api.get('/events');
        events = eventsRes.data?.data || [];
      } catch (e) {
        console.error("Failed to load events:", e);
      }
      
      try {
        const communitiesRes = await api.get('/communities/my');
        communities = communitiesRes.data?.data || [];
      } catch (e) {
        console.error("Failed to load communities:", e);
      }

      setStats({
        milestones: relationships.length,
        upcomingEvents: events.filter((e: any) => new Date(e.start_time) >= today).length,
        communityHighlights: communities.length
      });

    } catch (e) {
      console.error("Critical failure loading dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-32">
      
      {/* MOBILE HEADER (Matches Feed/Discovery Page) */}
      <div className="xl:hidden flex items-center justify-between py-3 mb-2 border-b border-white/5">
        <div className="font-black text-2xl tracking-tighter bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-transparent bg-clip-text">
          AURORA
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white/80 hover:text-white transition-colors relative"><Search className="w-6 h-6" /></button>
          <button className="text-white/80 hover:text-white transition-colors relative"><Plus className="w-6 h-6" /></button>
          <Link href="/dapp/notifications" className="text-white/80 hover:text-white transition-colors relative">
            <Bell className="w-6 h-6" />
          </Link>
          <Link href="/dapp/inbox" className="text-white/80 hover:text-white transition-colors relative">
            <MessageCircle className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Welcome back, {user?.name || user?.email || 'Ajay'} 👋
        </h1>
        <p className="text-white/60 text-lg">
          The best thing about memories is making them.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/50">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          <p className="text-sm font-medium">Loading your relationship dashboard...</p>
        </div>
      ) : (
        <>
          {/* Relationship Dashboard Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Birthdays Card */}
            <GlassPanel className="p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(255,77,141,0.15)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cake size={80} />
              </div>
              <h3 className="text-[#FF4D8D] font-bold flex items-center gap-2 mb-3 text-sm tracking-wider uppercase">
                <Cake size={16} /> Family Updates & Birthdays
              </h3>
              {upcomingBirthdays.length > 0 ? (
                <div className="space-y-2">
                  {upcomingBirthdays.map((b, idx) => (
                    <div key={idx}>
                      <p className="text-lg font-bold text-white">{b.name}'s Birthday</p>
                      <p className="text-xs text-white/50 capitalize">
                        {b.relationship} • {b.daysLeft === 0 ? "Today" : b.daysLeft === 1 ? "Tomorrow" : `in ${b.daysLeft} days`} ({b.dateStr})
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-white">No upcoming birthdays</p>
                  <p className="text-xs text-white/50">Add birthdays in the Family Graph page to track them.</p>
                </div>
              )}
              <Link href="/dapp/family-graph" className="mt-5 inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors">
                View Family Graph
              </Link>
            </GlassPanel>

            {/* Shared Memories Card */}
            <GlassPanel className="p-6 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Share2 size={80} />
              </div>
              <h3 className="text-[#8B5CF6] font-bold flex items-center gap-2 mb-3 text-sm tracking-wider uppercase">
                <Share2 size={16} /> Shared Memories
              </h3>
              {taggedMemories.length > 0 ? (
                <div>
                  <p className="text-lg font-bold text-white">{taggedMemories.length} memories shared with you</p>
                  <p className="text-xs text-white/50">Latest: "{taggedMemories[0].title}" tagged by {taggedMemories[0].owner_name || 'family'}</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-white">No shared memories yet</p>
                  <p className="text-xs text-white/50">When family members tag you, they will appear here.</p>
                </div>
              )}
              <Link href="/dapp/memory-wallet" className="mt-5 inline-block px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-colors">
                Open Memory Wallet
              </Link>
            </GlassPanel>

          </div>

          {/* Secondary Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassPanel className="p-4 flex flex-col items-center justify-center text-center">
              <Heart className="w-8 h-8 text-[#00E5FF] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.milestones}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Family Members</p>
            </GlassPanel>

            <GlassPanel className="p-4 flex flex-col items-center justify-center text-center">
              <CalendarDays className="w-8 h-8 text-[#FF4D8D] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Upcoming Events</p>
            </GlassPanel>

            <GlassPanel className="p-4 flex flex-col items-center justify-center text-center">
              <Star className="w-8 h-8 text-[#FACC15] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.communityHighlights}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Joined Communities</p>
            </GlassPanel>
          </div>

          {/* Continue Your Story (Memory Re-engagement) */}
          <div className="pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <Archive className="text-[#8B5CF6]" /> Continue Your Story
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {vaults.length > 0 ? (
                vaults.map((vault) => (
                  <Link href={`/dapp/memory-wallet?vault=${vault.id}`} key={vault.id}>
                    <GlassPanel className="p-5 hover:-translate-y-1 transition-transform cursor-pointer group">
                      <h3 className="font-bold text-white text-lg mb-1 truncate">{vault.name}</h3>
                      <p className="text-sm text-[#00E5FF] font-medium mb-3">
                        {vault.memory_count || 0} memories
                      </p>
                      <p className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors uppercase tracking-wider font-bold">
                        Role: {vault.role || 'Member'}
                      </p>
                    </GlassPanel>
                  </Link>
                ))
              ) : (
                <GlassPanel className="p-5 col-span-3 text-center text-white/40">
                  No memory vaults created yet.
                  <Link href="/dapp/memory-wallet" className="text-[#00E5FF] hover:underline block mt-2 font-bold">
                    Create Your First Vault →
                  </Link>
                </GlassPanel>
              )}

            </div>
          </div>

          {/* Discovery Section */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="text-[#00E5FF]" /> Discovery
              </h2>
            </div>
            
            <GlassPanel className="p-8 text-center text-white/40">
              <p className="text-sm">Discover new communities, events, and family connections.</p>
              <Link href="/dapp/communities" className="mt-4 inline-block px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white rounded-full font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow text-xs">
                Explore Communities & Events
              </Link>
            </GlassPanel>
          </div>
        </>
      )}

    </div>
  );
}
