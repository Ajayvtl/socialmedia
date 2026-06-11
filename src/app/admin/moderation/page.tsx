"use client";

import { useState } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { ShieldAlert, AlertTriangle, UserX, Flag, CheckCircle, Clock, Search, Filter, Ban, MoreVertical } from "lucide-react";

export default function ModerationCenterPage() {
  const [activeTab, setActiveTab] = useState<"QUEUE" | "BANS" | "APPEALS">("QUEUE");

  const reportsQueue = [
    { id: "RPT-842", user: "@neon_d", reporter: "@alice_x", reason: "Inappropriate Content", status: "Pending Review", severity: "High", time: "10m ago" },
    { id: "RPT-841", user: "@crypto_bro", reporter: "System AI", reason: "Spam / Bot Behavior", status: "In Progress", severity: "Critical", time: "1h ago" },
    { id: "RPT-840", user: "@anon_99", reporter: "@bob_m", reason: "Harassment", status: "Pending Review", severity: "Medium", time: "2h ago" },
  ];

  const recentBans = [
    { user: "@scammer_xyz", reason: "Phishing Links", date: "2026-06-03", type: "Permanent Ban", appeal: "None" },
    { user: "@toxic_player", reason: "Hate Speech", date: "2026-06-02", type: "7-Day Shadowban", appeal: "Pending" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-danger" /> Moderation Center
          </h1>
          <p className="text-foreground/60">Platform governance, reports queue, and trust enforcement.</p>
        </div>
        <div className="flex gap-2">
           <GlowButton variant="secondary" className="bg-surface"><Clock className="w-4 h-4 mr-2"/> Audit Logs</GlowButton>
           <GlowButton variant="primary" className="bg-danger border-danger/50 text-white shadow-[0_0_15px_rgba(255,50,50,0.5)]"><AlertTriangle className="w-4 h-4 mr-2"/> Lockdown Mode</GlowButton>
        </div>
      </AnimatedContainer>

      <BentoGrid>
        {/* KPI Summary */}
        <BentoItem colSpan={4} className="p-0 border-none bg-transparent grid grid-cols-1 md:grid-cols-4 gap-4">
           <GlassPanel className="p-6 rounded-3xl border-border flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center mb-4"><Flag className="w-5 h-5"/></div>
              <p className="text-sm text-foreground/60 font-bold uppercase">Open Reports</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">124</h3>
           </GlassPanel>
           <GlassPanel className="p-6 rounded-3xl border-border flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center mb-4"><AlertTriangle className="w-5 h-5"/></div>
              <p className="text-sm text-foreground/60 font-bold uppercase">Pending Appeals</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">18</h3>
           </GlassPanel>
           <GlassPanel className="p-6 rounded-3xl border-border flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4"><UserX className="w-5 h-5"/></div>
              <p className="text-sm text-foreground/60 font-bold uppercase">Active Bans</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">1,042</h3>
           </GlassPanel>
           <GlassPanel className="p-6 rounded-3xl border-border flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4"><CheckCircle className="w-5 h-5"/></div>
              <p className="text-sm text-foreground/60 font-bold uppercase">AI Auto-Resolved</p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">89%</h3>
           </GlassPanel>
        </BentoItem>

        {/* Main Interface Workspace */}
        <BentoItem colSpan={4} className="p-6 bg-surface mt-4">
           
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-border pb-4">
              <div className="flex bg-surface-secondary p-1 rounded-xl w-fit border border-border">
                <button onClick={() => setActiveTab("QUEUE")} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "QUEUE" ? "bg-surface text-primary shadow-soft" : "text-foreground/60 hover:text-foreground"}`}>Reports Queue</button>
                <button onClick={() => setActiveTab("BANS")} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "BANS" ? "bg-surface text-danger shadow-soft" : "text-foreground/60 hover:text-foreground"}`}>Ban System</button>
                <button onClick={() => setActiveTab("APPEALS")} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${activeTab === "APPEALS" ? "bg-surface text-warning shadow-soft" : "text-foreground/60 hover:text-foreground"}`}>Appeals</button>
              </div>

              <div className="flex items-center gap-2">
                 <div className="relative">
                   <Search className="w-4 h-4 text-foreground/50 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="Search ID or User..." className="bg-surface-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
                 </div>
                 <button className="p-2 rounded-lg bg-surface-secondary border border-border text-foreground hover:bg-surface transition"><Filter className="w-4 h-4"/></button>
              </div>
           </div>

           <AnimatedContainer animation="fade">
              {activeTab === "QUEUE" && (
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-foreground/50 text-xs uppercase tracking-wider">
                          <th className="pb-3 font-bold">Report ID</th>
                          <th className="pb-3 font-bold">Reported User</th>
                          <th className="pb-3 font-bold">Reason</th>
                          <th className="pb-3 font-bold">Severity</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {reportsQueue.map((report) => (
                           <tr key={report.id} className="border-b border-border/50 hover:bg-surface-secondary/50 transition cursor-pointer group">
                             <td className="py-4 font-mono text-foreground/60">{report.id}</td>
                             <td className="py-4 font-bold text-foreground">{report.user}</td>
                             <td className="py-4 text-foreground/80">{report.reason}</td>
                             <td className="py-4">
                               <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${report.severity === 'Critical' ? 'bg-danger/20 text-danger' : report.severity === 'High' ? 'bg-warning/20 text-warning' : 'bg-surface-secondary text-foreground/60'}`}>{report.severity}</span>
                             </td>
                             <td className="py-4 font-medium text-foreground/60">{report.status}</td>
                             <td className="py-4 text-right">
                               <GlowButton variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Review</GlowButton>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}

              {activeTab === "BANS" && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentBans.map((ban, i) => (
                      <GlassPanel key={i} className="p-5 rounded-2xl border-border flex flex-col gap-4">
                         <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger border border-danger/20"><Ban className="w-5 h-5"/></div>
                             <div>
                               <h4 className="font-bold text-foreground">{ban.user}</h4>
                               <p className="text-xs text-foreground/50">{ban.type}</p>
                             </div>
                           </div>
                           <button className="text-foreground/40 hover:text-foreground"><MoreVertical className="w-5 h-5"/></button>
                         </div>
                         <div className="bg-surface-secondary p-3 rounded-lg border border-border">
                           <p className="text-xs text-foreground/60 uppercase font-bold mb-1">Reason</p>
                           <p className="text-sm text-foreground">{ban.reason}</p>
                         </div>
                         <div className="flex gap-2 mt-auto">
                           <GlowButton variant="ghost" size="sm" className="flex-1 text-xs">Edit Duration</GlowButton>
                           <GlowButton variant="secondary" size="sm" className="flex-1 text-xs border-danger/50 hover:bg-danger/10 text-danger">Revoke Ban</GlowButton>
                         </div>
                      </GlassPanel>
                    ))}
                 </div>
              )}

              {activeTab === "APPEALS" && (
                <div className="text-center py-12 text-foreground/50 flex flex-col items-center">
                   <ShieldAlert className="w-12 h-12 mb-4 text-foreground/20" />
                   <h3 className="text-lg font-bold text-foreground mb-1">No Active Appeals</h3>
                   <p className="text-sm">All user ban appeals have been processed.</p>
                </div>
              )}
           </AnimatedContainer>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
