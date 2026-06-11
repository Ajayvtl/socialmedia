"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Heart, X, Star, Sparkles, Calendar, Zap, MessageCircle, MapPin } from "lucide-react";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";

export default function DatingUXPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [view, setView] = useState<"DISCOVER" | "MATCHES">("DISCOVER");

  const fetchDiscover = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dating/discover`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProfiles(res.data.data);
    } catch (err) {
      toast.error("Failed to load discover profiles");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/dating/matches`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMatches(res.data.data);
    } catch (err) {
      toast.error("Failed to load matches");
    }
  };

  useEffect(() => {
    if (view === "DISCOVER") fetchDiscover();
    else fetchMatches();
  }, [view]);

  const handleInteraction = async (swipedId: number, direction: "LEFT" | "RIGHT" | "SUPER_LIKE") => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/dating/swipe`,
        { swipedId, direction },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      if (res.data.data.isMatch) {
        toast.success("It's a Match! 🎉", { icon: "💖", duration: 4000 });
      }

      setProfiles((current) => current.filter((p) => p.id !== swipedId));
    } catch (err) {
      toast.error("Interaction failed");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Connect</h1>
          <p className="text-foreground/60">Find genuine connections based on shared interests and events.</p>
        </div>
        <div className="flex bg-surface-secondary p-1 rounded-xl w-fit border border-border">
          <button
            onClick={() => setView("DISCOVER")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
              view === "DISCOVER" ? "bg-primary text-background shadow-glow" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setView("MATCHES")}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
              view === "MATCHES" ? "bg-primary text-background shadow-glow" : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Matches
          </button>
        </div>
      </AnimatedContainer>

      {view === "DISCOVER" ? (
        <BentoGrid stagger={true}>
          {loading ? (
            <BentoItem colSpan={4} className="p-12 text-center text-foreground/60 bg-transparent border-none">
              <Zap className="w-8 h-8 animate-pulse mx-auto mb-4 text-primary" />
              Scanning the network for compatible connections...
            </BentoItem>
          ) : profiles.length > 0 ? (
            profiles.slice(0, 8).map((profile) => {
              // Generate fake compatibility score for UI purposes based on ID
              const compatibility = 75 + (profile.id % 24);
              
              return (
                <FloatingCard key={profile.id} glass className="p-0 overflow-hidden flex flex-col relative group">
                  <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute top-4 right-4 bg-background/80 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-success border border-success/30 flex items-center gap-1">
                      <Sparkles className="w-3 h-3"/> {compatibility}% Match
                    </div>
                  </div>
                  
                  <div className="px-5 pb-5 pt-0 flex-1 flex flex-col relative">
                    <div className="w-16 h-16 rounded-2xl bg-surface border-4 border-background flex items-center justify-center text-2xl font-bold text-primary shadow-soft -mt-8 mb-3 z-10">
                      {profile.email ? profile.email[0].toUpperCase() : "U"}
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground truncate">{profile.email || "Anonymous User"}</h3>
                    <p className="text-xs text-foreground/60 flex items-center gap-1 mb-3"><MapPin className="w-3 h-3"/> {profile.location || "Location hidden"}</p>
                    
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-4 flex-1">
                      "{profile.bio || "Exploring the digital world..."}"
                    </p>

                    <div className="flex gap-2 mt-auto border-t border-border pt-4">
                      <button 
                        onClick={() => handleInteraction(profile.id, "LEFT")}
                        className="flex-1 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition flex items-center justify-center"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleInteraction(profile.id, "SUPER_LIKE")}
                        className="flex-1 py-2 rounded-xl border border-secondary/30 text-secondary hover:bg-secondary/10 transition flex items-center justify-center"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleInteraction(profile.id, "RIGHT")}
                        className="flex-1 py-2 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition flex items-center justify-center"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </FloatingCard>
              );
            })
          ) : (
            <BentoItem colSpan={4} className="p-12 text-center border-none bg-transparent">
              <div className="w-20 h-20 bg-surface rounded-full mx-auto flex items-center justify-center mb-4 border border-border">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">You've seen everyone!</h3>
              <p className="text-foreground/60 text-sm mt-2">Check back later or expand your discovery preferences.</p>
            </BentoItem>
          )}
        </BentoGrid>
      ) : (
        <AnimatedContainer animation="fade" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.length === 0 ? (
            <div className="col-span-full text-center text-foreground/60 mt-10 p-12 bg-surface rounded-3xl border border-border">
              <MessageCircle className="w-12 h-12 text-border mx-auto mb-4" />
              No matches yet. Keep discovering!
            </div>
          ) : (
            matches.map((match: any) => (
              <GlassPanel key={match.match_id} className="p-4 rounded-2xl flex items-center space-x-4 hover:border-primary/50 transition cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5 shrink-0">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center text-foreground font-bold text-lg">
                    {match.email ? match.email[0].toUpperCase() : "U"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-bold truncate">{match.email || "Anonymous User"}</h3>
                  <p className="text-foreground/60 text-xs">Matched on {new Date(match.matched_at).toLocaleDateString()}</p>
                </div>
                <GlowButton variant="secondary" size="sm" className="shrink-0">
                  Chat
                </GlowButton>
              </GlassPanel>
            ))
          )}
        </AnimatedContainer>
      )}
    </div>
  );
}
