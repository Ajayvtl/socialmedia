"use client";

import { useMemo, useState, useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { getMediaUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function FamilyCircleView({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Group data by relationship layers
  const { layers, maxLayerCount } = useMemo(() => {
    if (!data) return { layers: [], maxLayerCount: 0 };
    
    // Layer 0: Self
    const layer0 = [{ ...data.self, layerType: 'self' }];
    
    // Layer 1: Parents, Spouse, Children
    const layer1 = [
      ...data.uplines.slice(0, 2).map((u: any) => ({ ...u, layerType: 'parent' })),
      ...(data.relationships || []).filter((r: any) => r.relationship_type === 'spouse' || r.relationship_type === 'child').map((r: any) => ({
        id: `rel_${r.id}`,
        display_name: r.related_name || `User ${r.related_user_id}`,
        layerType: r.relationship_type
      }))
    ];

    // Layer 2: Siblings, Extended Family
    const layer2 = [
      ...data.uplines.slice(2).map((u: any) => ({ ...u, layerType: 'grandparent' })),
      ...(data.relationships || []).filter((r: any) => r.relationship_type === 'sibling' || r.relationship_type === 'relative').map((r: any) => ({
        id: `rel_${r.id}`,
        display_name: r.related_name || `User ${r.related_user_id}`,
        layerType: r.relationship_type
      }))
    ];

    // Layer 3: Friends, Connections
    const layer3 = [
      ...(data.relationships || []).filter((r: any) => r.relationship_type.includes('friend') || r.relationship_type === 'business').map((r: any) => ({
        id: `rel_${r.id}`,
        display_name: r.related_name || `User ${r.related_user_id}`,
        layerType: r.relationship_type
      })),
      ...(data.connections || []).map((c: any) => ({ ...c, layerType: 'connection' }))
    ].slice(0, 20); // Limit to 20 for concentric circle visual sanity

    const layers = [layer0, layer1, layer2, layer3].filter(l => l.length > 0);
    const maxLayerCount = Math.max(...layers.map(l => l.length));

    return { layers, maxLayerCount };
  }, [data]);

  if (!data) return null;

  const baseRadius = 120;

  return (
    <div className="w-full h-full relative overflow-hidden" ref={containerRef}>
      
      {/* Controls */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><ZoomIn className="w-5 h-5" /></button>
        <button onClick={() => setZoom(1)} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><Maximize className="w-5 h-5" /></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><ZoomOut className="w-5 h-5" /></button>
      </div>

      <motion.div 
        drag
        dragConstraints={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        <motion.div 
          animate={{ scale: zoom }} 
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative flex items-center justify-center w-full h-full"
        >
          {layers.map((layer, layerIdx) => {
            const radius = layerIdx * baseRadius;
            
            return (
              <div key={layerIdx} className="absolute flex items-center justify-center">
                {/* Orbital Ring */}
                {layerIdx > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: layerIdx * 0.2 }}
                    className="absolute border border-white/10 rounded-full"
                    style={{ 
                      width: radius * 2, 
                      height: radius * 2,
                      boxShadow: layerIdx === 1 ? '0 0 40px rgba(0,229,255,0.05)' : layerIdx === 2 ? '0 0 40px rgba(139,92,246,0.05)' : 'none'
                    }}
                  />
                )}

                {/* Nodes */}
                {layer.map((node: any, i: number) => {
                  const angle = (i / layer.length) * Math.PI * 2;
                  // Start top, go clockwise
                  const x = radius * Math.sin(angle);
                  const y = -radius * Math.cos(angle);
                  const isCenter = layerIdx === 0;

                  return (
                    <motion.div
                      key={node.id || i}
                      initial={{ opacity: 0, x: 0, y: 0 }}
                      animate={{ opacity: 1, x, y }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 100, 
                        damping: 20, 
                        delay: (layerIdx * 0.2) + (i * 0.05) 
                      }}
                      className="absolute flex flex-col items-center justify-center"
                      style={{ 
                        marginLeft: '-40px', // half width
                        marginTop: '-40px'   // half height
                      }}
                    >
                      {/* Connection Line to center (optional, tricky with absolute coords, but handled by ring visual usually) */}
                      
                      <div className={`
                        relative group cursor-pointer
                        ${isCenter ? 'w-24 h-24' : 'w-16 h-16'}
                        rounded-full overflow-hidden border-2 
                        ${isCenter ? 'border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.4)]' : 'border-white/20 shadow-xl'}
                        bg-[#050816] flex items-center justify-center
                      `}
                      onClick={() => {
                        if (onNodeClick) {
                           onNodeClick(node);
                        } else if (node.username) {
                           router.push(`/dapp/u/${node.username}`);
                        }
                      }}
                      >
                        {node.avatar_url ? (
                          <img src={getMediaUrl(node.avatar_url)} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white ${isCenter ? 'text-3xl' : 'text-xl'}`}>
                            {(node.display_name || node.username || node.related_name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                           <span className="text-white text-[10px] font-bold uppercase">{node.layerType}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-center bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                        <p className="text-white text-xs font-bold whitespace-nowrap">{node.display_name || node.username || node.related_name}</p>
                        {isCenter && <p className="text-[#00E5FF] text-[9px] uppercase tracking-wider font-bold">You</p>}
                        {!isCenter && <p className="text-white/50 text-[9px] uppercase tracking-wider">{node.layerType}</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
