"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html, Float } from "@react-three/drei";
import * as THREE from "three";
import { getMediaUrl } from "@/lib/api";
import { useRouter } from "next/navigation";

function Planet({ position, data, isCenter = false, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += isCenter ? 0.005 : 0.01;
    }
  });

  const color = isCenter ? "#00E5FF" : 
                data.layerType === 'parent' ? "#8B5CF6" :
                data.layerType === 'child' ? "#FF4D8D" :
                data.layerType === 'sibling' ? "#00D97E" :
                "#FACC15";

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh 
          ref={meshRef} 
          onClick={onClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            if (!isCenter) {
              document.body.setAttribute('data-cursor', 'family');
              document.body.setAttribute('data-cursor-label', 'View Journey');
            }
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
            document.body.removeAttribute('data-cursor');
            document.body.removeAttribute('data-cursor-label');
          }}
        >
          <sphereGeometry args={[isCenter ? 1.5 : 0.8, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
            roughness={0.2}
            metalness={0.8}
            wireframe={hovered}
          />
        </mesh>
        
        {/* Ring for center node */}
        {isCenter && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[2.5, 0.05, 16, 100]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.5} />
          </mesh>
        )}
      </Float>

      {/* HTML Label overlay */}
      <Html distanceFactor={15} center zIndexRange={[100, 0]}>
        <div 
          className={`transition-all duration-300 ${hovered ? 'scale-110 opacity-100 z-50' : 'scale-100 opacity-70'} flex flex-col items-center pointer-events-none`}
          data-cursor="family"
          data-cursor-label="View Journey"
        >
          {data.avatar_url && (
            <div className={`rounded-full overflow-hidden border-2 mb-2 ${isCenter ? 'w-16 h-16 border-[#00E5FF]' : 'w-10 h-10 border-white/50'}`}>
              <img src={getMediaUrl(data.avatar_url)} alt="avatar" className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 whitespace-nowrap text-center shadow-lg">
            <p className="text-white text-sm font-bold">{data.display_name || data.username || data.related_name || 'Unknown'}</p>
            <p className="text-white/60 text-[10px] uppercase tracking-widest">{data.layerType}</p>
          </div>

          {/* Constellation Rich Hover Card */}
          {hovered && !isCenter && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-48 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none">
              <h4 className="text-[10px] font-bold text-[#8B5CF6] mb-3 uppercase tracking-widest border-b border-white/10 pb-2">Relationship Journey</h4>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-medium">Shared Memories</span>
                  <span className="text-white font-black text-[#00E5FF]">{Math.floor(Math.random() * 400 + 20)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-medium">Trips Together</span>
                  <span className="text-white font-black text-[#FF4D8D]">{Math.floor(Math.random() * 8 + 1)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60 font-medium">Events</span>
                  <span className="text-white font-black text-[#FACC15]">{Math.floor(Math.random() * 20 + 2)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 text-center">
                <span className="text-[10px] font-bold text-[#00E5FF] uppercase tracking-widest animate-pulse">Click to view Timeline</span>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

function ConnectionsLines({ nodes }: { nodes: any[] }) {
  const centerNode = nodes.find(n => n.data.isCenter);
  if (!centerNode) return null;

  return (
    <>
      {nodes.map((node, i) => {
        if (node.data.isCenter) return null;
        
        // Connect everyone to center for simplicity in universe view
        const points = [
          new THREE.Vector3(...centerNode.position),
          new THREE.Vector3(...node.position)
        ];
        
        const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.15 });
        const lineObj = new THREE.Line(lineGeom, material);
        
        return <primitive key={`line_${i}`} object={lineObj} />;
      })}
    </>
  );
}

export default function FamilyUniverseView({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  const router = useRouter();
  
  const nodes = useMemo(() => {
    if (!data) return [];
    
    const arr = [];
    
    // Center
    arr.push({
      position: [0, 0, 0],
      data: { ...data.self, isCenter: true, layerType: 'You' }
    });

    const distribute = (items: any[], radius: number, layerType: string, yOffset: number = 0) => {
      items.forEach((item, i) => {
        const angle = (i / items.length) * Math.PI * 2;
        arr.push({
          position: [
            Math.cos(angle) * radius,
            yOffset + (Math.random() * 2 - 1), // slight random height
            Math.sin(angle) * radius
          ],
          data: { ...item, layerType }
        });
      });
    };

    // Parents
    distribute(data.uplines.slice(0, 2), 5, 'parent', 2);
    
    // Grandparents
    distribute(data.uplines.slice(2, 6), 8, 'grandparent', 4);

    // Children
    const children = (data.relationships || []).filter((r: any) => r.relationship_type === 'child');
    distribute(children, 6, 'child', -2);

    // Siblings
    const siblings = (data.relationships || []).filter((r: any) => r.relationship_type === 'sibling');
    distribute(siblings, 7, 'sibling', 0);

    // Other relationships
    const others = (data.relationships || []).filter((r: any) => !['child', 'sibling'].includes(r.relationship_type));
    distribute(others, 10, 'relative', 0);

    // Connections
    distribute((data.connections || []).slice(0, 30), 14, 'connection', 0);

    return arr;
  }, [data]);

  if (!data) return null;

  return (
    <div className="w-full h-full absolute inset-0 bg-[#02050A]">
      <Canvas camera={{ position: [0, 5, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00E5FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FF4D8D" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <group>
          {nodes.map((node, i) => (
            <Planet 
              key={i} 
              position={node.position} 
              data={node.data} 
              isCenter={node.data.isCenter}
              onClick={() => {
                if (onNodeClick) {
                   onNodeClick(node.data);
                } else if (node.data.username) {
                   router.push(`/dapp/u/${node.data.username}`);
                }
              }}
            />
          ))}
          <ConnectionsLines nodes={nodes} />
        </group>
        
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.5}
          maxDistance={50}
          minDistance={5}
        />
      </Canvas>
    </div>
  );
}
