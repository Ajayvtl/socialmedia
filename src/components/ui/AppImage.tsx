"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { getMediaUrl } from "@/lib/api";
import { Image as ImageIcon } from "lucide-react";

interface AppImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  loadingVariant?: 'blur' | 'skeleton' | 'none';
  containerClassName?: string;
}

export function AppImage({
  src,
  fallbackSrc,
  loadingVariant = 'skeleton',
  containerClassName,
  className,
  alt = "Image",
  ...props
}: AppImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const resolvedSrc = error 
    ? (fallbackSrc || "/images/placeholder.png") 
    : getMediaUrl(src);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {loadingVariant !== 'none' && !loaded && !error && (
        <div className={cn(
          "absolute inset-0 bg-surface-secondary",
          loadingVariant === 'skeleton' && "animate-pulse",
          loadingVariant === 'blur' && "backdrop-blur-md"
        )} />
      )}
      <img
        src={resolvedSrc}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          !loaded && loadingVariant !== 'none' ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}
