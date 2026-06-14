"use client";

import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Calendar, Image as ImageIcon, Video, FileText } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FamilyTimeline() {
  const params = useParams();
  
  // Mock Data mimicking the "Emotional Return Visits" strategy
  const relationship = { name: "Dad", relation: "Father", memories: 243 };
  
  const timeline = [
    { year: 2024, title: "Dad's 59th Birthday", type: "photo", location: "Home", items: 12 },
    { year: 2015, title: "High School Graduation", type: "video", location: "St. Xavier's", items: 4 },
    { year: 2012, title: "School Function", type: "photo", location: "Auditorium", items: 2 },
    { year: 2010, title: "Trip to Manali", type: "album", location: "Manali, HP", items: 42 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      
      {/* Back & Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dapp/relationships" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center font-black text-2xl text-white shadow-[0_0_20px_rgba(0,229,255,0.3)]">
            {relationship.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">{relationship.name}</h1>
            <p className="text-[#00E5FF] font-medium">{relationship.relation} • {relationship.memories} Memories</p>
          </div>
        </div>
      </div>

      {/* The Timeline */}
      <div className="relative border-l-2 border-white/10 ml-6 md:ml-8 space-y-12 pb-12">
        {timeline.map((event, index) => (
          <div key={index} className="relative pl-8 md:pl-12 group">
            
            {/* Timeline Node */}
            <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-[#050816] border-4 border-[#FF4D8D] group-hover:scale-125 group-hover:border-[#00E5FF] transition-all shadow-[0_0_10px_rgba(255,77,141,0.5)] z-10" />
            
            {/* Year Tag */}
            <div className="mb-2 flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-bold text-[#FF4D8D] group-hover:text-[#00E5FF] transition-colors shadow-inner">
                {event.year}
              </span>
              <span className="text-white/40 text-sm flex items-center gap-1">
                <Calendar size={14} /> {event.location}
              </span>
            </div>

            {/* Event Content Card */}
            <GlassPanel className="p-0 overflow-hidden cursor-pointer hover:shadow-[0_0_30px_rgba(0,229,255,0.15)] hover:-translate-y-1 transition-all border-white/5 hover:border-[#00E5FF]/30">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                
                {/* Mock Media Grid representation */}
                <div className="flex gap-2 mt-4">
                  {[...Array(Math.min(3, event.items))].map((_, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      {event.type === 'video' ? <Video className="text-white/20" size={20} /> : <ImageIcon className="text-white/20" size={20} />}
                    </div>
                  ))}
                  {event.items > 3 && (
                    <div className="w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="text-white/50 font-bold">+{event.items - 3}</span>
                    </div>
                  )}
                </div>
              </div>
            </GlassPanel>
            
          </div>
        ))}
      </div>

    </div>
  );
}
