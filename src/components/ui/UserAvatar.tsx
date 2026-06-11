"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AppImage } from "./AppImage";
import { VerificationBadge } from "./VerificationBadge";

interface UserAvatarProps {
  userId: string;
  avatarUrl?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  isOnline?: boolean;
  showStoryRing?: boolean;
  hasUnseenStory?: boolean;
  verified?: boolean;
  verificationTier?: "standard" | "premium" | "gold";
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-2xl",
};

const getGradient = (name: string) => {
  const gradients = [
    "from-[#00E5FF] to-[#8B5CF6]",
    "from-[#FF4D8D] to-[#8B5CF6]",
    "from-[#FACC15] to-[#FF4D8D]",
    "from-[#00D97E] to-[#00E5FF]",
    "from-indigo-400 to-purple-500",
    "from-cyan-400 to-blue-500"
  ];
  const charCodeSum = (name || "U").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[charCodeSum % gradients.length];
};

export function UserAvatar({
  userId,
  avatarUrl,
  name = "U",
  size = "md",
  showPresence = false,
  isOnline = false,
  showStoryRing = false,
  hasUnseenStory = false,
  verified = false,
  verificationTier = "standard",
  className,
  onClick,
}: UserAvatarProps) {
  const fallbackLetter = name.trim().charAt(0).toUpperCase() || "U";
  const gradientClass = getGradient(name);

  return (
    <div 
      className={cn("relative inline-block shrink-0 select-none", onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      {/* Story Ring Wrapper */}
      <div className={cn(
        "rounded-full flex items-center justify-center transition-all p-[2px]",
        showStoryRing && (hasUnseenStory ? "bg-gradient-to-tr from-primary via-secondary to-accent" : "border border-border")
      )}>
        {/* Avatar Body */}
        <div className={cn(
          "rounded-full overflow-hidden flex items-center justify-center border border-border/10 bg-surface-secondary",
          sizeClasses[size]
        )}>
          {avatarUrl ? (
            <AppImage 
              src={avatarUrl} 
              alt={name} 
              className="w-full h-full object-cover"
              loadingVariant="skeleton"
            />
          ) : (
            <div className={cn("w-full h-full flex items-center justify-center font-bold text-white bg-gradient-to-br", gradientClass)}>
              {fallbackLetter}
            </div>
          )}
        </div>
      </div>

      {/* Online Status Dot */}
      {showPresence && (
        <span className={cn(
          "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
          size === 'xs' || size === 'sm' ? "w-2 h-2" : "w-3 h-3",
          isOnline ? "bg-success" : "bg-foreground/30"
        )} />
      )}

      {/* Verification Badge Overlay (Placed top right or bottom right depending on size) */}
      {verified && size !== 'xs' && (
        <VerificationBadge 
          verified={verified} 
          tier={verificationTier} 
          className={cn(
            "absolute -top-1 -right-1 bg-background rounded-full p-[1px] shadow-sm",
            size === 'sm' && "w-3.5 h-3.5",
            size === 'md' && "w-4.5 h-4.5",
            (size === 'lg' || size === 'xl') && "w-5.5 h-5.5"
          )}
        />
      )}
    </div>
  );
}
