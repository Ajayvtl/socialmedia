"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Archive, Plus, Users, Clock, History, CalendarDays, Heart } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import UploadMemoryModal from "@/components/dapp/UploadMemoryModal";

export default function MemoryWalletOverview() {
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Mocks for MVP visual layout based on the evidence-driven requirement
  const recentlyViewed = [
    { id: 1, title: "Dad's 60th Birthday", date: "Oct 12, 2025", type: "photo" },
    { id: 2, title: "Trip to Goa", date: "Jan 05, 2026", type: "album" },
    { id: 3, title: "Graduation", date: "May 20, 2022", type: "video" }
  ];

  const sharedPeople = [
    { name: "Dad", count: 243, relationship: "Father" },
    { name: "Mom", count: 189, relationship: "Mother" },
    { name: "Priya", count: 56, relationship: "Sister" },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      
      {/* Header & Primary CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6]">
            Memory Wallet
          </h1>
          <p className="text-white/60 text-lg mt-1">Your emotional legacy, securely stored.</p>
        </div>
        
        <button 
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] text-white rounded-full font-bold transition-all hover:scale-105"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Plus size={20} />
          <span>Save a Memory</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-2 overflow-x-auto hide-scrollbar">
        <button className="text-[#00E5FF] border-b-2 border-[#00E5FF] pb-2 font-bold whitespace-nowrap">Overview</button>
        <button className="text-white/50 hover:text-white pb-2 font-medium whitespace-nowrap transition-colors">Timeline</button>
        <button className="text-white/50 hover:text-white pb-2 font-medium whitespace-nowrap transition-colors">Circles</button>
        <button className="text-white/50 hover:text-white pb-2 font-medium whitespace-nowrap transition-colors">Shared</button>
        <button className="text-white/50 hover:text-white pb-2 font-medium whitespace-nowrap transition-colors flex items-center gap-1">Vault <span className="text-[10px] bg-white/10 px-1.5 rounded text-white/50">PRO</span></button>
      </div>

      {/* Grid Layout for Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recently Viewed Memories */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <History className="text-[#FF4D8D]" /> Recently Viewed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentlyViewed.map(mem => (
                <GlassPanel key={mem.id} className="p-4 hover:shadow-[0_0_20px_rgba(255,77,141,0.15)] transition-shadow cursor-pointer group flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Archive className="text-white/30 group-hover:text-[#FF4D8D] transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-[#FF4D8D] transition-colors">{mem.title}</h3>
                    <p className="text-sm text-white/50">{mem.date}</p>
                    <p className="text-[10px] text-white/30 uppercase mt-1 tracking-wider bg-white/5 inline-block px-2 py-0.5 rounded">{mem.type}</p>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </section>

          {/* Memory Circles Overview */}
          <section className="pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <Users className="text-[#00E5FF]" /> Active Memory Circles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <GlassPanel className="p-5 border-l-4 border-l-[#00E5FF] cursor-pointer hover:-translate-y-1 transition-transform">
                 <h3 className="font-bold text-lg text-white">Family Goa Trip 🏖️</h3>
                 <p className="text-sm text-[#00E5FF] mt-1">4 Members • 142 Memories</p>
                 <div className="flex -space-x-2 mt-4">
                   <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-[#050816]"></div>
                   <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#050816]"></div>
                   <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-[#050816]"></div>
                 </div>
               </GlassPanel>
               <GlassPanel className="p-5 border-l-4 border-l-[#FACC15] cursor-pointer hover:-translate-y-1 transition-transform">
                 <h3 className="font-bold text-lg text-white">College Days 🎓</h3>
                 <p className="text-sm text-[#FACC15] mt-1">12 Members • 89 Memories</p>
               </GlassPanel>
            </div>
          </section>

        </div>

        {/* Sidebar Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* People You Share Memories With */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <Heart className="text-[#8B5CF6]" /> Your Top People
            </h2>
            <GlassPanel className="p-0 overflow-hidden">
              {sharedPeople.map((person, i) => (
                <div key={person.name} className={`p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors ${i !== sharedPeople.length - 1 ? 'border-b border-white/5' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#FF4D8D] flex items-center justify-center font-bold text-white">
                      {person.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{person.name}</h4>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider">{person.relationship}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">{person.count}</span>
                    <p className="text-[10px] text-white/40">memories</p>
                  </div>
                </div>
              ))}
            </GlassPanel>
          </section>

          {/* Upcoming Milestones */}
          <section>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <CalendarDays className="text-[#FACC15]" /> Upcoming
            </h2>
            <GlassPanel className="p-5 space-y-4">
               <div className="flex gap-4">
                 <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg p-2 min-w-[50px]">
                   <span className="text-xs text-[#FACC15] font-bold uppercase">Oct</span>
                   <span className="text-xl font-black text-white">12</span>
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Dad's 60th Birthday</h4>
                   <p className="text-xs text-white/50 mt-1">In 4 days. You have 243 memories together.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="flex flex-col items-center justify-center bg-white/5 rounded-lg p-2 min-w-[50px]">
                   <span className="text-xs text-[#FACC15] font-bold uppercase">Nov</span>
                   <span className="text-xl font-black text-white">02</span>
                 </div>
                 <div>
                   <h4 className="font-bold text-white">Wedding Anniversary</h4>
                   <p className="text-xs text-white/50 mt-1">187 memories in the Wedding Circle.</p>
                 </div>
               </div>
            </GlassPanel>
          </section>

        </div>
      </div>

      <UploadMemoryModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
}
