"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { VerificationBadge } from "./VerificationBadge";

interface UserIdentityProps {
  userId: string;
  username?: string;
  displayName?: string;
  verified?: boolean;
  verificationTier?: "standard" | "premium" | "gold";
  showUsername?: boolean;
  clickable?: boolean;
  className?: string;
}

export function UserIdentity({
  userId,
  username,
  displayName,
  verified = false,
  verificationTier = "standard",
  showUsername = false,
  clickable = true,
  className,
}: UserIdentityProps) {
  const displayVal = displayName || username || `User #${userId.slice(0, 6)}`;
  const linkHref = `/dapp/u/${username || userId}`;

  const renderContent = () => (
    <div className={cn("inline-flex flex-col min-w-0 justify-center", className)}>
      <div className="inline-flex items-center gap-1.5 min-w-0">
        <span className="font-bold text-foreground hover:text-primary transition-colors truncate">
          {displayVal}
        </span>
        {verified && (
          <VerificationBadge verified={verified} tier={verificationTier} className="shrink-0" />
        )}
      </div>
      {showUsername && username && (
        <span className="text-xs text-foreground/40 truncate">
          @{username}
        </span>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link href={linkHref} className="hover:opacity-90 inline-block min-w-0">
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
}
