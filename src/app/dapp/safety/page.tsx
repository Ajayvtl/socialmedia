"use client";

import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { ShieldCheck, Mail, Smartphone, Camera, FileText, Ban, AlertTriangle, Fingerprint, Info } from "lucide-react";

export default function TrustAndSafetyPage() {
  const trustScore = 85;
  
  const verificationSteps = [
    { id: "email", name: "Email Address", icon: Mail, status: "Verified", color: "text-success", bg: "bg-success/10" },
    { id: "phone", name: "Phone Number", icon: Smartphone, status: "Verified", color: "text-success", bg: "bg-success/10" },
    { id: "selfie", name: "Liveness Check", icon: Camera, status: "Pending", color: "text-warning", bg: "bg-warning/10" },
    { id: "id", name: "Government ID", icon: FileText, status: "Action Required", color: "text-danger", bg: "bg-danger/10" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" /> Trust & Safety
          </h1>
          <p className="text-foreground/60">Manage your verification status, privacy limits, and trust score.</p>
        </div>
      </AnimatedContainer>

      <BentoGrid>
        {/* Trust Score Card */}
        <BentoItem colSpan={2} className="p-6 bg-gradient-to-br from-surface to-surface-secondary border-primary/20 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-5">
            <Fingerprint className="w-64 h-64 text-primary" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Platform Trust Score</h2>
            </div>
            
            <div className="flex items-end gap-2 mb-2 mt-auto">
              <span className="text-6xl font-extrabold text-foreground">{trustScore}</span>
              <span className="text-xl text-foreground/50 mb-1">/ 100</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-3 bg-background rounded-full mt-2 overflow-hidden border border-border">
              <div 
                className="h-full bg-gradient-to-r from-danger via-warning to-success rounded-full"
                style={{ width: `${trustScore}%` }}
              />
            </div>
            
            <p className="text-sm text-foreground/60 mt-4 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
              Your score affects your visibility in discovery, matchmaking priority, and marketplace limits. Complete more verifications to increase it.
            </p>
          </div>
        </BentoItem>

        {/* Verification Center */}
        <BentoItem colSpan={2} className="p-6 bg-surface">
          <h2 className="text-xl font-bold text-foreground mb-6">Verification Center</h2>
          <div className="space-y-4">
            {verificationSteps.map((step) => (
              <GlassPanel key={step.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl hover:border-primary/50 transition cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-border ${step.bg}`}>
                    <step.icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{step.name}</h4>
                    <p className={`text-xs font-bold ${step.color}`}>{step.status}</p>
                  </div>
                </div>
                {step.status !== "Verified" && (
                  <GlowButton variant="secondary" size="sm" className="w-full sm:w-auto">
                    Verify Now
                  </GlowButton>
                )}
              </GlassPanel>
            ))}
          </div>
        </BentoItem>

        {/* Safety & Moderation Controls */}
        <BentoItem colSpan={4} className="p-0 border-none bg-transparent mt-4">
           <h2 className="text-xl font-bold text-foreground mb-4">Safety Dashboard</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassPanel className="p-6 rounded-3xl flex flex-col items-start border-border hover:border-danger/50 transition">
                <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center text-danger border border-danger/20 mb-4">
                  <Ban className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">Blocked Users</h3>
                <p className="text-sm text-foreground/60 mb-4">Manage users you have blocked from contacting you.</p>
                <div className="mt-auto pt-4 border-t border-border w-full flex justify-between items-center">
                  <span className="text-2xl font-bold text-foreground">12</span>
                  <span className="text-xs text-primary font-bold cursor-pointer hover:underline">Manage</span>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 rounded-3xl flex flex-col items-start border-border hover:border-warning/50 transition">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning border border-warning/20 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">My Reports</h3>
                <p className="text-sm text-foreground/60 mb-4">Track the status of reports you have submitted.</p>
                <div className="mt-auto pt-4 border-t border-border w-full flex justify-between items-center">
                  <span className="text-2xl font-bold text-foreground">2</span>
                  <span className="text-xs text-primary font-bold cursor-pointer hover:underline">View Log</span>
                </div>
              </GlassPanel>

              <GlassPanel className="p-6 rounded-3xl flex flex-col items-start border-border hover:border-primary/50 transition">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 mb-4">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-1">Privacy Limits</h3>
                <p className="text-sm text-foreground/60 mb-4">Control who can send you requests and view your profile.</p>
                <div className="mt-auto pt-4 border-t border-border w-full flex justify-between items-center">
                  <span className="text-xs text-success font-bold bg-success/10 px-2 py-1 rounded">Strict Mode Active</span>
                  <span className="text-xs text-primary font-bold cursor-pointer hover:underline">Settings</span>
                </div>
              </GlassPanel>
           </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
