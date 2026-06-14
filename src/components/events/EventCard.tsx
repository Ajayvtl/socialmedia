import React from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Calendar, MapPin, Users } from 'lucide-react';
import { getMediaUrl } from '@/lib/api';
import Link from 'next/link';

export default function EventCard({ event }: { event: any }) {
  return (
    <Link href={`/dapp/events/${event.id}`}>
      <GlassPanel className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer group h-full flex flex-col">
        {event.cover_image ? (
          <div className="w-full h-32 relative overflow-hidden shrink-0">
            <img src={getMediaUrl(event.cover_image)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-surface to-surface-secondary flex items-center justify-center shrink-0">
            <Calendar className="w-8 h-8 text-primary/40 group-hover:text-primary/80 transition-colors" />
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
            <span className="uppercase tracking-wider">{new Date(event.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            {event.visibility === 'PRIVATE' && <span className="bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded text-[10px]">PRIVATE</span>}
          </div>
          <h4 className="font-bold text-foreground text-lg leading-tight mb-2 line-clamp-2">{event.title}</h4>
          
          <div className="mt-auto space-y-1.5 text-xs text-foreground/60">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(event.start_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{event.attendees_count || 0} attending</span>
            </div>
          </div>
        </div>
      </GlassPanel>
    </Link>
  );
}
