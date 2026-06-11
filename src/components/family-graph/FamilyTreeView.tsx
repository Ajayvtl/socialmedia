"use client";

import { useMemo, useCallback, useEffect } from "react";
import { 
  ReactFlow, 
  Controls, 
  Background, 
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { getMediaUrl } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef } from "react";

const TreeEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 3, strokeLinecap: 'round' }} />
      {/* The Leaf Visual */}
      <g transform={`translate(${labelX}, ${labelY}) scale(0.8)`} className="animate-[pulse_4s_ease-in-out_infinite]">
        <path 
          d="M0,0 C10,-20 30,-20 40,0 C30,20 10,20 0,0 Z" 
          fill="#4ADE80" 
          opacity="0.9"
          transform="rotate(-30) translate(-20, -10)"
          filter="drop-shadow(0px 0px 5px rgba(74,222,128,0.6))"
        />
        <path 
          d="M0,0 C10,-20 30,-20 40,0 C30,20 10,20 0,0 Z" 
          fill="#22C55E" 
          opacity="0.7"
          transform="rotate(15) translate(-10, 5)"
        />
      </g>
    </>
  );
};

const CustomNode = ({ data }: any) => {
  const router = useRouter();
  const layerTypeLower = data.layerType?.toLowerCase() || '';
  const isTopLevel = data.isCenter || ['father', 'mother', 'parent'].includes(layerTypeLower);
  
  let ringColors = "from-[#00E5FF] to-[#FF4D8D]";
  let glowClass = "shadow-[0_0_30px_rgba(0,229,255,0.6)]";
  
  if (!data.isCenter) {
    if (['father', 'mother', 'parent'].includes(layerTypeLower)) {
      ringColors = "from-[#2DD4BF] to-[#0D9488]";
      glowClass = "shadow-[0_0_20px_rgba(45,212,191,0.5)]";
    } else if (['brother', 'sister', 'sibling'].includes(layerTypeLower)) {
      ringColors = "from-[#3B82F6] to-[#1D4ED8]";
      glowClass = "shadow-[0_0_20px_rgba(59,130,246,0.5)]";
    } else if (['son', 'daughter', 'child'].includes(layerTypeLower)) {
      ringColors = "from-[#A855F7] to-[#7E22CE]";
      glowClass = "shadow-[0_0_20px_rgba(168,85,247,0.5)]";
    } else {
      ringColors = "from-[#F97316] to-[#C2410C]";
      glowClass = "shadow-[0_0_20px_rgba(249,115,22,0.5)]";
    }
  }

  return (
    <div className={`relative flex flex-col items-center justify-center p-2 ${isTopLevel ? 'z-50' : 'z-10'}`}>
      
      <div className={`
        relative group cursor-pointer
        ${data.isCenter ? 'w-[140px] h-[140px]' : 'w-[110px] h-[110px]'}
        rounded-full p-[3px] bg-gradient-to-br ${ringColors} ${glowClass}
        transition-transform duration-300 hover:scale-105
      `}
      onClick={() => {
        if (data.onNodeClick) {
          data.onNodeClick(data);
        } else if (data.username) {
          router.push(`/dapp/u/${data.username}`);
        }
      }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#050816] bg-[#050816]">
          {data.avatar_url ? (
            <img src={getMediaUrl(data.avatar_url)} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white ${data.isCenter ? 'text-4xl' : 'text-2xl'}`}>
              {(data.display_name || data.username || data.related_name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center pointer-events-none">
        <h3 className="text-white font-bold text-lg md:text-xl whitespace-nowrap drop-shadow-lg tracking-wide">
          {data.display_name || data.username || data.related_name}
        </h3>
        
        {data.isCenter ? (
          <div className="mt-1.5 bg-[#8B5CF6] text-white text-[11px] font-bold uppercase tracking-widest px-5 py-1 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.8)] border border-white/20">
            You
          </div>
        ) : (
          <p className="text-white/60 text-sm mt-0.5 tracking-wider font-medium">
            {data.layerType}
          </p>
        )}
      </div>

      {/* Hidden Handles for React Flow Edge Connections */}
      <Handle type="target" position={Position.Top} className="opacity-0 w-1 h-1 pointer-events-none" />
      <Handle type="source" position={Position.Bottom} className="opacity-0 w-1 h-1 pointer-events-none" />
      <Handle type="target" position={Position.Bottom} className="opacity-0 w-1 h-1 pointer-events-none" />
      <Handle type="source" position={Position.Top} className="opacity-0 w-1 h-1 pointer-events-none" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};
const edgeTypes = {
  tree: TreeEdge,
};

function AutoFitView({ nodes }: { nodes: any[] }) {
  const { fitView } = useReactFlow();
  
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.3, duration: 800 });
      }, 100);
    }
  }, [nodes, fitView]);

  return null;
}

function AnimatedStars() {
  const ref = useRef<any>(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1.5} />
    </group>
  );
}

export default function FamilyTreeView({ data, onNodeClick }: { data: any, onNodeClick?: (node: any) => void }) {
  
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!data) return { initialNodes: [], initialEdges: [] };

    const nodes: any[] = [];
    const edges: any[] = [];
    
    // Center Node (You)
    nodes.push({
      id: `self_${data.self.id}`,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { ...data.self, isCenter: true, layerType: 'You', onNodeClick }
    });

    const HORIZONTAL_SPACING = 250;
    const VERTICAL_SPACING = 250;

    // Parents - Check relationships first, then fallback to uplines
    const relationParents = (data.relationships || []).filter((r: any) => 
      ['father', 'mother', 'parent'].includes(r.relationship_type?.toLowerCase())
    );
    const parents = relationParents.length > 0 ? relationParents.slice(0, 2) : (data.uplines || []).slice(0, 2);
    
    parents.forEach((u: any, i: number) => {
      const id = `upline_${u.id}`;
      // Center if only 1 parent, else space them
      const xOffset = parents.length === 1 ? 0 : (i === 0 ? -HORIZONTAL_SPACING : HORIZONTAL_SPACING);
      
      nodes.push({
        id,
        type: 'custom',
        position: { x: xOffset, y: -VERTICAL_SPACING },
        data: { ...u, isUpline: true, layerType: u.relationship_type ? (u.relationship_type.charAt(0).toUpperCase() + u.relationship_type.slice(1)) : 'Parent', onNodeClick }
      });
      edges.push({
        id: `e_${id}_self`,
        source: id,
        sourceHandle: null,
        target: `self_${data.self.id}`,
        targetHandle: null,
        type: 'tree',
        animated: true,
        style: { stroke: 'url(#edge-gradient-parent)', strokeWidth: 4, filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.6))' },
      });
    });

    // Grandparents - Top Top
    const grandparents = data.uplines.slice(2, 6);
    grandparents.forEach((u: any, i: number) => {
      const id = `upline_${u.id}`;
      const parentIndex = i < 2 ? 0 : 1;
      const parentId = parents[parentIndex] ? `upline_${parents[parentIndex].id}` : null;
      
      const parentX = parents.length === 1 ? 0 : (parentIndex === 0 ? -HORIZONTAL_SPACING : HORIZONTAL_SPACING);
      const gpXOffset = parentX + (i % 2 === 0 ? -HORIZONTAL_SPACING/1.5 : HORIZONTAL_SPACING/1.5);

      nodes.push({
        id,
        type: 'custom',
        position: { x: gpXOffset, y: -VERTICAL_SPACING * 2 },
        data: { ...u, isUpline: true, layerType: 'Grandparent', onNodeClick }
      });
      if (parentId) {
        edges.push({
          id: `e_${id}_${parentId}`,
          source: id,
          target: parentId,
          type: 'tree',
          animated: true,
          style: { stroke: 'url(#edge-gradient-parent)', strokeWidth: 3, opacity: 0.5 },
        });
      }
    });

    // Downlines / Children - Bottom
    const children = (data.relationships || []).filter((r: any) => 
      ['child', 'son', 'daughter'].includes(r.relationship_type?.toLowerCase())
    );
    children.forEach((c: any, i: number) => {
      const id = `rel_${c.id}`;
      // Distribute evenly
      const xOffset = children.length === 1 ? 0 : (i - (children.length - 1) / 2) * HORIZONTAL_SPACING;
      nodes.push({
        id,
        type: 'custom',
        position: { x: xOffset, y: VERTICAL_SPACING },
        data: { ...c, layerType: c.relationship_type ? (c.relationship_type.charAt(0).toUpperCase() + c.relationship_type.slice(1)) : 'Child', onNodeClick }
      });
      edges.push({
        id: `e_self_${id}`,
        source: `self_${data.self.id}`,
        target: id,
        type: 'tree',
        animated: true,
        style: { stroke: 'url(#edge-gradient-child)', strokeWidth: 4, filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.6))' },
      });
    });

    // Siblings - Sides
    const siblings = (data.relationships || []).filter((r: any) => 
      ['sibling', 'brother', 'sister'].includes(r.relationship_type?.toLowerCase())
    );
    siblings.forEach((s: any, i: number) => {
      const id = `rel_${s.id}`;
      const sideMultiplier = i % 2 === 0 ? -1 : 1;
      const step = Math.floor(i / 2) + 1;
      
      nodes.push({
        id,
        type: 'custom',
        position: { x: sideMultiplier * (HORIZONTAL_SPACING * 1.5 * step), y: 0 },
        data: { ...s, layerType: s.relationship_type ? (s.relationship_type.charAt(0).toUpperCase() + s.relationship_type.slice(1)) : 'Sibling', onNodeClick }
      });
      // Link to parents if exist, else self
      if (parents.length > 0) {
        edges.push({
          id: `e_upline_${parents[0].id}_${id}`,
          source: `upline_${parents[0].id}`,
          target: id,
          type: 'tree',
          style: { stroke: 'url(#edge-gradient-sibling)', strokeWidth: 3, opacity: 0.6 },
        });
      } else {
        edges.push({
          id: `e_self_${id}`,
          source: `self_${data.self.id}`,
          target: id,
          type: 'tree',
          style: { stroke: 'url(#edge-gradient-sibling)', strokeWidth: 3, strokeDasharray: '5,5', opacity: 0.6 },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!data) return null;

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      {/* 3D Stars Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <AnimatedStars />
        </Canvas>
      </div>

      {/* Organic Tree Background (Neon Roots) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-[120vw] h-[120vw] max-w-[1200px] max-h-[1200px] bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_transparent_70%)] animate-[pulse_6s_ease-in-out_infinite]"></div>
      </div>

      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.2}
          maxZoom={2}
          className="bg-transparent z-10"
        >
          <AutoFitView nodes={nodes} />
          <svg style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0 }}>
            <defs>
              <linearGradient id="edge-gradient-parent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2DD4BF" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
              <linearGradient id="edge-gradient-child" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#7E22CE" />
              </linearGradient>
              <linearGradient id="edge-gradient-sibling" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
          </svg>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
