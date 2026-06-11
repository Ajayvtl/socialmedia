"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DappDashboardPage() {
  const router = useRouter();

  // In a pure social media app, the "Dashboard" is replaced by the "Feed" or "Home" stream.
  // We seamlessly redirect the user to the Social Feed.
  useEffect(() => {
    router.replace("/dapp/feed");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
       <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
       <p className="text-foreground/60 font-bold uppercase tracking-widest text-sm">Entering the Vortex...</p>
    </div>
  );
}
