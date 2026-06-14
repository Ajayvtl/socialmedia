import React from 'react';
import { Layers } from 'lucide-react';

export const SpatialPhoto = ({ imageUrl, depthMapUrl }: { imageUrl: string, depthMapUrl?: string }) => {
  return (
    <div className="relative w-full h-full overflow-hidden group">
      <img src={imageUrl} alt="Spatial Memory" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      {depthMapUrl && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
           <Layers className="w-4 h-4 text-[#00E5FF]" />
           <span className="text-xs font-bold text-white uppercase tracking-wider">Spatial 3D</span>
        </div>
      )}
    </div>
  );
};

// Trigger Vercel Build
