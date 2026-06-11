"use client";

import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Coins, Gem, ShoppingBag, Gift, ArrowRight } from "lucide-react";

export default function WalletStorePage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Virtual Wallet</h1>
        <p className="text-foreground/60">Manage your Gems, Coins, and unlock exclusive store items.</p>
      </AnimatedContainer>

      <BentoGrid>
        {/* Gems Card */}
        <BentoItem colSpan={2} className="p-6 bg-gradient-to-br from-surface to-surface-secondary border-secondary/30 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-secondary/10">
            <Gem className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-sm font-semibold text-secondary uppercase tracking-wider flex items-center gap-2">
                <Gem className="w-4 h-4"/> Premium Gems
              </p>
              <h2 className="text-5xl font-extrabold text-foreground mt-4">1,250</h2>
              <p className="text-sm text-foreground/60 mt-1">Used for gifts & premium features</p>
            </div>
            <GlowButton variant="primary" className="w-fit mt-6">Buy Gems</GlowButton>
          </div>
        </BentoItem>

        {/* Coins Card */}
        <BentoItem colSpan={2} className="p-6 bg-gradient-to-br from-surface to-surface-secondary border-warning/30 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 text-warning/10">
            <Coins className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-sm font-semibold text-warning uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4"/> Social Coins
              </p>
              <h2 className="text-5xl font-extrabold text-foreground mt-4">45,800</h2>
              <p className="text-sm text-foreground/60 mt-1">Earned from engagement & posts</p>
            </div>
            <GlowButton variant="secondary" className="w-fit mt-6">Exchange</GlowButton>
          </div>
        </BentoItem>

        {/* Store Highlight */}
        <BentoItem colSpan={4} className="p-0 border-none bg-transparent">
          <div className="flex items-center justify-between mb-4 mt-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-primary"/> Featured Avatar Store</h2>
            <GlowButton variant="ghost" size="sm" className="text-primary flex items-center gap-1">View All <ArrowRight className="w-4 h-4"/></GlowButton>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Neon Halo", type: "Headwear", price: "300", currency: "Gems", color: "from-purple-500/20 to-blue-500/20" },
              { name: "Cyber Jacket", type: "Clothing", price: "50,000", currency: "Coins", color: "from-emerald-500/20 to-cyan-500/20" },
              { name: "Golden Wings", type: "Accessory", price: "1,200", currency: "Gems", color: "from-yellow-500/20 to-orange-500/20" },
              { name: "Aura Trail", type: "Effect", price: "15,000", currency: "Coins", color: "from-pink-500/20 to-rose-500/20" },
            ].map((item, i) => (
              <FloatingCard key={i} glass className="p-4 flex flex-col items-center text-center group cursor-pointer hover:border-primary/50">
                <div className={`w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br ${item.color} border border-border flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Gift className="w-8 h-8 text-foreground/80" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{item.name}</h3>
                <p className="text-xs text-foreground/50 mb-3">{item.type}</p>
                <div className="flex items-center gap-1 mt-auto bg-surface-secondary px-3 py-1 rounded-full border border-border">
                  {item.currency === "Gems" ? <Gem className="w-3 h-3 text-secondary"/> : <Coins className="w-3 h-3 text-warning"/>}
                  <span className="text-xs font-bold text-foreground">{item.price}</span>
                </div>
              </FloatingCard>
            ))}
          </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
