"use client";

import { useState, useEffect } from "react";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { FloatingCard } from "@/components/ui/FloatingCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { Calendar, MapPin, Users, Ticket, Play, Map, Loader2 } from "lucide-react";
import CreateEventModal from "@/components/events/CreateEventModal";
import api, { getMediaUrl } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EventsDiscoveryPage() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, TRENDING, VIRTUAL, IN_PERSON, AUDIO

  const fetchEvents = async (tab = activeTab) => {
    setIsLoading(true);
    try {
      let query = '/events?';
      if (tab === 'TRENDING') query += 'sort=trending';
      else if (tab === 'VIRTUAL') query += 'type=VIRTUAL';
      else if (tab === 'IN_PERSON') query += 'type=IN_PERSON';
      else if (tab === 'AUDIO') query += 'type=AUDIO';
      else query += 'sort=new';

      const res = await api.get(query);
      setEvents(res.data.data);
    } catch (err) {
      console.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(activeTab);
  }, [activeTab]);

  const featuredEvent = (activeTab === 'ALL' || activeTab === 'TRENDING') && events.length > 0 ? events[0] : null;
  const upcomingEvents = featuredEvent ? events.slice(1) : events;

  const TABS = [
    { id: 'ALL', label: 'For You' },
    { id: 'TRENDING', label: 'Trending' },
    { id: 'VIRTUAL', label: 'Virtual 3D' },
    { id: 'IN_PERSON', label: 'In-Person' },
    { id: 'AUDIO', label: 'Audio Spaces' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <AnimatedContainer animation="slideUp" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Event Discovery</h1>
          <p className="text-foreground/60">Find virtual hangouts, audio spaces, and local in-person meetups.</p>
        </div>
        <GlowButton variant="primary" className="shrink-0" onClick={() => setShowCreateModal(true)}>
          <Calendar className="w-4 h-4 mr-2"/> Host Event
        </GlowButton>
      </AnimatedContainer>

      {/* Discovery Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(var(--primary),0.4)]' 
                : 'bg-surface/50 text-foreground/60 hover:text-foreground hover:bg-surface border border-border/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && events.length === 0 ? (
         <div className="h-[40vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
      ) : events.length === 0 ? (
         <GlassPanel className="p-12 text-center flex flex-col items-center justify-center">
            <Calendar className="w-16 h-16 text-foreground/20 mb-4"/>
            <h2 className="text-2xl font-bold text-foreground mb-2">No events found</h2>
            <p className="text-foreground/60 mb-6">There are no upcoming events in this category yet.</p>
            <GlowButton onClick={() => setShowCreateModal(true)} variant="primary">Host One Now</GlowButton>
         </GlassPanel>
      ) : (
        <BentoGrid>
          {/* Featured Event Hero */}
          {featuredEvent && (
            <BentoItem colSpan={4} className="relative overflow-hidden p-8 border-none min-h-[350px] flex items-end cursor-pointer group" onClick={() => router.push(`/dapp/events/${featuredEvent.id}`)}>
              <div className={`absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 opacity-40 mix-blend-screen transition-opacity group-hover:opacity-60`}></div>
              <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${featuredEvent.cover_image ? getMediaUrl(featuredEvent.cover_image) : 'https://images.unsplash.com/photo-1540039155732-680874b37c0d?q=80&w=2000&auto=format&fit=crop'})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
              
              <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                    <Play className="w-3 h-3"/> Featured Event
                  </div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">{featuredEvent.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                    <span className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-md"><Calendar className="w-4 h-4 text-secondary"/> {new Date(featuredEvent.start_time).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-md"><Map className="w-4 h-4 text-warning"/> {featuredEvent.event_type}</span>
                    <span className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur-md"><Users className="w-4 h-4 text-success"/> {featuredEvent.attendees_count} attending</span>
                  </div>
                </div>
                <GlowButton variant="primary" size="lg" className="shrink-0 pointer-events-none"><Ticket className="w-5 h-5 mr-2"/> RSVP Now</GlowButton>
              </div>
            </BentoItem>
          )}

          {/* Regular Grid for Upcoming Events */}
          <BentoItem colSpan={4} className="bg-transparent border-none p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((evt) => (
                <Link key={evt.id} href={`/dapp/events/${evt.id}`}>
                  <FloatingCard glass className="h-full flex flex-col cursor-pointer group hover:border-primary/50 overflow-hidden rounded-3xl">
                    <div className="h-40 relative overflow-hidden bg-surface-secondary">
                      {evt.cover_image ? (
                        <img src={getMediaUrl(evt.cover_image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20"><Calendar className="w-12 h-12"/></div>
                      )}
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary"/> {evt.event_type}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-lg text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">{evt.title}</h4>
                      <p className="text-sm text-foreground/60 line-clamp-2 flex-1 mb-4">{evt.description || "No description provided."}</p>
                      
                      <div className="flex items-center justify-between text-xs font-medium text-foreground/70 mt-auto pt-4 border-t border-border/50">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4"/> {new Date(evt.start_time).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4"/> {evt.attendees_count} going</span>
                      </div>
                    </div>
                  </FloatingCard>
                </Link>
              ))}
            </div>
          </BentoItem>
        </BentoGrid>
      )}

      {showCreateModal && (
        <CreateEventModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}
