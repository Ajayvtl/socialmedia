"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import api, { getMediaUrl } from "@/lib/api";
import { 
  Home, Compass, Users, Heart, Calendar, MessageCircle, Sparkles, 
  Wallet, Trophy, Bookmark, MoreHorizontal, Loader2, Plus, Search, LogOut, Briefcase, GitMerge, Archive,
  Menu, X
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function DappLayout({ children }: { children: React.ReactNode }) {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [socialProfile, setSocialProfile] = useState<any>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const isPublicDappPage = pathname === "/dapp/login" || pathname === "/dapp";
  const hideNav = isPublicDappPage || pathname === "/dapp/onboarding";
  const showNav = !hideNav;

  // Social Navigation (Matching the Image)
  const navItems = [
    { key: "home", href: "/dapp/feed", label: "Home", icon: Home, badge: 0 },
    { key: "discover", href: "/dapp/search", label: "Discover", icon: Compass, badge: 0 },
    { key: "communities", href: "/dapp/communities", label: "Communities", icon: Users, badge: 0 },
    { key: "dating", href: "/dapp/dating", label: "Dating", icon: Heart, badge: 0 },
    { key: "events", href: "/dapp/events", label: "Events", icon: Calendar, badge: 0 },
    { key: "family", href: "/dapp/family-graph", label: "Family Graph", icon: GitMerge, badge: 0 },
    { key: "memory", href: "/dapp/memory-wallet", label: "Memory Wallet", icon: Archive, badge: 0 },
    { key: "messages", href: "/dapp/inbox", label: "Messages", icon: MessageCircle, badge: 18 },
    { key: "avatar", href: "/dapp/avatar", label: "Avatar Studio", icon: Sparkles, badge: 0 },
    { key: "wallet", href: "/dapp/wallet", label: "Wallet", icon: Wallet, badge: 0 },
    { key: "creator", href: "/dapp/creator", label: "Creator Hub", icon: Trophy, badge: 0 },
    { key: "business", href: "/dapp/business", label: "Business Pages", icon: Briefcase, badge: 0 },
    { key: "saved", href: "/dapp/saved", label: "Saved", icon: Bookmark, badge: 0 },
    { key: "more", href: "#", label: "More", icon: MoreHorizontal, badge: 0 },
  ];

  if (user && ['USER', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'SUPPORT_ADMIN', 'DEVELOPER'].includes(user.role || '')) {
    navItems.push({ key: "admin", href: "/dapp/admin", label: "Admin Portal", icon: Briefcase, badge: 0 });
  }

  useEffect(() => {
    if (!mounted || isPublicDappPage) return;
    if (!token && !localStorage.getItem("token")) {
      router.replace(`/dapp/login?next=${encodeURIComponent(pathname)}`);
    } else {
      api.get("/social-profile")
        .then(res => {
          if (res.data?.data) {
            setSocialProfile(res.data.data);
            // Optionally update user context or localStorage if needed
          }
        })
        .catch(console.error);
    }
  }, [mounted, token, pathname, isPublicDappPage, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050816]">
         <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] font-sans text-white flex relative overflow-hidden">
      
      {/* Background System (Layer 1 & 2) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#050816]"></div>
        {/* Radial Gradients matching the design philosophy */}
        <div className="absolute -top-[10%] -left-[10%] w-[150vw] h-[150vw] md:w-[60vw] md:h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,229,255,0.15)_0%,transparent_60%)] blur-3xl"></div>
        <div className="absolute top-[20%] -right-[20%] w-[150vw] h-[150vw] md:w-[70vw] md:h-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.15)_0%,transparent_60%)] blur-3xl"></div>
        <div className="absolute -bottom-[10%] left-[10%] w-[150vw] h-[150vw] md:w-[50vw] md:h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,77,141,0.12)_0%,transparent_60%)] blur-3xl"></div>
      </div>

      {/* MOBILE OVERLAY */}
      {showNav && isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 xl:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* FLOATING MOBILE MENU BUTTON */}
      {showNav && (
        <button 
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className={`xl:hidden fixed z-50 bottom-[90px] right-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(0,229,255,0.2)] border border-white/10 overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/80 to-[#00E5FF]/80 backdrop-blur-md transition-opacity group-hover:opacity-100 opacity-90" />
          <div className="relative z-10">
            {isMobileNavOpen ? <X className="w-7 h-7 text-white" /> : <Menu className="w-7 h-7 text-white" />}
          </div>
        </button>
      )}

      {/* SIDEBAR (Desktop Fixed, Mobile Collapsible) */}
      {showNav && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col overflow-y-auto hide-scrollbar bg-[#050816]/95 xl:bg-white/[0.02] border-r border-white/[0.05] backdrop-blur-[24px] transition-transform duration-300 xl:translate-x-0 ${isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Logo & Close */}
          <div className="flex items-center justify-between px-6 py-8">
            <Link href="/dapp/feed" className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] via-[#8B5CF6] to-[#FF4D8D] flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                  A
               </div>
               <span className="text-2xl font-bold tracking-wider">AURORA</span>
            </Link>
            <button className="xl:hidden text-white/60 hover:text-white transition-colors" onClick={() => setIsMobileNavOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-4 space-y-1 pb-4">
             {navItems.map((item) => {
               const active = pathname.startsWith(item.href) && item.href !== "#";
               return (
                 <Link key={item.key} href={item.href} className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${active ? 'bg-white/[0.08] shadow-[0_0_20px_rgba(0,229,255,0.1)] border border-white/[0.08]' : 'hover:bg-white/[0.05]'}`}>
                   <div className="flex items-center gap-4">
                     <item.icon className={`w-5 h-5 transition-colors ${active ? 'text-[#00E5FF]' : 'text-white/60 group-hover:text-white'}`} />
                     <span className={`text-sm font-medium ${active ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{item.label}</span>
                   </div>
                   {item.badge > 0 && (
                     <span className="bg-[#FF4D8D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,77,141,0.5)]">{item.badge}</span>
                   )}
                 </Link>
               )
             })}
          </nav>

          {/* User Profile & Extras */}
          <div className="px-4 pb-6 space-y-4">
            
            {/* User Profile Card */}
            <div className="p-4 rounded-[24px] bg-white/[0.03] border border-white/[0.05] backdrop-blur-[12px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  {socialProfile?.avatar_url ? (
                    <img src={getMediaUrl(socialProfile.avatar_url)} alt="Profile" className="w-10 h-10 rounded-full border-2 border-[#00E5FF] object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                      {(socialProfile?.display_name || socialProfile?.username || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D97E] border-2 border-[#050816] rounded-full"></span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1">{socialProfile?.display_name || socialProfile?.username || 'Member'} <div className="w-3 h-3 bg-[#00E5FF] rounded-full shadow-[0_0_5px_#00E5FF]" title="Verified"></div></h4>
                  <p className="text-[10px] text-white/50">@{socialProfile?.username || 'user'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-white/60 mb-1">
                <span>Level 24</span>
                <span>8,560 / 12K XP</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] w-[70%]"></div>
              </div>
            </div>

            {/* Premium Badge */}
            <div className="p-4 rounded-[24px] bg-gradient-to-r from-[#8B5CF6]/20 to-[#FF4D8D]/20 border border-[#FF4D8D]/30 flex items-center gap-3 cursor-pointer hover:shadow-[0_0_20px_rgba(255,77,141,0.2)] transition-shadow">
              <Trophy className="w-6 h-6 text-[#FACC15]" />
              <div>
                <h4 className="text-xs font-bold text-white">Aurora Premium</h4>
                <p className="text-[10px] text-white/60">Expires in 12 days</p>
              </div>
            </div>

            {/* Logout Button */}
            <button onClick={() => {
              logout();
              router.replace('/dapp/login');
            }} className="w-full mt-4 p-4 rounded-[24px] bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 transition-all text-red-400 group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold">Sign Out</span>
            </button>

          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 relative w-full z-10 ${showNav ? 'xl:ml-[280px] pb-24 xl:pb-0' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION (Mobile Only) */}
      {showNav && (
        <div className="xl:hidden fixed bottom-0 left-0 w-full z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="bg-[#050816]/95 backdrop-blur-[24px] border-t border-white/[0.08] h-[72px] flex items-center justify-around px-2 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
            <Link href="/dapp/feed" className="flex flex-col items-center justify-center p-2 group w-16">
              <Home className="w-6 h-6 text-[#00E5FF] transition-transform group-hover:scale-110" />
              <span className="text-[10px] text-[#00E5FF] font-medium mt-1">Home</span>
            </Link>
            <Link href="/dapp/search" className="flex flex-col items-center justify-center p-2 group w-16">
              <Search className="w-6 h-6 text-white/50 transition-transform group-hover:scale-110" />
              <span className="text-[10px] text-white/50 font-medium mt-1 group-hover:text-white">Discover</span>
            </Link>
            <Link href="/dapp/avatar" className="relative -top-5 group flex flex-col items-center w-16">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#00E5FF] p-[2px] shadow-[0_0_20px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#050816] rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
            <Link href="/dapp/inbox" className="flex flex-col items-center justify-center p-2 group relative w-16">
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-white/50 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF4D8D] rounded-full border border-[#050816]"></span>
              </div>
              <span className="text-[10px] text-white/50 font-medium mt-1 group-hover:text-white">Messages</span>
            </Link>
            <Link href="/dapp/profile" className="flex flex-col items-center justify-center p-2 group w-16">
              {socialProfile?.avatar_url ? (
                <img src={getMediaUrl(socialProfile.avatar_url)} className="w-6 h-6 rounded-full border border-white/20 transition-transform group-hover:scale-110 object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-full border border-white/20 transition-transform group-hover:scale-110 bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px]">
                  {(socialProfile?.display_name || socialProfile?.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-[10px] text-white/50 font-medium mt-1 group-hover:text-white">Profile</span>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
