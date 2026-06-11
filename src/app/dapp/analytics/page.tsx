"use client";

import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { BarChart3, TrendingUp, Users, Eye, Gem, Activity, ArrowUpRight, ArrowDownRight, Share2 } from "lucide-react";

export default function AnalyticsDashboardPage() {
  const stats = [
    { title: "Total Views", value: "2.4M", trend: "+12.5%", isPositive: true, icon: Eye, color: "text-primary", bg: "bg-primary/10" },
    { title: "Engagement Rate", value: "8.2%", trend: "+1.2%", isPositive: true, icon: Activity, color: "text-secondary", bg: "bg-secondary/10" },
    { title: "New Followers", value: "14,200", trend: "-2.4%", isPositive: false, icon: Users, color: "text-warning", bg: "bg-warning/10" },
    { title: "Revenue (Gems)", value: "125,000", trend: "+45.8%", isPositive: true, icon: Gem, color: "text-success", bg: "bg-success/10" },
  ];

  const topPosts = [
    { id: 1, title: "Neon City Vlog", views: "1.2M", likes: "145K", shares: "12K", type: "Video" },
    { id: 2, title: "Avatar Fit Check", views: "850K", likes: "95K", shares: "8K", type: "Image" },
    { id: 3, title: "Web3 Founder Advice", views: "350K", likes: "40K", shares: "15K", type: "Text" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" /> Analytics
          </h1>
          <p className="text-foreground/60">Track your reach, engagement, and revenue performance over the last 30 days.</p>
        </div>
        <div className="flex gap-2 bg-surface-secondary p-1 rounded-xl w-fit border border-border">
          <button className="px-4 py-2 bg-surface rounded-lg text-sm font-bold text-foreground shadow-soft">30 Days</button>
          <button className="px-4 py-2 text-sm font-bold text-foreground/60 hover:text-foreground">90 Days</button>
          <button className="px-4 py-2 text-sm font-bold text-foreground/60 hover:text-foreground">All Time</button>
        </div>
      </AnimatedContainer>

      <BentoGrid>
        {/* KPI Stat Cards */}
        {stats.map((stat, i) => (
          <BentoItem key={i} colSpan={1} className="p-6 bg-surface border-border hover:border-primary/50 transition">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-border ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${stat.isPositive ? 'text-success bg-success/10 border-success/20' : 'text-danger bg-danger/10 border-danger/20'}`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-3xl font-extrabold text-foreground">{stat.value}</h3>
            <p className="text-sm font-medium text-foreground/60 mt-1">{stat.title}</p>
          </BentoItem>
        ))}

        {/* Audience Growth Chart Placeholder */}
        <BentoItem colSpan={2} className="p-6 flex flex-col justify-between">
           <div>
             <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Audience Growth</h2>
             <p className="text-sm text-foreground/60 mb-6">Net follower increase over time</p>
           </div>
           
           <div className="flex-1 min-h-[200px] w-full flex items-end justify-between gap-2 border-b border-border pb-2 relative">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-screen pointer-events-none" />
             {/* Fake CSS Chart Bars */}
             {[40, 60, 45, 80, 55, 90, 100].map((height, idx) => (
                <div key={idx} className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-sm relative group cursor-pointer" style={{ height: `${height}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface text-foreground text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition border border-border pointer-events-none">
                    {height}k
                  </div>
                </div>
             ))}
           </div>
           <div className="flex justify-between w-full mt-2 text-xs text-foreground/50 font-mono uppercase">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
           </div>
        </BentoItem>

        {/* Top Performing Content */}
        <BentoItem colSpan={2} className="p-6 bg-surface-secondary/50">
           <h2 className="text-xl font-bold text-foreground mb-6">Top Performing Content</h2>
           <div className="space-y-4">
             {topPosts.map((post) => (
               <GlassPanel key={post.id} intensity="light" className="p-4 rounded-2xl flex items-center justify-between border-border hover:border-secondary/50 transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-xs font-bold text-foreground/60 uppercase">
                      {post.type}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground max-w-[150px] truncate">{post.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-foreground/60 mt-1">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-primary"/> {post.views}</span>
                        <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-secondary"/> {post.shares}</span>
                      </div>
                    </div>
                  </div>
                  <GlowButton variant="ghost" size="sm" className="text-xs">Boost Post</GlowButton>
               </GlassPanel>
             ))}
           </div>
        </BentoItem>

      </BentoGrid>
    </div>
  );
}
