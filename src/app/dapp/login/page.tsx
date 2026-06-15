"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BadgeCheck, LockKeyhole, Loader2, ShieldCheck, Smartphone, Wallet, Mail, Eye, EyeOff, Users, Heart, Users2, Calendar, Crown, CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { BrowserProvider, Contract, formatUnits } from "ethers";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { DAPP_CHAIN, ERC20_BALANCE_ABI } from "@/lib/dappConfig";
import { getInjectedProvider, type Eip1193Provider } from "@/lib/injectedWallet";
import BrandLogo from "@/components/dapp/BrandLogo";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { safeObject } from "@/lib/utils";

interface AuthApiUser {
  id?: number | string;
  companyId?: number | null;
  company_id?: number | null;
  referralCode?: string;
  email?: string;
  phone?: string;
  walletAddress?: string;
}

interface AuthApiPayload {
  token?: string;
  user?: AuthApiUser;
}

interface MemberSessionUser {
  id: number;
  name: string;
  email: string;
  role: "USER";
  role_id: number;
  company_id: number | null;
  referral_code?: string;
  wallet_address: string;
}

const DEFAULT_COMPANY_ID = 1;

// ... Wallet Utils (Omitted for brevity, but needed in actual code)
function persistMemberSession(token: string, user: MemberSessionUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("availableHotels", JSON.stringify([]));
  localStorage.removeItem("currentHotel");
}

function FeatureItem({ icon: Icon, title, desc, color, bg }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <p className="text-white/60 text-xs">{desc}</p>
      </div>
    </div>
  );
}

export default function DappLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<"login" | "register" | "otp">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [authProviders, setAuthProviders] = useState({ google: false, apple: false });
  const [isValidId, setIsValidId] = useState<boolean | null>(null);

  useEffect(() => {
    // In production, this would be an API call to api.get('/settings/public')
    const saved = localStorage.getItem("admin_auth_providers");
    if (saved) {
      const parsed = safeObject<any>(saved);
      setAuthProviders({
        google: parsed.google?.enabled,
        apple: parsed.apple?.enabled
      });
    }
  }, []);

  useEffect(() => {
    if (!identifier) {
      setIsValidId(null);
      return;
    }
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^\+?[0-9]{10,15}$/.test(identifier);
    setIsValidId(isEmail || isPhone);
  }, [identifier]);

  const [loading, setLoading] = useState(false);

  const handlePostLogin = (payload: AuthApiPayload, signerAddress: string) => {
    const memberUser: MemberSessionUser = {
      id: Number(payload.user?.id || 0),
      name: "Member",
      email: payload.user?.email || "",
      role: "USER",
      role_id: 5,
      company_id: payload.user?.companyId ?? payload.user?.company_id ?? DEFAULT_COMPANY_ID,
      referral_code: payload.user?.referralCode,
      wallet_address: signerAddress || payload.user?.walletAddress || "",
    };

    persistMemberSession(payload.token!, memberUser);
    login(payload.token!, memberUser, [], [], true); // skipRedirect = true
    
    // Check if user is fully registered
    api.get("/social-profile", { headers: { Authorization: `Bearer ${payload.token}` }})
      .then(res => {
         const profile = res.data?.data;
         // If onboarding_step < 6, they haven't completed onboarding
         if (!profile || profile.onboarding_step < 6 || step === "otp") {
            window.location.replace("/dapp/onboarding");
         } else {
            const next = sessionStorage.getItem("postLoginRedirect");
            const target = next && next.startsWith("/dapp/") ? next : "/dapp/dashboard";
            sessionStorage.removeItem("postLoginRedirect");
            window.location.replace(target);
         }
      })
      .catch(() => {
         // Fallback if API fails
         if (step === "otp") {
           window.location.replace("/dapp/onboarding");
         } else {
           window.location.replace("/dapp/dashboard");
         }
      });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/dapp/register", {
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        password,
        companyId: DEFAULT_COMPANY_ID
      });
      setRegisteredUserId(res.data.userId);
      toast.success(res.data.message || "Registration successful");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/dapp/login", {
        identifier,
        password,
        companyId: DEFAULT_COMPANY_ID
      });
      handlePostLogin(res.data, "");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/dapp/verify-otp", {
        userId: registeredUserId,
        otp
      });
      handlePostLogin(res.data, "");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/bg-2.png')" }}>
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      
      {/* Left Column (Brand & Features) */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-white w-[45%] border-r border-white/10 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-0"></div>
        <div className="relative z-10 max-w-md h-full flex flex-col justify-center">
          <BrandLogo className="mb-12" />
          <h1 className="text-[3.5rem] font-bold leading-tight mb-4 tracking-tight">
            Connect.<br/>Explore.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b534ff] to-[#00E5FF]">Belong.</span>
          </h1>
          <p className="text-white/70 mb-10 text-base leading-relaxed">
            The all-in-one social and dating platform to meet new people, join communities, attend events and express yourself.
          </p>
          
          <div className="space-y-7">
            <FeatureItem icon={Users} title="Meet New People" desc="Discover like-minded people around you." color="text-indigo-400" bg="bg-indigo-500/20" />
            <FeatureItem icon={Heart} title="Smart Matches" desc="Find meaningful connections." color="text-pink-400" bg="bg-pink-500/20" />
            <FeatureItem icon={Users2} title="Join Communities" desc="Connect and engage in vibrant communities." color="text-teal-400" bg="bg-teal-500/20" />
            <FeatureItem icon={Calendar} title="Exciting Events" desc="Join live and virtual events near you." color="text-purple-400" bg="bg-purple-500/20" />
            <FeatureItem icon={Crown} title="Express Yourself" desc="Create, share and be uniquely you." color="text-amber-400" bg="bg-amber-500/20" />
          </div>
        </div>
      </div>

      {/* Right Column (Auth Form) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-bl from-[#b534ff]/20 to-transparent blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-gradient-to-tr from-[#00E5FF]/20 to-transparent blur-[120px] pointer-events-none"></div>

        <GlassPanel className="w-full max-w-[420px] p-8 md:p-10 relative z-10 border border-white/10 bg-black/50 shadow-2xl backdrop-blur-2xl rounded-[32px]">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-[28px] font-bold text-white mb-2">
              {step === "login" ? "Welcome Back" : step === "register" ? "Create Account" : "Verify OTP"}
            </h2>
            <p className="text-white/50 text-sm">
              {step === "login" ? "Login to continue your journey" : step === "register" ? "Join the most vibrant community" : "Enter the code sent to your device"}
            </p>
          </div>

          {(step === "login" || step === "register") && (
            <form onSubmit={step === "login" ? handleLogin : handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email or Username</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                    type="text" 
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="Enter your email or phone"
                    autoComplete="username"
                    className={`w-full bg-black/20 border ${isValidId === false ? 'border-[#FF4D8D]' : isValidId === true ? 'border-[#00D97E]' : 'border-white/10'} rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:border-[#00E5FF] outline-none transition-colors`}
                  />
                  {identifier.length > 0 && (
                     isValidId 
                     ? <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00D97E]" /> 
                     : <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF4D8D]" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete={step === "login" ? "current-password" : "new-password"}
                    className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white placeholder-white/30 focus:border-[#00E5FF] outline-none transition-colors"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {step === "login" && (
                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-black/20 text-[#b534ff] focus:ring-[#b534ff]" />
                    <span className="text-sm text-white/70">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#b534ff] hover:text-[#c45eff] transition-colors">Forgot Password?</a>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-[0_4px_20px_rgba(0,229,255,0.3)] mt-6">
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : (step === "login" ? 'Log In' : 'Sign Up')}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-xs"><span className="bg-[#0b101c] px-4 text-white/50">or continue with</span></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {authProviders.google && (
                  <button type="button" className="bg-black/20 hover:bg-white/5 border border-white/10 py-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span className="text-[11px] text-white/70 font-medium">Google</span>
                  </button>
                )}
                {authProviders.apple && (
                  <button type="button" className="bg-black/20 hover:bg-white/5 border border-white/10 py-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                    <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5 invert" />
                    <span className="text-[11px] text-white/70 font-medium">Apple</span>
                  </button>
                )}
                <button type="button" className="bg-black/20 hover:bg-white/5 border border-white/10 py-3 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors">
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                  <span className="text-[11px] text-white/70 font-medium">Facebook</span>
                </button>
              </div>

              <div className="text-center mt-8">
                <span className="text-white/50 text-sm">
                  {step === "login" ? "Don't have an account?" : "Already have an account?"} 
                </span>
                <button type="button" onClick={() => setStep(step === "login" ? "register" : "login")} className="text-[#b534ff] hover:text-[#c45eff] text-sm ml-2 font-semibold">
                  {step === "login" ? "Sign Up" : "Log In"}
                </button>
              </div>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleOtpVerify} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 text-center">Enter 6-Digit OTP</label>
                <input 
                  type="text" 
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-white focus:border-[#00E5FF] outline-none text-center text-3xl tracking-[1em] transition-colors font-mono"
                  maxLength={6}
                />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex justify-center items-center shadow-[0_4px_20px_rgba(0,229,255,0.3)]">
                {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Verify & Continue'}
              </button>
            </form>
          )}

          {/* Security Badges */}
          <div className="grid grid-cols-3 gap-2 mt-10 pt-8 border-t border-white/10">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <ShieldCheck className="w-5 h-5 text-white/40" />
              <span className="text-[10px] text-white/50 uppercase font-semibold">Your Data<br/>is Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <LockKeyhole className="w-5 h-5 text-white/40" />
              <span className="text-[10px] text-white/50 uppercase font-semibold">Privacy<br/>Protected</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <BadgeCheck className="w-5 h-5 text-white/40" />
              <span className="text-[10px] text-white/50 uppercase font-semibold">Trusted by<br/>Millions</span>
            </div>
          </div>

        </GlassPanel>
      </div>
    </div>
  );
}
