"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Save, ShieldCheck, Mail, Smartphone, Globe, Code, Power } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthProvidersPage() {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState({
    google: {
      enabled: false,
      clientId: "",
      clientSecret: ""
    },
    apple: {
      enabled: false,
      clientId: "",
      teamId: "",
      keyId: "",
      privateKey: ""
    },
    email: {
      enabled: true,
      provider: "smtp",
      smtpHost: "",
      smtpPort: "",
      smtpUser: "",
      smtpPass: ""
    },
    otp: {
      enabled: true,
      provider: "twilio",
      accountSid: "",
      authToken: "",
      fromNumber: ""
    }
  });

  // Mock loading for now, as we don't have a dedicated DB table for this yet.
  // In production, this would fetch from /api/settings/auth-providers
  useEffect(() => {
    const saved = localStorage.getItem("admin_auth_providers");
    if (saved) {
      try {
        setProviders(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("admin_auth_providers", JSON.stringify(providers));
      toast.success("Auth Providers configuration saved successfully.");
      setLoading(false);
    }, 800);
  };

  const toggleProvider = (key: keyof typeof providers) => {
    setProviders(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        enabled: !prev[key].enabled
      }
    }));
  };

  const handleChange = (provider: keyof typeof providers, field: string, value: string) => {
    setProviders(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Auth Providers</h1>
          <p className="text-white/50 text-sm">Configure OAuth and OTP gateways for the Dapp Login</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="bg-[#b534ff] hover:bg-[#c45eff] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4"/> {loading ? "Saving..." : "Save Configuration"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google */}
        <GlassPanel className="p-6 border border-white/5 bg-black/20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Globe className="w-5 h-5 text-[#00E5FF]"/>
              </div>
              <div>
                <h3 className="font-bold text-white">Google OAuth</h3>
                <p className="text-xs text-white/50">Allow sign in with Google</p>
              </div>
            </div>
            <button onClick={() => toggleProvider('google')} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${providers.google.enabled ? 'bg-[#00D97E]/20 text-[#00D97E] border-[#00D97E]/50' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}>
              <Power className="w-3 h-3"/> {providers.google.enabled ? 'Active' : 'Disabled'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Client ID</label>
              <input type="text" value={providers.google.clientId} onChange={e => handleChange('google', 'clientId', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="e.g. 1234567890-abc.apps.googleusercontent.com"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Client Secret</label>
              <input type="password" value={providers.google.clientSecret} onChange={e => handleChange('google', 'clientSecret', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="••••••••••••"/>
            </div>
          </div>
        </GlassPanel>

        {/* Apple */}
        <GlassPanel className="p-6 border border-white/5 bg-black/20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-5 h-5 text-white"/>
              </div>
              <div>
                <h3 className="font-bold text-white">Apple OAuth</h3>
                <p className="text-xs text-white/50">Allow sign in with Apple</p>
              </div>
            </div>
            <button onClick={() => toggleProvider('apple')} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${providers.apple.enabled ? 'bg-[#00D97E]/20 text-[#00D97E] border-[#00D97E]/50' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}>
              <Power className="w-3 h-3"/> {providers.apple.enabled ? 'Active' : 'Disabled'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Client ID</label>
              <input type="text" value={providers.apple.clientId} onChange={e => handleChange('apple', 'clientId', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="com.aurora.dapp"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Team ID</label>
                <input type="text" value={providers.apple.teamId} onChange={e => handleChange('apple', 'teamId', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="TEAM123"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Key ID</label>
                <input type="text" value={providers.apple.keyId} onChange={e => handleChange('apple', 'keyId', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="KEY123"/>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Email OTP */}
        <GlassPanel className="p-6 border border-white/5 bg-black/20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Mail className="w-5 h-5 text-pink-400"/>
              </div>
              <div>
                <h3 className="font-bold text-white">Email OTP</h3>
                <p className="text-xs text-white/50">Verification codes via Email</p>
              </div>
            </div>
            <button onClick={() => toggleProvider('email')} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${providers.email.enabled ? 'bg-[#00D97E]/20 text-[#00D97E] border-[#00D97E]/50' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}>
              <Power className="w-3 h-3"/> {providers.email.enabled ? 'Active' : 'Disabled'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">SMTP Host</label>
              <input type="text" value={providers.email.smtpHost} onChange={e => handleChange('email', 'smtpHost', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="smtp.mailgun.org"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">SMTP Port</label>
                <input type="text" value={providers.email.smtpPort} onChange={e => handleChange('email', 'smtpPort', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="587"/>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">SMTP User</label>
                <input type="text" value={providers.email.smtpUser} onChange={e => handleChange('email', 'smtpUser', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="postmaster@..."/>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* SMS OTP */}
        <GlassPanel className="p-6 border border-white/5 bg-black/20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Smartphone className="w-5 h-5 text-yellow-400"/>
              </div>
              <div>
                <h3 className="font-bold text-white">SMS OTP</h3>
                <p className="text-xs text-white/50">Verification codes via Phone</p>
              </div>
            </div>
            <button onClick={() => toggleProvider('otp')} className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${providers.otp.enabled ? 'bg-[#00D97E]/20 text-[#00D97E] border-[#00D97E]/50' : 'bg-red-500/20 text-red-500 border-red-500/50'}`}>
              <Power className="w-3 h-3"/> {providers.otp.enabled ? 'Active' : 'Disabled'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1">Provider Service</label>
              <select value={providers.otp.provider} onChange={e => handleChange('otp', 'provider', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none appearance-none">
                <option value="twilio">Twilio</option>
                <option value="msg91">MSG91</option>
                <option value="aws">AWS SNS</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Account SID / Key</label>
                <input type="text" value={providers.otp.accountSid} onChange={e => handleChange('otp', 'accountSid', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="AC1234..."/>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1">Auth Token</label>
                <input type="password" value={providers.otp.authToken} onChange={e => handleChange('otp', 'authToken', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-[#00E5FF] outline-none" placeholder="••••••••••••"/>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
