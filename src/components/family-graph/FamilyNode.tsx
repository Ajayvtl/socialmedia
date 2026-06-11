import { User } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

const getGradient = (name: string) => {
  const gradients = [
    "from-[#00E5FF] to-[#8B5CF6]", 
    "from-[#FF4D8D] to-[#8B5CF6]", 
    "from-[#FACC15] to-[#FF4D8D]", 
    "from-[#00D97E] to-[#00E5FF]"
  ];
  return gradients[(name || "U").length % gradients.length];
};

export default function FamilyNode({ node, onClick, isRoot = false }: any) {
  return (
    <div 
      onClick={() => onClick && onClick(node)}
      className={`relative flex flex-col items-center group cursor-pointer ${isRoot ? 'scale-125 z-10' : 'hover:scale-110'} transition-transform duration-300`}
    >
      <div className={`p-1 rounded-full bg-gradient-to-br ${isRoot ? 'from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D]' : 'from-white/20 to-white/5'} shadow-[0_0_20px_rgba(0,0,0,0.3)]`}>
        <div className="bg-[#050816] rounded-full p-[2px]">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center bg-[#0b0e11]">
            {node.avatar_url ? (
              <img src={getMediaUrl(node.avatar_url)} alt={node.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getGradient(node.display_name || node.username)} flex items-center justify-center font-bold text-white text-xl`}>
                {(node.display_name || node.username || "U")[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 text-center bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 group-hover:border-[#00E5FF]/50 transition-colors">
        <p className="text-sm font-bold text-white truncate max-w-[100px]">{node.display_name || node.username}</p>
        <p className="text-[10px] text-white/50 capitalize">{node.type || 'Connection'}</p>
      </div>
    </div>
  );
}
