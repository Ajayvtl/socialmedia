"use client";

import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { CreatorCard } from "@/components/ui/CreatorCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { BarChart3, Users, DollarSign, Crown } from "lucide-react";

export default function CreatorHubPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Creator Hub</h1>
        <p className="text-foreground/60">Manage your audience, subscriptions, and revenue.</p>
      </AnimatedContainer>

      <BentoGrid>
        {/* Creator Profile Summary */}
        <BentoItem colSpan={1} rowSpan={2} className="bg-transparent border-none">
          <CreatorCard 
            name="Alice Explorer" 
            username="alice_x" 
            followers={14020} 
            verified={true} 
            tier="gold"
            monthlyRevenue={4250}
            isOwner={true}
          />
        </BentoItem>

        {/* Revenue Overview */}
        <BentoItem colSpan={2} className="p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4"/> Estimated Revenue
              </p>
              <h2 className="text-4xl font-bold text-foreground mt-2">$4,250.00</h2>
            </div>
            <div className="bg-success/10 text-success px-3 py-1 rounded-full text-xs font-bold">
              +12.5% this month
            </div>
          </div>
          <div className="h-24 w-full bg-surface-secondary rounded-xl flex items-end p-2 gap-2">
            {/* Fake chart bars */}
            {[40, 60, 35, 80, 50, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </BentoItem>

        {/* Subscriptions */}
        <BentoItem colSpan={1} className="p-6 flex flex-col items-center justify-center text-center">
          <Crown className="w-8 h-8 text-warning mb-2" />
          <h3 className="text-2xl font-bold text-foreground">342</h3>
          <p className="text-sm text-foreground/60">Active Subscribers</p>
          <GlowButton variant="ghost" size="sm" className="mt-4">View All</GlowButton>
        </BentoItem>

        {/* Audience Growth */}
        <BentoItem colSpan={2} className="p-6">
          <p className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2 mb-4">
            <Users className="w-4 h-4"/> Audience Growth
          </p>
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel intensity="light" className="p-4 rounded-xl text-center">
              <p className="text-sm text-foreground/60">New Followers (30d)</p>
              <p className="text-2xl font-bold text-foreground">+1,240</p>
            </GlassPanel>
            <GlassPanel intensity="light" className="p-4 rounded-xl text-center">
              <p className="text-sm text-foreground/60">Profile Views</p>
              <p className="text-2xl font-bold text-foreground">45.2K</p>
            </GlassPanel>
          </div>
        </BentoItem>

        {/* Next Payout */}
        <BentoItem colSpan={1} className="p-6 bg-gradient-to-br from-surface to-surface-secondary border-primary/20">
          <p className="text-sm font-semibold text-foreground/60 mb-2">Next Payout</p>
          <h3 className="text-2xl font-bold text-foreground mb-1">$1,850.00</h3>
          <p className="text-xs text-warning mb-4">Processing in 3 days</p>
          <GlowButton variant="secondary" className="w-full">Manage Wallet</GlowButton>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
