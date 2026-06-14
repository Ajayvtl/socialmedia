"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Archive, Plus, Users, Clock, History, CalendarDays, Heart, Loader2, Sparkles, Image as ImageIcon, Video, Trash2, HeartHandshake, MapPin } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import UploadMemoryModal from "@/components/dapp/UploadMemoryModal";
import api, { getMediaUrl } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface MemoryItem {
  id: number;
  title: string;
  caption?: string;
  memory_date?: string;
  created_at: string;
  memory_type: 'photo' | 'video';
  url: string;
  thumbnail_url?: string;
  location_name?: string;
  is_favorite?: boolean;
}

interface CircleItem {
  id: number;
  name: string;
  circle_type: string;
  member_count: number;
  memory_count: number;
}

interface TopPerson {
  id: number;
  name: string;
  relationship: string;
  avatar?: string;
}

export default function MemoryWalletOverview() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'circles' | 'shared'>('overview');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic Data
  const [vaultId, setVaultId] = useState<number | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [circles, setCircles] = useState<CircleItem[]>([]);
  const [topPeople, setTopPeople] = useState<TopPerson[]>([]);
  const [sharedMemories, setSharedMemories] = useState<MemoryItem[]>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Vault
      const vaultRes = await api.get('/memory-wallet/vaults');
      const vaults = vaultRes.data?.data || [];
      if (vaults.length === 0) {
        setLoading(false);
        return;
      }
      const activeVaultId = vaults[0].id;
      setVaultId(activeVaultId);

      // 2. Fetch Circles
      const circlesRes = await api.get(`/memory-wallet/circles?vaultId=${activeVaultId}`);
      setCircles(circlesRes.data?.data || []);

      // 3. Fetch Memory Items
      const itemsRes = await api.get(`/memory-wallet/items?vaultId=${activeVaultId}`);
      setMemories(itemsRes.data?.data || []);

      // 4. Fetch Top People from Family Graph
      const graphRes = await api.get('/family-graph/me');
      const relationships = graphRes.data?.data?.relationships || [];
      const list: TopPerson[] = relationships.map((r: any) => ({
        id: r.related_user_id || r.id,
        name: r.display_name || r.related_name || 'Family member',
        relationship: r.relationship_type,
        avatar: r.avatar_url
      })).slice(0, 4);
      setTopPeople(list);

      // Parse upcoming birthdays/milestones
      const today = new Date();
      const milestones = relationships
        .filter((r: any) => r.dob)
        .map((r: any) => {
          const dobDate = new Date(r.dob);
          const bday = new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate());
          if (bday < today) bday.setFullYear(today.getFullYear() + 1);
          const diffDays = Math.ceil(Math.abs(bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return {
            name: r.display_name || r.related_name || 'Family member',
            event: `${r.relationship_type || 'Family'}'s Birthday`,
            daysLeft: diffDays,
            dateStr: dobDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          };
        })
        .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
        .slice(0, 2);
      setUpcomingMilestones(milestones);

      // 5. Fetch Shared (Tagged) Memories
      const taggedRes = await api.get('/shared-memories/tagged/me');
      setSharedMemories(taggedRes.data?.data || []);

    } catch (e) {
      console.error("Failed to load Memory Wallet data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;
    try {
      await api.delete(`/memory-wallet/items/${id}`);
      toast.success("Memory deleted");
      loadData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete memory");
    }
  };

  const handleToggleFavorite = async (item: MemoryItem) => {
    try {
      await api.put(`/memory-wallet/items/${item.id}`, {
        is_favorite: !item.is_favorite
      });
      toast.success(item.is_favorite ? "Removed from Favorites" : "Added to Favorites");
      loadData();
    } catch (e: any) {
      toast.error("Failed to toggle favorite status");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      
      {/* Header & Primary CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6]">
            Memory Wallet
          </h1>
          <p className="text-white/60 text-base mt-1">Your emotional legacy, securely stored.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] text-white rounded-full font-bold transition-all hover:scale-105 shadow-lg"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus size={20} />
          <span>Save a Memory</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
        {(['overview', 'timeline', 'circles', 'shared'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 font-bold whitespace-nowrap transition-colors capitalize ${activeTab === tab ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]' : 'text-white/50 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-white/50">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          <p className="text-sm font-medium">Syncing with secure Vault...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Recently Saved Memories */}
                <section>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                    <History className="text-[#FF4D8D]" /> Recently Saved
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {memories.slice(0, 4).map(mem => (
                      <GlassPanel key={mem.id} className="p-4 hover:shadow-[0_0_25px_rgba(255,77,141,0.15)] transition-all cursor-pointer group flex items-start gap-4 relative">
                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {mem.memory_type === 'video' ? (
                            <Video className="w-6 h-6 text-white/40" />
                          ) : (
                            <img src={getMediaUrl(mem.url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                          <h3 className="font-bold text-white group-hover:text-[#FF4D8D] transition-colors truncate">{mem.title}</h3>
                          <p className="text-xs text-white/50 mt-0.5">
                            {new Date(mem.memory_date || mem.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          {mem.location_name && <p className="text-[10px] text-[#00E5FF] mt-1 truncate">{mem.location_name}</p>}
                        </div>
                        
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleFavorite(mem); }} 
                            className="p-1 text-white/40 hover:text-[#FF4D8D]"
                          >
                            <Heart className={`w-3.5 h-3.5 ${mem.is_favorite ? 'fill-[#FF4D8D] text-[#FF4D8D]' : ''}`} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteMemory(mem.id); }} 
                            className="p-1 text-white/40 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </GlassPanel>
                    ))}
                    {memories.length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-white/5 rounded-2xl border border-white/10">
                        <ImageIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-white/40 italic">Save your first memory to begin your legacy timeline.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Memory Circles */}
                <section className="pt-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                    <Users className="text-[#00E5FF]" /> Active Memory Circles
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {circles.map(c => (
                      <Link href={`/dapp/memory-wallet/circles/${c.id}`} key={c.id}>
                        <GlassPanel className="p-5 border-l-4 border-l-[#00E5FF] hover:-translate-y-1 transition-all cursor-pointer">
                          <h3 className="font-bold text-lg text-white truncate">{c.name}</h3>
                          <p className="text-xs text-[#00E5FF] mt-1 font-medium uppercase tracking-wider">{c.circle_type} Circle</p>
                          <p className="text-sm text-white/50 mt-3">{c.memory_count || 0} Memories • {c.member_count || 1} Members</p>
                        </GlassPanel>
                      </Link>
                    ))}
                    {circles.length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-white/5 rounded-2xl border border-white/10">
                        <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                        <p className="text-sm text-white/40 italic">Create circles inside your Memory Wallet page to categorize trips or milestones.</p>
                      </div>
                    )}
                  </div>
                </section>

              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                
                {/* Top People */}
                <section>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
                    <Heart className="text-[#8B5CF6]" /> Top People
                  </h2>
                  <GlassPanel className="p-0 overflow-hidden divide-y divide-white/5">
                    {topPeople.map(person => (
                      <div key={person.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          {person.avatar ? (
                            <img src={getMediaUrl(person.avatar)} className="w-9 h-9 rounded-full object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#FF4D8D] flex items-center justify-center font-bold text-white text-sm">
                              {person.name[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-white text-sm">{person.name}</h4>
                            <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">{person.relationship}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {topPeople.length === 0 && (
                      <p className="p-6 text-xs text-white/40 italic text-center">Add family relationships to show them here.</p>
                    )}
                  </GlassPanel>
                </section>

                {/* Upcoming milestones */}
                <section>
                  <h2 className="text-xl font-bold flex items-center gap-2 text-[#FACC15] mb-4">
                    <CalendarDays /> Upcoming
                  </h2>
                  <GlassPanel className="p-5 space-y-4">
                    {upcomingMilestones.map((m, idx) => (
                      <div className="flex gap-4" key={idx}>
                        <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg p-2 min-w-[50px] border border-white/10">
                          <span className="text-[10px] text-[#FACC15] font-bold uppercase">Days</span>
                          <span className="text-lg font-black text-white">{m.daysLeft}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{m.name}'s Milestone</h4>
                          <p className="text-xs text-white/50 mt-1">{m.event} • {m.dateStr}</p>
                        </div>
                      </div>
                    ))}
                    {upcomingMilestones.length === 0 && (
                      <p className="text-xs text-white/40 italic">No upcoming milestones tracked.</p>
                    )}
                  </GlassPanel>
                </section>

              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Chronological Memory Feed</h2>
              <div className="relative border-l-2 border-white/10 pl-6 ml-4 space-y-8">
                {memories.map(mem => (
                  <div key={mem.id} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-[#00E5FF] border-4 border-[#050816] group-hover:scale-125 transition-transform" />
                    <GlassPanel className="p-5 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-shadow">
                      <div className="flex flex-col md:flex-row gap-5">
                        {mem.url && (
                          <div className="w-full md:w-48 h-32 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                            {mem.memory_type === 'video' ? (
                              <video src={getMediaUrl(mem.url)} className="w-full h-full object-cover" controls />
                            ) : (
                              <img src={getMediaUrl(mem.url)} className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-bold text-white">{mem.title}</h3>
                            <span className="text-xs text-[#00E5FF] font-semibold">
                              {new Date(mem.memory_date || mem.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          {mem.caption && <p className="text-sm text-white/60 mt-2 line-clamp-3">{mem.caption}</p>}
                          {mem.location_name && (
                            <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#FACC15]" /> {mem.location_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </GlassPanel>
                  </div>
                ))}
                {memories.length === 0 && (
                  <p className="text-sm text-white/40 italic">Timeline is empty. Save a memory to build your story.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'circles' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Your Memory Circles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {circles.map(c => (
                  <Link href={`/dapp/memory-wallet/circles/${c.id}`} key={c.id}>
                    <GlassPanel className="p-6 hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white truncate">{c.name}</h3>
                        <p className="text-xs text-[#00E5FF] font-bold uppercase mt-1 tracking-wider">{c.circle_type} Circle</p>
                      </div>
                      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                        <span>{c.member_count || 1} Members</span>
                        <span>{c.memory_count || 0} Items</span>
                      </div>
                    </GlassPanel>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shared' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Memories Shared with You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sharedMemories.map(mem => (
                  <GlassPanel key={mem.id} className="p-4 flex gap-4 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-shadow">
                    <div className="w-20 h-20 bg-white/5 rounded-xl border border-white/10 overflow-hidden shrink-0">
                      {mem.memory_type === 'video' ? (
                        <Video className="w-6 h-6 text-white/40 m-auto mt-7" />
                      ) : (
                        <img src={getMediaUrl(mem.url)} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{mem.title}</h3>
                      <p className="text-xs text-white/50 mt-1">
                        Tagged on {new Date(mem.memory_date || mem.created_at).toLocaleDateString()}
                      </p>
                      {mem.caption && <p className="text-xs text-white/40 mt-2 truncate">{mem.caption}</p>}
                    </div>
                  </GlassPanel>
                ))}
                {sharedMemories.length === 0 && (
                  <div className="col-span-2 text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <HeartHandshake className="w-10 h-10 text-white/20 mx-auto mb-3" />
                    <p className="text-sm text-white/40 italic">No shared memories yet. Tell your family to tag you in their uploads!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <UploadMemoryModal 
        isOpen={isUploadModalOpen} 
        onClose={() => { setIsUploadModalOpen(false); loadData(); }} 
      />
    </div>
  );
}
