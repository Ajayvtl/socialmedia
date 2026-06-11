import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  verified?: boolean;
  tier?: "standard" | "premium" | "gold";
  className?: string;
}

export function VerificationBadge({ verified = true, tier = "standard", className }: VerificationBadgeProps) {
  if (!verified) return null;

  const tiers = {
    standard: "text-primary",
    premium: "text-secondary",
    gold: "text-warning",
  };

  return (
    <div title={`${tier.charAt(0).toUpperCase() + tier.slice(1)} Verified`} className={cn("inline-flex items-center justify-center", className)}>
      <BadgeCheck className={cn("w-5 h-5", tiers[tier])} />
    </div>
  );
}
