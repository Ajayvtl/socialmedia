import React from 'react';
import { Card } from '@/components/ui/Card';
import { MemoryCircle } from '../types/memoryWallet.types';
import { Users, Image as ImageIcon, Calendar, Briefcase, GraduationCap, Heart, Clock } from 'lucide-react';

interface Props {
  circle: MemoryCircle;
  onClick: () => void;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'family': return <Users className="w-5 h-5 text-blue-400" />;
    case 'wedding': return <Heart className="w-5 h-5 text-pink-400" />;
    case 'travel': return <Calendar className="w-5 h-5 text-emerald-400" />;
    case 'college': return <GraduationCap className="w-5 h-5 text-orange-400" />;
    case 'business': return <Briefcase className="w-5 h-5 text-indigo-400" />;
    case 'legacy': return <Clock className="w-5 h-5 text-purple-400" />;
    default: return <ImageIcon className="w-5 h-5 text-gray-400" />;
  }
};

export const MemoryCircleCard: React.FC<Props> = ({ circle, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95 group"
    >
      <div className="p-5 flex flex-col h-full gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-surface-hover)] rounded-xl group-hover:bg-[var(--color-surface-elevated)] transition-colors">
            {getTypeIcon(circle.circle_type)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-1">{circle.name}</h3>
            <span className="text-xs text-[var(--color-text-muted)] capitalize">{circle.circle_type} Circle</span>
          </div>
        </div>
        
        {circle.description && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-auto">
            {circle.description}
          </p>
        )}

        <div className="pt-4 mt-auto border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>{circle.member_count || 1} Members</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{circle.memory_count || 0} Memories</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
