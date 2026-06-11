"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2, Ticket, CheckCircle, Video, Play, MessageCircle } from "lucide-react";
import api, { getMediaUrl } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRsvping, setIsRsvping] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data.data);
      } catch (err) {
        toast.error("Failed to load event");
        router.push("/dapp/events");
      } finally {
        setIsLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId, router]);

  const handleRSVP = async (status: string) => {
    setIsRsvping(true);
    try {
      await api.post(`/events/${eventId}/rsvp`, { status });
      toast.success(status === 'NOT_GOING' ? "RSVP Cancelled" : "RSVP Confirmed!");
      setEvent((prev: any) => ({ ...prev, myRsvp: status }));
    } catch (err) {
      toast.error("Failed to update RSVP");
    } finally {
      setIsRsvping(false);
    }
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!event) return null;

  const coverImageUrl = event.cover_image ? getMediaUrl(event.cover_image) : 'https://images.unsplash.com/photo-1540039155732-680874b37c0d?q=80&w=2000&auto=format&fit=crop';
  const startDate = new Date(event.start_time);
  const month = startDate.toLocaleString('en-US', { month: 'short' });
  const day = startDate.getDate();
  const time = startDate.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
      
      {/* Mobile Back Button */}
      <button onClick={() => router.back()} className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center border border-border/50 text-foreground shadow-lg">
        <ArrowLeft className="w-5 h-5"/>
      </button>

      {/* Hero Section (Luma-Style) */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background z-10"></div>
        <img src={coverImageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        
        {/* Blurred Background effect */}
        <div className="absolute inset-0 scale-110 blur-3xl opacity-30 z-0">
           <img src={coverImageUrl} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content Container */}
      <AnimatedContainer animation="slideUp" className="max-w-4xl mx-auto px-4 md:px-8 -mt-24 relative z-20">
        <GlassPanel intensity="heavy" className="p-6 md:p-10 border-border/50 shadow-2xl rounded-[32px] md:rounded-[40px] flex flex-col md:flex-row gap-8">
          
          {/* Left Column (Main Info) */}
          <div className="flex-1 space-y-6">
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                {event.event_type}
              </span>
              {event.ticket_price > 0 && (
                <span className="px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Ticket className="w-3 h-3"/> {event.ticket_price} {event.currency}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
              {event.title}
            </h1>

            {/* Host info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-secondary border border-border overflow-hidden">
                {event.host_avatar ? (
                   <img src={getMediaUrl(event.host_avatar)} className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center font-bold bg-gradient-to-tr from-primary to-secondary text-white">{event.host_name?.[0]?.toUpperCase()}</div>
                )}
              </div>
              <div>
                <p className="text-xs text-foreground/50 font-medium">Hosted by</p>
                <p className="text-sm font-bold text-foreground">{event.host_name}</p>
              </div>
            </div>

          </div>

          {/* Right Column (Date/Location Card) */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
             <div className="p-4 rounded-3xl bg-surface/50 border border-border/50 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-background/80 flex flex-col items-center justify-center border border-border shadow-sm shrink-0">
                  <span className="text-xs font-bold text-primary uppercase">{month}</span>
                  <span className="text-xl font-black text-foreground">{day}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{event.start_time ? new Date(event.start_time).toLocaleDateString('en-US', { weekday: 'long' }) : 'TBA'}</h3>
                  <p className="text-sm text-foreground/60">{time} {event.timezone}</p>
                </div>
             </div>

             <div className="p-4 rounded-3xl bg-surface/50 border border-border/50 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-background/80 flex flex-col items-center justify-center border border-border shadow-sm shrink-0">
                  {event.event_type === 'VIRTUAL' || event.event_type === 'AUDIO' ? <Video className="w-6 h-6 text-secondary"/> : <MapPin className="w-6 h-6 text-secondary"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">{event.event_type === 'VIRTUAL' || event.event_type === 'AUDIO' ? 'Online Event' : 'Location'}</h3>
                  <p className="text-sm text-foreground/60 truncate">{event.location || 'Link available upon RSVP'}</p>
                </div>
             </div>
          </div>

        </GlassPanel>

        {/* Bottom Split Section */}
        <div className="mt-8 flex flex-col md:flex-row gap-8">
           
           {/* Left: About & Discussion */}
           <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">About Event</h2>
                <div className="text-foreground/80 leading-relaxed space-y-4 whitespace-pre-wrap">
                  {event.description || "No description provided by the host."}
                </div>
              </div>
           </div>

           {/* Right: Attendees & Actions */}
           <div className="w-full md:w-80 shrink-0 space-y-6">
              
              {/* Attendees Facepile */}
              <GlassPanel className="p-5 rounded-[24px]">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-foreground flex items-center gap-2"><Users className="w-4 h-4"/> Attendees</h3>
                   <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{event.attendees_count} Going</span>
                 </div>
                 
                 {event.attendees && event.attendees.length > 0 ? (
                   <div className="flex -space-x-3 overflow-hidden p-2">
                     {event.attendees.map((att: any, i: number) => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-surface overflow-hidden shrink-0">
                         {att.avatar ? <img src={getMediaUrl(att.avatar)} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gradient-to-tr from-primary/50 to-secondary/50 flex items-center justify-center text-xs font-bold">{att.name[0]}</div>}
                       </div>
                     ))}
                     {event.attendees_count > event.attendees.length && (
                       <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-secondary flex items-center justify-center text-[10px] font-bold text-foreground/60 shrink-0">
                         +{event.attendees_count - event.attendees.length}
                       </div>
                     )}
                   </div>
                 ) : (
                   <p className="text-sm text-foreground/50">Be the first to RSVP!</p>
                 )}
              </GlassPanel>

              {/* Share Card */}
              <GlassPanel className="p-5 rounded-[24px]">
                 <h3 className="font-bold text-foreground mb-3 text-sm">Spread the word</h3>
                 <div className="flex gap-2">
                    <button className="flex-1 p-2 rounded-xl bg-surface hover:bg-surface-secondary border border-border/50 flex items-center justify-center gap-2 transition-colors text-sm font-bold text-foreground/80">
                      <Share2 className="w-4 h-4"/> Share
                    </button>
                    <button className="flex-1 p-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary flex items-center justify-center gap-2 transition-colors text-sm font-bold">
                      <Users className="w-4 h-4"/> Invite
                    </button>
                 </div>
              </GlassPanel>

              {/* Desktop Action Sticky */}
              <div className="hidden md:block sticky top-24 pt-4">
                 {event.myRsvp === 'GOING' ? (
                   <div className="space-y-3">
                     <div className="p-4 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center gap-2 text-success font-bold">
                        <CheckCircle className="w-5 h-5"/> You're Going
                     </div>
                     <button className="w-full p-3 rounded-2xl bg-surface border border-border/50 text-foreground/60 font-bold hover:bg-surface-secondary hover:text-foreground transition-colors flex items-center justify-center gap-2">
                       <MessageCircle className="w-4 h-4"/> Join Event Chat
                     </button>
                     <button onClick={() => handleRSVP('NOT_GOING')} className="w-full py-2 text-xs text-foreground/40 hover:text-danger font-medium transition-colors">
                       Cancel RSVP
                     </button>
                   </div>
                 ) : (
                   <GlowButton onClick={() => handleRSVP('GOING')} variant="primary" size="lg" className="w-full text-lg shadow-xl shadow-primary/20" disabled={isRsvping}>
                     {isRsvping ? 'Processing...' : 'RSVP Now'}
                   </GlowButton>
                 )}
              </div>

           </div>
        </div>
      </AnimatedContainer>

      {/* Mobile Floating RSVP Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 p-4 pb-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-xl border-t border-border/50">
        {event.myRsvp === 'GOING' ? (
          <div className="flex gap-2">
            <button onClick={() => toast("Chat opening soon!")} className="flex-1 p-3 rounded-2xl bg-surface border border-border/50 text-foreground font-bold flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5"/> Chat
            </button>
            <div className="flex-1 p-3 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center gap-2 text-success font-bold">
              <CheckCircle className="w-5 h-5"/> Going
            </div>
          </div>
        ) : (
          <GlowButton onClick={() => handleRSVP('GOING')} variant="primary" size="lg" className="w-full shadow-xl shadow-primary/20" disabled={isRsvping}>
            {isRsvping ? 'Processing...' : 'RSVP Now'}
          </GlowButton>
        )}
      </div>

    </div>
  );
}
