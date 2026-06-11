"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Send, X, Loader2, Check, UserPlus, Clock, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

type ProfileActionsProps = {
  targetUsername: string;
};

export default function ProfileActions({ targetUsername }: ProfileActionsProps) {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [targetId, setTargetId] = useState<number | null>(null);
  const [connStatus, setConnStatus] = useState<string | null>(null);
  const [isRequester, setIsRequester] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get(`/social-profile/u/${targetUsername}`);
        const data = res.data?.data;
        if (data) {
          setTargetId(data.user_id || data.id);
          setConnStatus(data.connection_status || 'none');
          setIsRequester(data.is_requester || false);
        }
      } catch (err) {
        console.error("Failed to fetch target profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, [targetUsername]);

  const handleConnect = async () => {
    if (!targetId) return;
    try {
      await api.post(`/connections/request/${targetId}`);
      toast.success("Connection request sent");
      setConnStatus('pending');
      setIsRequester(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const handleAccept = async () => {
    if (!targetId) return;
    try {
      await api.post(`/connections/accept/${targetId}`);
      toast.success("Connection accepted");
      setConnStatus('accepted');
    } catch (err) {
      toast.error("Failed to accept");
    }
  };

  const handleDecline = async () => {
    if (!targetId) return;
    try {
      await api.delete(`/connections/${targetId}`);
      toast.success("Connection request declined");
      setConnStatus('none');
    } catch (err) {
      toast.error("Failed to decline");
    }
  };

  const handleOpenChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to send messages.");
      return;
    }
    setShowChat(true);
    setIsConnecting(true);

    if (!targetId) {
       toast.error("Could not find user.");
       setIsConnecting(false);
       setShowChat(false);
       return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    newSocket.on("connect", () => {
      setIsConnecting(false);
    });

    newSocket.on("connect_error", () => {
      setIsConnecting(false);
      toast.error("Failed to connect to chat server");
    });

    newSocket.on("receive_message", (msg) => {
      if (msg.sender_id === targetId) {
        toast.success(`New message from ${targetUsername}: ${msg.content.substring(0, 30)}...`);
      } else {
        toast.success("Message sent!");
        setShowChat(false);
        setMessage("");
      }
    });

    setSocket(newSocket);
  };

  const closeChat = () => {
    setShowChat(false);
    if (socket) socket.disconnect();
  };

  const sendMessage = () => {
    if (!message.trim() || !socket || !targetId) return;
    
    socket.emit("send_message", {
      receiverId: targetId,
      content: message
    });
  };

  if (isLoading) {
    return <div className="flex gap-3 shrink-0 mb-2 animate-pulse"><div className="w-24 h-12 bg-white/10 rounded-xl"></div></div>;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 shrink-0 mb-2">
         {connStatus === 'none' && (
           <button onClick={handleConnect} className="px-6 py-3 bg-[#00E5FF] text-black font-bold rounded-xl hover:bg-[#00E5FF]/90 transition shadow-[0_0_15px_rgba(0,229,255,0.3)] flex items-center gap-2">
             <UserPlus className="w-5 h-5"/> Connect
           </button>
         )}
         
         {connStatus === 'pending' && isRequester && (
           <button disabled className="px-6 py-3 bg-white/10 text-white/50 font-bold rounded-xl flex items-center gap-2 cursor-not-allowed border border-white/5">
             <Clock className="w-5 h-5"/> Pending Request
           </button>
         )}

         {connStatus === 'pending' && !isRequester && (
           <>
             <button onClick={handleAccept} className="px-6 py-3 bg-[#00D97E] text-black font-bold rounded-xl hover:bg-[#00D97E]/90 transition shadow-[0_0_15px_rgba(0,217,126,0.3)] flex items-center gap-2">
               <Check className="w-5 h-5"/> Accept
             </button>
             <button onClick={handleDecline} className="px-6 py-3 bg-white/5 border border-white/10 text-white/70 font-bold rounded-xl hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition flex items-center gap-2">
               <X className="w-5 h-5"/> Decline
             </button>
           </>
         )}

         {connStatus === 'accepted' && (
           <>
             <button className="px-6 py-3 bg-white/5 border border-white/10 text-[#00E5FF] font-bold rounded-xl cursor-default flex items-center gap-2">
               <UserCheck className="w-5 h-5"/> Connected
             </button>
             <button 
               onClick={handleOpenChat}
               className="px-6 py-3 bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6] text-white font-bold rounded-xl hover:opacity-90 transition shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center gap-2"
             >
               <Send className="w-4 h-4"/> Message
             </button>
           </>
         )}
      </div>

      {showChat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#050816] rounded-3xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white">Message @{targetUsername}</h3>
              <button onClick={closeChat} className="text-white/50 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              {isConnecting ? (
                <div className="flex items-center justify-center p-8 gap-3 text-[#00E5FF]">
                   <Loader2 className="w-6 h-6 animate-spin" />
                   <span className="font-medium">Connecting...</span>
                </div>
              ) : (
                <>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Write a message to ${targetUsername}...`}
                    className="w-full h-32 bg-[#0B0F19] border border-white/10 rounded-xl p-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#00E5FF] resize-none"
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    className="w-full py-3 bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-white font-bold rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
