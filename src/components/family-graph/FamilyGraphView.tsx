"use client";

import { useState, useEffect } from "react";
import { Loader2, GitMerge, Share2, Star, Target, Calendar, Award, Database, Settings, Activity, ZoomIn, ZoomOut, Zap } from "lucide-react";
import api, { getMediaUrl } from "@/lib/api";
import FamilyTreeView from "./FamilyTreeView";
import FamilyCircleView from "./FamilyCircleView";
import FamilyUniverseView from "./FamilyUniverseView";
import ImportantDatesView from "./ImportantDatesView";
import GoalsCalendarView from "./GoalsCalendarView";
import toast from "react-hot-toast";
import { PageContainer } from "@/components/ui/PageContainer";
import { RelationshipTimeline } from "@/features/memoryWallet/components/RelationshipTimeline";
import { LivingCursor } from "@/components/ui/LivingCursor";

export default function FamilyGraphView() {
  const [graphData, setGraphData] = useState<any>(null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"tree" | "circle" | "universe" | "dates" | "goals" | "ai" | "timeline">("universe");
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const gRes = await api.get("/family-graph/me");
      const graph = gRes.data?.data;
      setGraphData(graph);
      
      if (graph?.self?.id) {
        const networkRes = await api.get(`/family-graph/${graph.self.id}/network`);
        setNetworkData(networkRes.data?.data);
      }
    } catch (error) {
      console.error("Failed to load family graph", error);
      toast.error("Failed to load graph data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-[#FF4D8D] animate-spin mb-4" />
        <p className="text-white/60 text-sm font-medium tracking-widest uppercase">Initializing Neural Graph...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-[calc(100vh-32px)] w-full overflow-hidden bg-transparent relative">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 relative flex flex-col min-w-0 bg-transparent">
        
        <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-10 pointer-events-none">
          <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">Family Graph</h1>
          <p className="text-white/60 text-xs md:text-sm mt-1 drop-shadow-md">Visualize your connections and relationships</p>
        </div>

        {/* View Container */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          {viewMode === "tree" && <FamilyTreeView data={graphData} onNodeClick={(node) => {
            if (!node.isCenter) {
              setSelectedPerson(node);
              setViewMode("timeline");
            }
          }} />}
          {viewMode === "circle" && <FamilyCircleView data={graphData} onNodeClick={(node) => {
            if (node.layerType !== 'self') {
              setSelectedPerson(node);
              setViewMode("timeline");
            }
          }} />}
          {viewMode === "universe" && <FamilyUniverseView data={graphData} onNodeClick={(node) => {
            if (node.layerType !== 'self') {
              setSelectedPerson(node);
              setViewMode("timeline");
            }
          }} />}
          {viewMode === "dates" && <ImportantDatesView data={graphData} />}
          {viewMode === "goals" && <GoalsCalendarView />}
          {viewMode === "ai" && (
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <Zap className="w-16 h-16 text-[#FF3B30] mb-6 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">AI Insights Engine</h2>
              <p className="text-white/50 max-w-md">Our neural engine is analyzing your network patterns. Soon, it will suggest missing relationships, highlight anomalies, and generate conversation starters.</p>
              <button className="mt-8 px-6 py-3 bg-[#FF3B30]/20 text-[#FF3B30] font-bold rounded-xl border border-[#FF3B30]/30 hover:bg-[#FF3B30]/30 transition-all shadow-[0_0_20px_rgba(255,59,48,0.2)]">
                Train AI on my Graph
              </button>
            </div>
          )}
          {viewMode === "timeline" && selectedPerson && (
            <RelationshipTimeline 
              person={selectedPerson} 
              onBack={() => {
                setViewMode("tree");
                setSelectedPerson(null);
              }} 
            />
          )}
        </div>

        {/* Floating Bottom Dock */}
        {viewMode !== "timeline" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-2 p-1.5 bg-[#050816]/70 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <DockItem 
            active={viewMode === "tree"} onClick={() => setViewMode("tree")}
            icon={<GitMerge className="w-4 h-4 sm:w-5 sm:h-5" />} label="Tree" color="#00E5FF"
          />
          <DockItem 
            active={viewMode === "circle"} onClick={() => setViewMode("circle")}
            icon={<Share2 className="w-4 h-4 sm:w-5 sm:h-5" />} label="Circle" color="#FF4D8D"
          />
          <DockItem 
            active={viewMode === "universe"} onClick={() => setViewMode("universe")}
            icon={<Star className="w-4 h-4 sm:w-5 sm:h-5" />} label="3D" color="#8B5CF6"
          />
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <DockItem 
            active={viewMode === "dates"} onClick={() => setViewMode("dates")}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />} label="Dates" color="#FACC15"
          />
          <DockItem 
            active={viewMode === "goals"} onClick={() => setViewMode("goals")}
            icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />} label="Goals" color="#00D97E"
          />
          <div className="w-px h-6 bg-white/10 mx-1"></div>
          <DockItem 
            active={viewMode === "ai"} onClick={() => setViewMode("ai")}
            icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />} label="AI" color="#FF3B30"
          />
        </div>
        )}

      </div>

      {/* RIGHT SIDEBAR (Stats & Legend) */}
      <div className="w-[280px] bg-black/20 backdrop-blur-xl border-l border-white/5 hidden xl:flex flex-col py-6 px-5 overflow-y-auto hide-scrollbar shrink-0 z-20">
        
        {/* Legend */}
        <div className="mb-8 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Relationship Types</h3>
          <div className="space-y-3">
            <LegendItem color="#2DD4BF" label="Parents" />
            <LegendItem color="#3B82F6" label="Siblings" />
            <LegendItem color="#A855F7" label="Children" />
            <LegendItem color="#F97316" label="Extended Family" />
            <LegendItem color="#F43F5E" label="Close Friends" />
          </div>
        </div>

        {/* Mini Map or Stats */}
        <div className="mb-8 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <StatRow label="Total Family" value={graphData?.relationships?.length || 0} />
            <StatRow label="Connections" value={graphData?.connections?.length || 0} />
            <StatRow label="Generations" value={3} />
            <StatRow label="Close Circle" value={12} />
          </div>
        </div>

        {/* Recent Connections */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Recent Connections</h3>
          <div className="space-y-3">
             {graphData?.connections?.slice(0, 4).map((conn: any) => (
               <div key={conn.connection_id} className="flex items-center gap-3 group cursor-pointer">
                 {conn.avatar_url ? (
                   <img src={getMediaUrl(conn.avatar_url)} className="w-8 h-8 rounded-full object-cover" />
                 ) : (
                   <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                     {(conn.display_name || conn.username || 'U')[0].toUpperCase()}
                   </div>
                 )}
                 <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">{conn.display_name || conn.username}</h4>
                   <p className="text-[10px] text-white/40">Connected recently</p>
                 </div>
               </div>
             ))}
          </div>
          <button className="w-full mt-4 py-2 text-xs font-bold text-white/40 hover:text-white bg-white/5 rounded-lg transition-colors">
            View All
          </button>
        </div>

      </div>

      <LivingCursor />
    </div>
  );
}

function DockItem({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full transition-all duration-300 group ${active ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
      <div className={`transition-all duration-300 ${active ? 'scale-110' : 'text-white/50 group-hover:text-white'}`} style={{ color: active ? color : undefined, filter: active ? `drop-shadow(0 0 8px ${color})` : 'none' }}>
        {icon}
      </div>
      <span className={`hidden sm:block text-xs font-bold tracking-wide transition-colors ${active ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{label}</span>
      
      {/* Active Dot Indicator under icon for mobile */}
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full sm:hidden" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
      )}
    </button>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
      <span className="text-sm text-white/70">{label}</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
}
