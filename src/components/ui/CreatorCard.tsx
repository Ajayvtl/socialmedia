import { ReactNode } from "react";
import { FloatingCard } from "./FloatingCard";
import { VerificationBadge } from "./VerificationBadge";
import { GlowButton } from "./GlowButton";
import { Users, TrendingUp } from "lucide-react";

interface CreatorCardProps {
  name: string;
  username: string;
  avatarUrl?: string;
  verified?: boolean;
  tier?: "standard" | "premium" | "gold";
  followers: number;
  monthlyRevenue?: number;
  onSubscribe?: () => void;
  isOwner?: boolean;
}

export function CreatorCard({
  name,
  username,
  avatarUrl,
  verified,
  tier,
  followers,
  monthlyRevenue,
  onSubscribe,
  isOwner = false,
}: CreatorCardProps) {
  return (
    <FloatingCard glass className="flex flex-col items-center p-6 text-center">
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full border-2 border-primary bg-surface-secondary overflow-hidden flex items-center justify-center shadow-glow">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary">{name[0].toUpperCase()}</span>
          )}
        </div>
        {verified && (
          <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5">
            <VerificationBadge verified={true} tier={tier} />
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold text-foreground flex items-center gap-1">
        {name}
      </h3>
      <p className="text-sm text-foreground/60 mb-6">@{username}</p>

      <div className="flex w-full justify-around mb-6 border-t border-b border-border py-3">
        <div className="flex flex-col items-center">
          <span className="text-sm text-foreground/60 flex items-center gap-1"><Users className="w-3 h-3"/> Followers</span>
          <span className="font-bold text-lg text-foreground">{followers.toLocaleString()}</span>
        </div>
        {isOwner && monthlyRevenue !== undefined && (
          <div className="flex flex-col items-center">
            <span className="text-sm text-foreground/60 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> MRR</span>
            <span className="font-bold text-lg text-success">${monthlyRevenue.toLocaleString()}</span>
          </div>
        )}
      </div>

      {!isOwner && (
        <GlowButton variant="primary" className="w-full" onClick={onSubscribe}>
          Subscribe
        </GlowButton>
      )}
      {isOwner && (
        <GlowButton variant="secondary" className="w-full">
          Manage Profile
        </GlowButton>
      )}
    </FloatingCard>
  );
}
