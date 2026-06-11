"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { ArrowLeft, Send, Loader2, Info } from "lucide-react";
import api, { getMediaUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import io, { Socket } from "socket.io-client";

export default function EventChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Fetch event metadata to ensure we have access and for header
        const eventRes = await api.get(`/events/${eventId}`);
        setEvent(eventRes.data.data);

        // Fetch chat history
        const chatRes = await api.get(`/events/${eventId}/chat`);
        setMessages(chatRes.data.data);

        // Initialize Socket
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
        
        socketRef.current = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
          socketRef.current?.emit("join_event_room", eventId);
        });

        socketRef.current.on("event_message_received", (newMsg) => {
          setMessages((prev) => [...prev, newMsg]);
          scrollToBottom();
        });

        socketRef.current.on("event_message_error", (err) => {
          toast.error(err.message || "Failed to send message");
        });

        setIsLoading(false);
        setTimeout(scrollToBottom, 100);

      } catch (err) {
        toast.error("Failed to load chat room");
        router.push(`/dapp/events/${eventId}`);
      }
    };

    if (eventId) initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [eventId, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;

    if (event?.myRsvp !== 'GOING') {
      toast.error("You must RSVP 'Going' to chat!");
      return;
    }

    socketRef.current.emit("send_event_message", {
      eventId,
      content: input.trim()
    });
    
    setInput("");
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>;
  }

  return (
    <div className="h-[100dvh] md:h-[calc(100vh-8rem)] flex flex-col max-w-4xl mx-auto md:p-4">
      <GlassPanel className="flex-1 flex flex-col overflow-hidden rounded-none md:rounded-3xl border-x-0 md:border-x border-border/50 bg-background/95 md:bg-surface/50 p-0 md:p-0">
        
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-surface/80 backdrop-blur-md flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => router.push(`/dapp/events/${eventId}`)} className="p-2 -ml-2 rounded-full hover:bg-surface-secondary text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5"/>
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-surface-secondary">
               {event?.cover_image ? <img src={getMediaUrl(event.cover_image)} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-primary/20"></div>}
             </div>
             <div>
               <h2 className="font-bold text-foreground truncate">{event?.title}</h2>
               <p className="text-xs text-foreground/60 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success"></span> Live Chat</p>
             </div>
          </div>
          <button onClick={() => router.push(`/dapp/events/${eventId}`)} className="p-2 rounded-full hover:bg-surface-secondary text-foreground/60 hover:text-foreground transition-colors hidden sm:block">
            <Info className="w-5 h-5"/>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-foreground/40 space-y-2">
              <p className="font-bold text-lg">Welcome to the Event Chat!</p>
              <p className="text-sm">Say hello to the other attendees.</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === user?.id;
              const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

              return (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="w-8 shrink-0 flex flex-col justify-end">
                     {showAvatar && !isMe && (
                       <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-secondary border border-border">
                         {msg.sender_avatar ? <img src={getMediaUrl(msg.sender_avatar)} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-primary/20">{msg.sender_name?.[0]}</div>}
                       </div>
                     )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {showAvatar && !isMe && <span className="text-xs text-foreground/50 ml-1 mb-1 font-medium">{msg.sender_name}</span>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-secondary border border-border/50 text-foreground rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {event?.myRsvp === 'GOING' ? (
          <form onSubmit={handleSend} className="p-3 border-t border-border/50 bg-surface/80 backdrop-blur-md flex items-end gap-2 shrink-0">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Message the event..."
              className="flex-1 bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary resize-none max-h-32 min-h-[44px] custom-scrollbar"
              rows={1}
            />
            <GlowButton type="submit" variant="primary" className="h-[44px] w-[44px] rounded-2xl p-0 flex items-center justify-center shrink-0" disabled={!input.trim()}>
              <Send className="w-4 h-4"/>
            </GlowButton>
          </form>
        ) : (
          <div className="p-4 border-t border-border/50 bg-surface/80 backdrop-blur-md text-center">
            <p className="text-sm text-foreground/60 mb-2">You must RSVP 'Going' to participate in the chat.</p>
            <GlowButton variant="primary" size="sm" onClick={() => router.push(`/dapp/events/${eventId}`)}>View Event details</GlowButton>
          </div>
        )}

      </GlassPanel>
    </div>
  );
}
