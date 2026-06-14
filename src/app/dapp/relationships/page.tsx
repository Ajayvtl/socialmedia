"use client";

import { useAuth } from "@/context/AuthContext";
import { GitMerge, Heart, UserPlus } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";

export default function RelationshipsOverview() {
  const { user } = useAuth();
  
  // Mocks
  const relationships = [
    { id: '1', name: 'Dad', relation: 'Father', memories: 243, color: 'from-[#00E5FF] to-[#8B5CF6]' },
    { id: '2', name: 'Mom', relation: 'Mother', memories: 189, color: 'from-[#FF4D8D] to-[#FACC15]' },
    { id: '3', name: 'Priya', relation: 'Sister', memories: 56, color: 'from-[#8B5CF6] to-[#FF4D8D]' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF4D8D]">
            Family Graph
          </h1>
          <p className="text-white/60 text-lg mt-1">The foundation of your emotional legacy.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/10">
          <UserPlus size={20} />
          <span>Add Connection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relationships.map(rel => (
          <Link href={`/dapp/relationships/${rel.id}`} key={rel.id}>
            <GlassPanel className="p-6 hover:-translate-y-2 transition-transform cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Heart size={120} />
              </div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${rel.color} flex items-center justify-center font-black text-2xl text-white shadow-lg`}>
                  {rel.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/50 transition-all">
                    {rel.name}
                  </h3>
                  <p className="text-[#00E5FF] font-medium">{rel.relation}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-3xl font-black text-white">{rel.memories}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Shared Memories</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#FF4D8D] group-hover:text-white text-white/30 transition-colors">
                  <GitMerge size={20} />
                </div>
              </div>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
