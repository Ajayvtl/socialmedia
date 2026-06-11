"use client";

import React from "react";
import { Lock, EyeOff, ShieldAlert, Ban, ArrowLeft } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export type PermissionStateVariant = "private" | "restricted" | "admin_denied" | "suspended";

interface PermissionStateProps {
  variant?: PermissionStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function PermissionState({
  variant = "private",
  title,
  description,
  actionLabel,
  onAction,
  className,
}: PermissionStateProps) {
  
  const config = {
    private: {
      icon: <Lock className="w-12 h-12" />,
      defaultTitle: "Private Content",
      defaultDesc: "This room, community, or event is set to private. You must request approval from the administrator to join.",
      defaultAction: "Request Invitation",
    },
    restricted: {
      icon: <EyeOff className="w-12 h-12" />,
      defaultTitle: "Restricted Access",
      defaultDesc: "This content is reserved for premium subscribers or specific roles. Upgrade your profile tier to unlock.",
      defaultAction: "Upgrade Account",
    },
    admin_denied: {
      icon: <ShieldAlert className="w-12 h-12" />,
      defaultTitle: "Staff Access Only",
      defaultDesc: "You do not have the administration credentials or privileges required to access this system panel.",
      defaultAction: "Return to Safety",
    },
    suspended: {
      icon: <Ban className="w-12 h-12" />,
      defaultTitle: "Account Suspended",
      defaultDesc: "This account has been restricted due to community guideline violations. Please contact appeals support.",
      defaultAction: "Contact Support",
    },
  };

  const current = config[variant];
  const displayTitle = title || current.defaultTitle;
  const displayDesc = description || current.defaultDesc;
  const displayAction = actionLabel || current.defaultAction;

  const defaultOnAction = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center bg-surface-secondary/20 border border-border/40 rounded-2xl max-w-lg mx-auto w-full",
      className
    )}>
      <div className="text-warning mb-4 p-4 bg-surface rounded-full border border-border/10 shadow-soft">
        {current.icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1.5">{displayTitle}</h3>
      <p className="text-sm text-foreground/50 max-w-sm mb-6 leading-relaxed">
        {displayDesc}
      </p>
      
      <Button 
        variant="primary" 
        onClick={onAction || (variant === "admin_denied" ? defaultOnAction : undefined)}
        icon={variant === "admin_denied" ? <ArrowLeft className="w-4 h-4" /> : undefined}
      >
        {displayAction}
      </Button>
    </div>
  );
}
