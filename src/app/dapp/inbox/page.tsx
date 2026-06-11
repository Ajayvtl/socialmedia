"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Send, Search, Info, Image as ImageIcon, Smile, MoreVertical, Loader2, ArrowLeft, Check, CheckCheck, Settings, FileBox } from "lucide-react";
import { io, Socket } from "socket.io-client";
import api, { getMediaUrl } from "@/lib/api";
import toast from "react-hot-toast";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'UUz4xjDhZRZXP86KctgPA89X4r0XZJcC');

export default function InboxPage() {
  const [activeChat, setActiveChat] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [msgMenuOpen, setMsgMenuOpen] = useState<number | null>(null);
  const [msgPrivacy, setMsgPrivacy] = useState<'everyone' | 'contacts'>('everyone');
  const [privacyMenuOpen, setPrivacyMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState("");

  const fetchGifs = useCallback((offset: number) => {
    return gifSearchTerm 
      ? gf.search(gifSearchTerm, { offset, limit: 10 }) 
      : gf.trending({ offset, limit: 10 });
  }, [gifSearchTerm]);

  useEffect(() => {
    const init = async () => {
      try {
        const [contactsRes, userRes, privacyRes] = await Promise.all([
          api.get('/messages/contacts'),
          api.get('/user/me'),
          api.get('/messages/privacy').catch(() => ({ data: { message_privacy: 'everyone' } }))
        ]);
        
        let loadedContacts = contactsRes.data.data || [];
        setContacts(loadedContacts);
        setMsgPrivacy(privacyRes.data?.message_privacy || 'everyone');
        
        if (userRes.data?.auth?.sub) {
          setMyUserId(Number(userRes.data.auth.sub));
        }

        const queryParams = new URLSearchParams(window.location.search);
        const userParam = queryParams.get('user');
        const nameParam = queryParams.get('name');
        const avatarParam = queryParams.get('avatar');

        if (userParam && nameParam) {
          const targetUserId = Number(userParam);
          const contactName = nameParam;
          const contactImg = avatarParam || "";
          
          const existing = loadedContacts.find((c: any) => c.id === targetUserId);
          if (existing) {
            setActiveChat(existing);
          } else {
            const newContact = { id: targetUserId, name: contactName, img: contactImg };
            setContacts([newContact, ...loadedContacts]);
            setActiveChat(newContact);
          }
        }
      } catch (err) {
        console.error("Failed to initialize inbox", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const token = localStorage.getItem('token');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    const newSocket = io(backendUrl, {
      auth: { token },
      // By starting with polling and upgrading to websocket, we avoid Cloudflare dropping the initial wss connection before it's warmed up
      transports: ["polling", "websocket"]
    });

    newSocket.on("receive_message", (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setContacts(prev => {
         const otherId = msg.sender_id === myUserId ? msg.receiver_id : msg.sender_id;
         if (!prev.find(c => c.id === otherId)) {
            api.get('/messages/contacts').then(res => setContacts(res.data.data || []));
         }
         return prev;
      });
      // Acknowledge delivery
      if (myUserId && msg.receiver_id === myUserId) {
        newSocket.emit("mark_messages_delivered", { senderId: msg.sender_id });
      }
    });

    newSocket.on("messages_read", ({ readerId }) => {
      setMessages(prev => prev.map(m => 
        (m.receiver_id === readerId && m.sender_id === myUserId) ? { ...m, is_read: 1, read_at: new Date().toISOString() } : m
      ));
    });

    newSocket.on("messages_delivered", ({ receiverId }) => {
      setMessages(prev => prev.map(m => 
        (m.receiver_id === receiverId && m.sender_id === myUserId && !m.delivered_at) ? { ...m, delivered_at: new Date().toISOString() } : m
      ));
    });

    newSocket.on("message_unsent", ({ messageId }) => {
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, is_unsent: 1, content: "This message was unsent", media_url: null } : m
      ));
    });

    newSocket.on("message_deleted", ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [myUserId]);

  useEffect(() => {
    if (activeChat) {
      api.get(`/messages/history/${activeChat.id}`).then(res => {
        setMessages(res.data.data || []);
        // Emit mark read
        if (socket) {
          socket.emit("mark_messages_read", { senderId: activeChat.id });
        }
      }).catch(() => {
        toast.error("Failed to load history");
      });
    }
  }, [activeChat, socket]);

  // When active chat receives a new message from the other person, instantly mark it read
  useEffect(() => {
    if (activeChat && socket) {
      const unreadFromActive = messages.some(m => m.sender_id === activeChat.id && !m.is_read);
      if (unreadFromActive) {
        socket.emit("mark_messages_read", { senderId: activeChat.id });
        // Locally mark them read so we don't keep emitting
        setMessages(prev => prev.map(m => 
          (m.sender_id === activeChat.id) ? { ...m, is_read: 1 } : m
        ));
      }
    }
  }, [messages, activeChat, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChat]);

  const sendMessage = (mediaUrl: string | null = null, mediaType: string | null = null) => {
    if ((!inputValue.trim() && !mediaUrl) || !activeChat || !socket) return;
    
    socket.emit("send_message", {
      receiverId: activeChat.id,
      content: inputValue,
      mediaUrl,
      mediaType
    });
    setInputValue("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', e.target.files[0]);
      
      const res = await api.post('/media/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data?.data?.[0]) {
        const file = res.data.data[0];
        sendMessage(file.url, file.type || file.media_type);
      }
    } catch (err) {
      toast.error('Failed to upload media');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const unsendMessage = (id: number) => {
    if (socket) socket.emit("unsend_message", { messageId: id });
    setMsgMenuOpen(null);
  };

  const deleteMessage = (id: number) => {
    if (socket) socket.emit("delete_message", { messageId: id });
    setMsgMenuOpen(null);
  };

  const togglePrivacy = async () => {
    const newVal = msgPrivacy === 'everyone' ? 'contacts' : 'everyone';
    try {
      await api.put('/messages/privacy', { privacy: newVal });
      setMsgPrivacy(newVal);
      toast.success(`Only receiving messages from ${newVal}`);
    } catch {
      toast.error('Failed to update privacy');
    }
  };

  const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#00E5FF] transition-colors">{part}</a>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const activeMessages = messages.filter(m => 
    (m.sender_id === myUserId && m.receiver_id === activeChat?.id) ||
    (m.sender_id === activeChat?.id && m.receiver_id === myUserId)
  );

  return (
    <div className="p-0 md:p-8 max-w-7xl mx-auto h-[calc(100dvh-64px)] md:h-[calc(100vh-80px)] flex flex-col md:space-y-4">
      <GlassPanel className="flex-1 overflow-hidden flex md:rounded-3xl border-0 md:border md:border-border/50 bg-background md:bg-surface/50 w-full">
        
        {/* Sidebar List */}
        <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-border/50 flex-col bg-surface/30 backdrop-blur-md relative z-20`}>
          <div className="p-4 md:p-6 border-b border-border/50 flex flex-col gap-4 relative">
            <div className="flex justify-between items-center hidden md:flex">
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Messages</h1>
              <div className="relative">
                <button onClick={() => setPrivacyMenuOpen(!privacyMenuOpen)} className="p-2 text-foreground/50 hover:text-foreground transition-colors rounded-full hover:bg-surface-secondary">
                  <Settings className="w-5 h-5" />
                </button>
                {privacyMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border/50 rounded-xl shadow-lg p-3 z-50">
                    <p className="text-xs text-foreground/50 font-medium mb-2 uppercase tracking-wide px-1">Message Privacy</p>
                    <button 
                      onClick={() => { togglePrivacy(); setPrivacyMenuOpen(false); }}
                      className="w-full text-left p-2 hover:bg-surface-secondary rounded-lg transition-colors flex flex-col"
                    >
                      <span className="text-sm font-bold text-foreground">
                        {msgPrivacy === 'everyone' ? 'Receive from: Everyone' : 'Receive from: Contacts'}
                      </span>
                      <span className="text-xs text-foreground/60 mt-0.5">Click to toggle</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-surface border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/50"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto hide-scrollbar">
            {isLoading ? (
              <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary"/></div>
            ) : contacts.length === 0 ? (
              <div className="text-center p-10 text-foreground/40 text-sm">No conversations yet</div>
            ) : (
              contacts.map((contact) => (
                <div 
                  key={contact.id}
                  onClick={() => setActiveChat(contact)}
                  className={`p-4 border-b border-border/30 cursor-pointer transition-all flex items-center gap-3 ${activeChat?.id === contact.id ? "bg-primary/5 md:border-l-4 border-l-primary" : "hover:bg-surface-secondary"}`}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-[#8B5CF6] flex items-center justify-center text-white font-bold overflow-hidden border-2 border-background shadow-sm">
                      {contact.img ? <img src={getMediaUrl(contact.img)} className="w-full h-full object-cover" /> : (contact.name ? contact.name[0].toUpperCase() : 'U')}
                    </div>
                    {contact.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF4D8D] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-md">
                        {contact.unread_count > 99 ? '99+' : contact.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-foreground text-sm truncate">{contact.name}</h4>
                    </div>
                    <p className="text-xs truncate text-foreground/60 font-medium">
                      Tap to view messages
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${activeChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-background md:bg-surface/10 relative`}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="h-[72px] border-b border-border/50 flex items-center justify-between px-4 md:px-6 bg-surface/80 backdrop-blur-xl shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <button className="md:hidden p-2 -ml-2 text-foreground/60 hover:text-foreground hover:bg-surface-secondary rounded-full transition-colors" onClick={() => setActiveChat(null)}>
                    <ArrowLeft className="w-5 h-5"/>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-[#8B5CF6] flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                    {activeChat.img ? <img src={getMediaUrl(activeChat.img)} className="w-full h-full object-cover" /> : activeChat.name?.[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-foreground text-[15px] leading-tight">{activeChat.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-foreground/60 hover:text-foreground hover:bg-surface-secondary rounded-full transition-colors"><Info className="w-5 h-5"/></button>
                  <button className="p-2 text-foreground/60 hover:text-foreground hover:bg-surface-secondary rounded-full transition-colors"><MoreVertical className="w-5 h-5"/></button>
                </div>
              </div>

              {/* Messages Space */}
              <div 
                className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 custom-scrollbar bg-gradient-to-b from-transparent to-surface/30"
                onClick={() => {
                  setShowEmojiPicker(false);
                  setShowGifPicker(false);
                }}
              >
                {activeMessages.length === 0 ? (
                   <div className="m-auto text-center text-foreground/40 text-sm bg-surface p-4 rounded-2xl border border-border/50 shadow-sm">Say hi to {activeChat.name}!</div>
                ) : (
                  activeMessages.map((msg, idx) => {
                    const isMe = msg.sender_id === myUserId;
                    const isPrevMe = idx > 0 && activeMessages[idx-1].sender_id === msg.sender_id;
                    return (
                      <div key={msg.id} className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isMe ? 'self-end flex-row-reverse' : ''} ${isPrevMe ? 'mt-1' : 'mt-4'} relative group`}>
                        {!isMe && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden ${isPrevMe ? 'invisible' : ''}`}>
                            {activeChat.img ? <img src={getMediaUrl(activeChat.img)} className="w-full h-full object-cover" /> : activeChat.name?.[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col relative">
                          <div 
                            className={`relative text-[15px] leading-relaxed shadow-sm min-w-[80px] group-hover:shadow-md transition-shadow
                              ${msg.is_unsent ? 'bg-surface border border-border/50 text-foreground/50 italic rounded-2xl' : 
                                isMe ? 'bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm' : 'bg-[#202c33] text-[#e9edef] rounded-2xl rounded-tl-sm'
                              }`}
                            onClick={() => setMsgMenuOpen(msgMenuOpen === msg.id ? null : msg.id)}
                            style={{
                              padding: msg.media_url && !msg.content ? '4px' : '6px 8px 8px 10px',
                            }}
                          >
                            {/* The small tail arrow for first message in sequence */}
                            {!isPrevMe && (
                              <svg viewBox="0 0 8 13" width="8" height="13" className={`absolute top-0 ${isMe ? '-right-[8px] text-[#005c4b]' : '-left-[8px] text-[#202c33]'} fill-current`}>
                                {isMe ? <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" /> : <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />}
                              </svg>
                            )}

                            {msg.media_url && (
                              <div className="relative mb-1 rounded-lg overflow-hidden max-w-[280px]">
                                {msg.media_type === 'video' ? (
                                  <video src={getMediaUrl(msg.media_url)} controls className="w-full" />
                                ) : (
                                  <img src={getMediaUrl(msg.media_url)} className="w-full h-auto object-cover max-h-[300px]" />
                                )}
                                {/* Overlay timestamp if only media */}
                                {!msg.content && (
                                  <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full z-10">
                                    <span className="text-[10px] text-white/90 font-medium tracking-wide">{formatTime(msg.created_at)}</span>
                                    {isMe && !msg.is_unsent && (
                                      <span className="shrink-0 flex items-center">
                                        {msg.is_read ? <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] stroke-[2.5]" /> : msg.delivered_at ? <CheckCheck className="w-3.5 h-3.5 text-white/70 stroke-[2.5]" /> : <Check className="w-3.5 h-3.5 text-white/70 stroke-[2.5]" />}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {msg.content && (
                              <div className="flex flex-col relative">
                                {/* The text content */}
                                <span className="whitespace-pre-wrap break-words pr-12 pb-2">
                                  {linkify(msg.content)}
                                </span>
                                
                                {/* WhatsApp Style Float Timestamp at bottom right */}
                                <div className="absolute bottom-[-2px] right-0 flex items-center gap-1 shrink-0 text-[#8696a0]">
                                  <span className="text-[10px] font-medium tracking-wide mt-0.5">{formatTime(msg.created_at)}</span>
                                  {isMe && !msg.is_unsent && (
                                    <span className="shrink-0 flex items-center">
                                      {msg.is_read ? <CheckCheck className="w-[14px] h-[14px] text-[#53bdeb] stroke-[2.5]" /> : msg.delivered_at ? <CheckCheck className="w-[14px] h-[14px] text-[#8696a0] stroke-[2.5]" /> : <Check className="w-[12px] h-[12px] text-[#8696a0] stroke-[2.5]" />}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Context Menu */}
                          {msgMenuOpen === msg.id && (
                            <div className={`absolute top-full mt-1 ${isMe ? 'right-0' : 'left-0'} z-50 bg-surface border border-border/50 rounded-xl shadow-lg p-1 min-w-[160px]`}>
                              {isMe && !msg.is_unsent && (
                                <>
                                  <div className="px-3 py-2 text-xs text-foreground/70 border-b border-border/50 mb-1 space-y-1.5 cursor-default">
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-foreground/50">Delivered</span>
                                      <span>{msg.delivered_at ? formatTime(msg.delivered_at) : '--:--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-[#FACC15]">Read</span>
                                      <span>{msg.is_read && msg.read_at ? formatTime(msg.read_at) : '--:--'}</span>
                                    </div>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); unsendMessage(msg.id); }} className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-surface-secondary rounded-lg transition-colors">Unsend</button>
                                </>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-surface-secondary rounded-lg transition-colors">Delete for me</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-4 bg-surface/80 border-t border-border/50 backdrop-blur-xl shrink-0 relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-4 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden bg-surface">
                    <div className="bg-surface-secondary p-2 flex justify-between items-center border-b border-border/50">
                       <span className="text-xs font-bold text-foreground/70 uppercase tracking-wider ml-2">Emojis</span>
                       <button onClick={() => setShowEmojiPicker(false)} className="text-foreground/50 hover:text-foreground p-1 bg-background rounded-full transition-colors">
                          <Check className="w-4 h-4" />
                       </button>
                    </div>
                    <EmojiPicker 
                      theme={Theme.DARK}
                      onEmojiClick={(emojiData) => setInputValue(prev => prev + emojiData.emoji)}
                      autoFocusSearch={false}
                    />
                  </div>
                )}

                {showGifPicker && (
                  <div className="absolute bottom-full right-4 mb-2 z-50 shadow-2xl rounded-2xl overflow-hidden bg-surface border border-border/50 flex flex-col" style={{ width: 300, height: 400 }}>
                    <div className="p-2 border-b border-border/50 flex justify-between items-center bg-surface-secondary">
                      <input 
                        type="text" 
                        placeholder="Search GIFs..." 
                        value={gifSearchTerm}
                        onChange={(e) => setGifSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/50 mr-2"
                      />
                      <button onClick={() => setShowGifPicker(false)} className="text-foreground/50 hover:text-foreground p-1 shrink-0">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                      <Grid
                        width={290}
                        columns={2}
                        fetchGifs={fetchGifs}
                        key={gifSearchTerm}
                        onGifClick={(gif, e) => {
                          e.preventDefault();
                          sendMessage(gif.images.original.url, 'gif');
                          setShowGifPicker(false);
                        }}
                        noLink
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2 bg-surface-secondary border border-border/50 rounded-[24px] px-4 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-inner relative">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="text-foreground/50 hover:text-primary transition-colors p-2 mb-1 shrink-0" disabled={isUploading}>
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5"/>}
                  </button>
                  <textarea 
                    placeholder="Message..." 
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onFocus={() => {
                      setShowEmojiPicker(false);
                      setShowGifPicker(false);
                    }}
                    className="flex-1 bg-transparent border-none focus:outline-none text-[15px] text-foreground placeholder:text-foreground/40 py-2.5 resize-none min-h-[44px] max-h-[120px] custom-scrollbar"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                    }}
                  />
                  <button 
                    onClick={() => {
                      setShowGifPicker(!showGifPicker);
                      setShowEmojiPicker(false);
                    }}
                    className={`text-foreground/50 hover:text-[#00E5FF] transition-colors p-2 mb-1 shrink-0 ${showGifPicker ? 'text-[#00E5FF]' : ''}`}
                  >
                    <FileBox className="w-5 h-5"/>
                  </button>
                  <button 
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowGifPicker(false);
                    }}
                    className={`text-foreground/50 hover:text-[#FACC15] transition-colors p-2 mb-1 shrink-0 ${showEmojiPicker ? 'text-[#FACC15]' : ''}`}
                  >
                    <Smile className="w-5 h-5"/>
                  </button>
                  <button 
                    onClick={() => {
                      sendMessage();
                      setShowEmojiPicker(false);
                      setShowGifPicker(false);
                      // Reset textarea height
                      setTimeout(() => {
                        const ta = document.querySelector('textarea');
                        if (ta) ta.style.height = 'auto';
                      }, 0);
                    }}
                    disabled={!inputValue.trim() && !isUploading}
                    className="w-10 h-10 mb-1 rounded-full bg-primary flex items-center justify-center shrink-0 disabled:opacity-50 disabled:scale-95 hover:opacity-90 hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <Send className="w-4 h-4 ml-0.5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-foreground/50 p-6 text-center">
              <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 border border-border shadow-sm">
                 <Send className="w-10 h-10 text-primary/60 ml-2" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Messages</h2>
              <p className="text-sm font-medium max-w-xs leading-relaxed">Select a conversation from the sidebar or start a new chat with a friend.</p>
            </div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
