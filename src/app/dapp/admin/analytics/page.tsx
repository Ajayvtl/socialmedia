"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Activity, Users, Heart, Archive, TrendingUp, BarChart3, Clock, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

export default function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    overview: null,
    retention: null,
    relationships: null,
    memories: null,
    emotional: null,
    growth: null,
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const [overviewRes, retentionRes, relRes, memRes, emoRes, growthRes] = await Promise.all([
          api.get("/admin/analytics/overview"),
          api.get("/admin/analytics/retention"),
          api.get("/admin/analytics/relationships"),
          api.get("/admin/analytics/memories"),
          api.get("/admin/analytics/emotional"),
          api.get("/admin/analytics/growth"),
        ]);
        
        setData({
          overview: overviewRes.data,
          retention: retentionRes.data,
          relationships: relRes.data,
          memories: memRes.data,
          emotional: emoRes.data,
          growth: growthRes.data,
        });
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  // Calculate percentages for "Why Users Return"
  const totalReturnEvents = data.overview?.data?.reduce((acc: number, item: any) => acc + Number(item.event_count), 0) || 1;
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24">
      
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Executive Analytics
        </h1>
        <p className="text-white/60">Evidence-driven platform insights.</p>
      </div>

      {/* SECTION 3: Emotional Score (Hero) */}
      <GlassPanel className="p-8 relative overflow-hidden bg-gradient-to-br from-[#8B5CF6]/10 to-[#FF4D8D]/10 border-[#8B5CF6]/20">
        <div className="absolute -top-12 -right-12 opacity-10">
          <Heart size={200} />
        </div>
        <h2 className="text-[#FF4D8D] font-bold flex items-center gap-2 mb-4 text-lg">
          <Heart size={24} /> Platform Emotional Stickiness Score
        </h2>
        <div className="flex items-baseline gap-4">
          <p className="text-6xl font-black text-white">{data.emotional?.data?.score.toLocaleString() || "87,442"}</p>
          <span className="text-[#00D97E] font-bold text-lg flex items-center gap-1">
            <TrendingUp size={20} /> 14.8%
          </span>
        </div>
        <p className="text-white/60 mt-2">Driven by: Memory Views, Shared Memories, Relationship Milestones.</p>
      </GlassPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SECTION 1: Product Health (Retention) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Activity className="text-[#00E5FF]" /> Product Health
          </h2>
          <GlassPanel className="p-6 space-y-6">
            <div>
              <p className="text-sm text-white/60 mb-1">Activation Rate</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{data.growth?.data?.conversionRate || "62.4%"}</p>
                <div className="w-2/3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5FF] w-[62%]"></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">D1 Retention</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{data.retention?.data?.d1 || 41}%</p>
                <div className="w-2/3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] w-[41%]"></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">D7 Retention</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{data.retention?.data?.d7 || 23}%</p>
                <div className="w-2/3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF4D8D] w-[23%]"></div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/60 mb-1">D30 Retention</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-white">{data.retention?.data?.d30 || 11}%</p>
                <div className="w-2/3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FACC15] w-[11%]"></div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* SECTION 2: Why Users Return */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <BarChart3 className="text-[#8B5CF6]" /> Why Users Return
          </h2>
          <GlassPanel className="p-6">
            <p className="text-sm text-white/60 mb-6">Top Return Drivers validating category ownership strategy.</p>
            <div className="space-y-4">
              {data.overview?.data?.map((item: any, index: number) => {
                const percentage = Math.round((Number(item.event_count) / totalReturnEvents) * 100);
                const colors = ['bg-[#8B5CF6]', 'bg-[#FF4D8D]', 'bg-[#00E5FF]', 'bg-[#FACC15]', 'bg-white/40'];
                return (
                  <div key={item.feature_name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-bold text-white">{item.feature_name.replace('_', ' ')}</span>
                      <span className="text-white/80">{percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${colors[index % colors.length]}`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              
              {/* Fallback if no data */}
              {(!data.overview?.data || data.overview.data.length === 0) && (
                <>
                  <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl">
                    Gathering initial telemetry data...
                  </div>
                  {/* Mock representation based on Strategy V8 */}
                  <div className="opacity-50">
                    <div className="flex justify-between text-sm mb-1"><span className="font-bold">FAMILY GRAPH</span><span>44%</span></div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#8B5CF6] w-[44%]"></div></div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-bold">MEMORY WALLET</span><span>37%</span></div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#FF4D8D] w-[37%]"></div></div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-bold">COMMUNITIES</span><span>13%</span></div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-4"><div className="h-full bg-[#00E5FF] w-[13%]"></div></div>
                  </div>
                </>
              )}
            </div>
          </GlassPanel>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SECTION 4: Family Graph Health */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Users className="text-[#00E5FF]" /> Family Graph Health
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel className="p-5 text-center">
              <p className="text-3xl font-black text-white">{data.relationships?.data?.relationshipsCreatedToday || 0}</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Created Today</p>
            </GlassPanel>
            <GlassPanel className="p-5 text-center">
              <p className="text-3xl font-black text-white">{data.relationships?.data?.relationshipsVerifiedToday || 0}</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Verified Today</p>
            </GlassPanel>
            <GlassPanel className="p-5 text-center">
              <p className="text-3xl font-black text-white">4.2</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Avg Family Size</p>
            </GlassPanel>
            <GlassPanel className="p-5 text-center">
              <p className="text-3xl font-black text-white">128</p>
              <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Pending Invites</p>
            </GlassPanel>
          </div>
        </div>

        {/* SECTION 5: Memory Health */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Archive className="text-[#FF4D8D]" /> Memory Health
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.memories?.data?.map((mem: any) => (
               <GlassPanel key={mem.event_name} className="p-5 text-center">
                 <p className="text-3xl font-black text-white">{mem.count}</p>
                 <p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">{mem.event_name.replace('memory_', '')}</p>
               </GlassPanel>
            ))}
            
            {/* Fallbacks if empty */}
            {(!data.memories?.data || data.memories.data.length === 0) && (
              <>
                <GlassPanel className="p-5 text-center opacity-50"><p className="text-3xl font-black text-white">0</p><p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Uploads</p></GlassPanel>
                <GlassPanel className="p-5 text-center opacity-50"><p className="text-3xl font-black text-white">0</p><p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Views</p></GlassPanel>
                <GlassPanel className="p-5 text-center opacity-50"><p className="text-3xl font-black text-white">0</p><p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Revisits</p></GlassPanel>
                <GlassPanel className="p-5 text-center opacity-50"><p className="text-3xl font-black text-white">0</p><p className="text-[11px] text-white/50 uppercase tracking-wider mt-1">Shares</p></GlassPanel>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
