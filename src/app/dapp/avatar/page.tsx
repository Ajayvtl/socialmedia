"use client";

import { useState, Suspense } from "react";
import { Sparkles, ShoppingBag, Settings, Star, Coins, ArrowRight, Play, Maximize2, RotateCcw, Loader2 } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei";

function AvatarModel() {
  const { scene } = useGLTF("/models/avatar.glb");
  // The RobotExpressive model is a bit small, we scale it up slightly.
  return <primitive object={scene} scale={0.8} position={[0, -2, 0]} />;
}
useGLTF.preload("/models/avatar.glb");

export default function AvatarStudioPage() {
  const [activeCategory, setActiveCategory] = useState("Face");

  const categories = ["Face", "Hair", "Clothing", "Accessories", "Animations"];
  
  const clothingItems = [
    { id: 1, name: "Neon Tech Jacket", rarity: "Epic", price: 450 },
    { id: 2, name: "Cyberpunk Hoodie", rarity: "Rare", price: 200 },
    { id: 3, name: "Holo Sneaks", rarity: "Legendary", price: 850 },
    { id: 4, name: "Basic Tee", rarity: "Common", price: 0 },
    { id: 5, name: "Glass Visor", rarity: "Epic", price: 300 },
    { id: 6, name: "Aura Ring", rarity: "Legendary", price: 1200 },
  ];

  return (
    <div className="h-screen w-full flex flex-col xl:flex-row overflow-hidden relative">
      
      {/* 3D VIEWER AREA (Center/Left) */}
      <div className="flex-1 relative flex items-center justify-center min-h-[60vh] xl:min-h-screen bg-gradient-to-b from-[#050816] via-[#121633] to-[#050816]">
        
        {/* Simulated 3D Environment Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* The 3D Avatar Engine */}
        <div className="relative z-10 w-full h-[600px] max-w-lg mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing">
          {/* Platform ring */}
          <div className="absolute bottom-[10%] w-64 h-16 bg-[#8B5CF6]/20 border border-[#8B5CF6]/50 rounded-[100%] blur-[2px] transform rotate-x-60 pointer-events-none"></div>
          
          <Canvas shadows camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#00E5FF" />
            <pointLight position={[5, -5, 5]} intensity={1} color="#FF4D8D" />
            <Environment preset="city" />
            
            <Suspense fallback={null}>
              <AvatarModel />
              <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#050816" />
            </Suspense>
            
            <OrbitControls 
              enablePan={false} 
              enableZoom={true} 
              minDistance={3}
              maxDistance={12}
              maxPolarAngle={Math.PI / 2 + 0.2} 
              autoRotate 
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </div>

        {/* Viewer Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 z-20 shadow-xl">
           <button className="text-white/60 hover:text-white transition-colors"><RotateCcw className="w-5 h-5"/></button>
           <button className="text-white/60 hover:text-white transition-colors"><Play className="w-5 h-5"/></button>
           <button className="text-white/60 hover:text-white transition-colors"><Maximize2 className="w-5 h-5"/></button>
        </div>

        {/* Stats Overlay */}
        <div className="absolute top-6 left-6 z-20">
           <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg w-48">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Avatar Value</p>
              <h3 className="text-2xl font-bold text-[#FACC15] flex items-center gap-2"><Coins className="w-5 h-5"/> 3,450</h3>
              <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] h-1.5 rounded-full w-3/4"></div>
              </div>
              <p className="text-[10px] text-white/50 mt-2">Level 24 • Rare Tier</p>
           </div>
        </div>
      </div>

      {/* CUSTOMIZATION PANEL (Right Sidebar) */}
      <div className="w-full xl:w-[450px] shrink-0 h-[50vh] xl:h-screen overflow-y-auto hide-scrollbar bg-[#050816]/90 backdrop-blur-3xl border-t xl:border-t-0 xl:border-l border-white/[0.08] flex flex-col z-30">
         
         <div className="p-6 border-b border-white/[0.08] sticky top-0 bg-[#050816]/95 backdrop-blur-xl z-20">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles className="w-5 h-5 text-[#00E5FF]" /> Avatar Studio</h2>
             <button className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"><Settings className="w-5 h-5"/></button>
           </div>
           
           <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
             {categories.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                   activeCategory === cat 
                     ? "bg-white text-[#050816] shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                     : "bg-white/5 text-white/60 hover:text-white border border-white/10 hover:bg-white/10"
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
         </div>

         <div className="p-6 flex-1 overflow-y-auto hide-scrollbar">
            
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider">{activeCategory} Items</h3>
               <button className="text-[10px] text-[#00E5FF] hover:text-[#8B5CF6] font-bold flex items-center gap-1 transition-colors">
                 Open Marketplace <ShoppingBag className="w-3 h-3"/>
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
               {clothingItems.map((item) => (
                 <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group relative overflow-hidden">
                   
                   {/* Rarity Glow */}
                   {item.rarity === 'Legendary' && <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent pointer-events-none"></div>}
                   {item.rarity === 'Epic' && <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent pointer-events-none"></div>}

                   <div className="aspect-square bg-white/5 rounded-xl mb-3 flex items-center justify-center border border-white/5 relative">
                     {/* Placeholder for item thumbnail */}
                     <ShoppingBag className={`w-8 h-8 ${item.rarity === 'Legendary' ? 'text-[#FACC15]' : item.rarity === 'Epic' ? 'text-[#8B5CF6]' : 'text-white/40'}`} />
                     
                     {/* Equiped Indicator */}
                     {item.id === 1 && <div className="absolute top-2 right-2 w-3 h-3 bg-[#00D97E] rounded-full border border-[#050816]"></div>}
                   </div>

                   <h4 className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors">{item.name}</h4>
                   <p className={`text-[10px] font-bold mt-1 ${item.rarity === 'Legendary' ? 'text-[#FACC15]' : item.rarity === 'Epic' ? 'text-[#8B5CF6]' : 'text-white/40'}`}>
                     {item.rarity}
                   </p>
                   
                   <div className="mt-3 flex justify-between items-center">
                     {item.price > 0 ? (
                       <span className="text-xs font-bold text-white flex items-center gap-1"><Coins className="w-3 h-3 text-[#FACC15]"/> {item.price}</span>
                     ) : (
                       <span className="text-[10px] font-bold text-[#00D97E] bg-[#00D97E]/10 px-2 py-0.5 rounded-sm">OWNED</span>
                     )}
                   </div>
                 </div>
               ))}
            </div>

            {/* Premium Upsell Banner */}
            <div className="mt-8 bg-gradient-to-r from-[#8B5CF6]/20 to-[#FF4D8D]/20 border border-[#FF4D8D]/30 rounded-2xl p-5 relative overflow-hidden group cursor-pointer">
              <Sparkles className="absolute -right-2 -bottom-2 w-20 h-20 text-[#FF4D8D]/20 group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                <span className="bg-[#FF4D8D] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase mb-2 inline-block">Pro Pass</span>
                <h4 className="font-bold text-white mb-1">Unlock AI Animations</h4>
                <p className="text-xs text-white/70 mb-3 max-w-[80%]">Generate custom emotes and dances using text prompts.</p>
                <button className="text-[10px] font-bold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">Upgrade <ArrowRight className="w-3 h-3"/></button>
              </div>
            </div>

         </div>
         
         {/* Fixed Save Button */}
         <div className="p-6 border-t border-white/[0.08] bg-[#050816]/95 backdrop-blur-xl">
           <button className="w-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-[#050816] font-bold py-3.5 rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:shadow-[0_0_30px_rgba(0,229,255,0.6)] transition-all">
             Save & Equip Avatar
           </button>
         </div>

      </div>

    </div>
  );
}
