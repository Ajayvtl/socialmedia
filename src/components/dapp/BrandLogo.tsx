"use client";

import { useSettings } from "@/context/SettingsContext";
import { getMediaUrl } from "@/lib/api";

export default function BrandLogo({
  compact = false,
  centered = false,
  className = "",
}: {
  compact?: boolean;
  centered?: boolean;
  className?: string;
}) {
  const { settings } = useSettings();

  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      <div className={`inline-flex ${centered ? "justify-center" : "justify-start"} items-center gap-3 w-full`}>
        {settings?.logo ? (
          <img
            src={getMediaUrl(settings.logo)}
            alt={settings.brand_name || "Company Logo"}
            className={`${compact ? "h-10" : "h-16"} w-auto object-contain`}
          />
        ) : (
          <div className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] ${compact ? "text-2xl" : "text-4xl"}`}>
            {settings?.brand_name || "Company DApp"}
          </div>
        )}
      </div>
      {!compact ? (
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#5bbcff]">
          {settings?.site_name || "Data . Insight . Growth"}
        </p>
      ) : null}
    </div>
  );
}
