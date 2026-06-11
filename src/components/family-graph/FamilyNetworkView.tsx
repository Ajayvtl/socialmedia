import FamilyNode from "./FamilyNode";

export default function FamilyNetworkView({ network }: { network: any }) {
  if (!network || !network.nodes) return null;

  const { nodes, edges } = network;

  const centerNode = nodes.find((n: any) => n.type === 'self') || nodes[0];
  const otherNodes = nodes.filter((n: any) => n.id !== centerNode?.id);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
      
      {/* Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {otherNodes.map((n: any, i: number) => {
          const angle = (i / otherNodes.length) * 2 * Math.PI;
          const x2 = 50 + (Math.cos(angle) * 35) + '%';
          const y2 = 50 + (Math.sin(angle) * 35) + '%';
          
          return (
            <line 
              key={`edge-${i}`}
              x1="50%" y1="50%" 
              x2={x2} y2={y2} 
              stroke={n.type === 'upline' ? 'rgba(139, 92, 246, 0.4)' : n.type === 'downline' ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)'} 
              strokeWidth="2"
              strokeDasharray={n.type === 'connection' ? '4 4' : 'none'}
            />
          );
        })}
      </svg>

      {/* Center */}
      {centerNode && (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <FamilyNode node={centerNode} isRoot={true} />
        </div>
      )}

      {/* Surrounding Nodes */}
      {otherNodes.map((n: any, i: number) => {
        const angle = (i / otherNodes.length) * 2 * Math.PI;
        const left = 50 + (Math.cos(angle) * 35);
        const top = 50 + (Math.sin(angle) * 35);

        return (
          <div 
            key={`node-${i}`} 
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-10"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <FamilyNode node={n} />
          </div>
        );
      })}
    </div>
  );
}
