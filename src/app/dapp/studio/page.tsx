"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Video, Music, Scissors, Sparkles, UploadCloud, Play, Pause, Image as ImageIcon, Volume2 } from "lucide-react";

export default function MediaStudioPage() {
  const [activeTab, setActiveTab] = useState<"EDIT" | "FILTERS" | "AUDIO">("EDIT");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col space-y-4">
      <AnimatedContainer animation="slideUp" className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-2">
            <Video className="w-8 h-8 text-primary" /> Media Studio
          </h1>
          <p className="text-foreground/60">Create, edit, and publish high-quality content directly to your feed.</p>
        </div>
        <GlowButton variant="primary">Publish Post</GlowButton>
      </AnimatedContainer>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* Main Preview Area (Left) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <GlassPanel className="flex-1 rounded-3xl overflow-hidden bg-background/50 border border-border relative flex items-center justify-center group">
            {/* Fake Video Preview */}
            <div className="absolute inset-0 bg-gradient-to-tr from-surface to-surface-secondary flex items-center justify-center opacity-80" />
            <UploadCloud className="w-16 h-16 text-primary/30 absolute z-0" />
            <div className="z-10 text-center">
               <p className="text-foreground/60 mb-4 font-medium">Drag & Drop Video or Image</p>
               <GlowButton variant="secondary" size="sm"><UploadCloud className="w-4 h-4 mr-2"/> Browse Files</GlowButton>
            </div>

            {/* Video Player Controls (Mock) */}
            <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur rounded-2xl p-3 border border-border flex items-center gap-4 transition-opacity opacity-0 group-hover:opacity-100">
               <button onClick={() => setIsPlaying(!isPlaying)} className="text-foreground hover:text-primary transition-colors">
                 {isPlaying ? <Pause className="w-6 h-6"/> : <Play className="w-6 h-6"/>}
               </button>
               <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden relative cursor-pointer">
                 <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
               </div>
               <span className="text-xs font-bold text-foreground font-mono">00:15 / 00:45</span>
               <button className="text-foreground hover:text-primary transition-colors"><Volume2 className="w-5 h-5"/></button>
            </div>
          </GlassPanel>

          {/* Timeline Editor */}
          <GlassPanel className="h-32 rounded-3xl p-4 border border-border flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2"><Scissors className="w-4 h-4 text-warning"/> Timeline</h4>
              <span className="text-xs bg-surface-secondary px-2 py-0.5 rounded text-foreground/60">Zoom: 100%</span>
            </div>
            <div className="flex-1 bg-surface-secondary rounded-xl border border-border relative overflow-hidden flex items-center px-2">
              {/* Fake Video Track */}
              <div className="h-10 w-3/4 bg-primary/20 border border-primary/50 rounded-lg flex items-center px-2 relative group cursor-ew-resize">
                 <ImageIcon className="w-4 h-4 text-primary/50" />
                 <div className="absolute left-0 w-2 h-full bg-primary rounded-l-lg cursor-col-resize"></div>
                 <div className="absolute right-0 w-2 h-full bg-primary rounded-r-lg cursor-col-resize"></div>
              </div>
              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-danger left-1/3 shadow-[0_0_8px_rgba(255,0,0,0.8)] z-10 pointer-events-none"></div>
            </div>
          </GlassPanel>
        </div>

        {/* Tools Sidebar (Right) */}
        <div className="w-full md:w-80 flex flex-col gap-4 shrink-0">
          <div className="flex bg-surface-secondary p-1 rounded-2xl w-full border border-border">
            <button
              onClick={() => setActiveTab("EDIT")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "EDIT" ? "bg-surface text-foreground shadow-soft" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Scissors className="w-4 h-4"/> Edit
            </button>
            <button
              onClick={() => setActiveTab("FILTERS")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "FILTERS" ? "bg-surface text-primary shadow-soft" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Sparkles className="w-4 h-4"/> Filters
            </button>
            <button
              onClick={() => setActiveTab("AUDIO")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "AUDIO" ? "bg-surface text-secondary shadow-soft" : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Music className="w-4 h-4"/> Audio
            </button>
          </div>

          <GlassPanel className="flex-1 rounded-3xl p-5 border border-border overflow-y-auto">
             {activeTab === "FILTERS" && (
               <AnimatedContainer animation="fade" className="space-y-4">
                 <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-2">Color Grading</h3>
                 <div className="grid grid-cols-2 gap-3">
                   {["Cyberpunk", "Neon Wash", "Vintage 90s", "B&W Noir", "Golden Hour", "Matrix Green"].map((filter, i) => (
                     <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-surface to-surface-secondary border border-border flex items-end p-2 cursor-pointer hover:border-primary/50 transition group overflow-hidden relative">
                       <div className={`absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity`} />
                       <span className="text-xs font-bold text-foreground relative z-10 drop-shadow-md">{filter}</span>
                     </div>
                   ))}
                 </div>
               </AnimatedContainer>
             )}

             {activeTab === "AUDIO" && (
               <AnimatedContainer animation="fade" className="space-y-4">
                 <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-2">Soundtrack</h3>
                 <GlowButton variant="secondary" className="w-full mb-4"><Search className="w-4 h-4 mr-2"/> Browse Library</GlowButton>
                 <div className="space-y-2">
                   {["Lo-Fi Chill Beats", "Cyberpunk Synth", "Trending TikTok Sound"].map((track, i) => (
                     <div key={i} className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between cursor-pointer hover:border-secondary/50 transition">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                           <Music className="w-4 h-4" />
                         </div>
                         <span className="text-sm font-bold text-foreground truncate max-w-[120px]">{track}</span>
                       </div>
                       <button className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded">Add</button>
                     </div>
                   ))}
                 </div>
               </AnimatedContainer>
             )}

             {activeTab === "EDIT" && (
               <AnimatedContainer animation="fade" className="space-y-6">
                 <div>
                   <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-3">Adjustments</h3>
                   <div className="space-y-4">
                     {["Brightness", "Contrast", "Saturation"].map((adj) => (
                       <div key={adj}>
                         <div className="flex justify-between text-xs font-bold text-foreground mb-2">
                           <span>{adj}</span>
                           <span>0%</span>
                         </div>
                         <input type="range" className="w-full accent-primary" />
                       </div>
                     ))}
                   </div>
                 </div>
                 
                 <div className="border-t border-border pt-4">
                   <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-3">Transform</h3>
                   <div className="grid grid-cols-2 gap-2">
                     <button className="py-2 bg-surface border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-secondary transition">Crop (16:9)</button>
                     <button className="py-2 bg-surface border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-secondary transition">Crop (9:16)</button>
                     <button className="py-2 bg-surface border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-secondary transition">Rotate</button>
                     <button className="py-2 bg-surface border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-secondary transition">Flip</button>
                   </div>
                 </div>
               </AnimatedContainer>
             )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
