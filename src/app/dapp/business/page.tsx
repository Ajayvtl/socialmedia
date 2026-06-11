"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Loader2, Plus, Building2, Globe, Link as LinkIcon, Camera, LayoutTemplate } from "lucide-react";
import toast from "react-hot-toast";

export default function BusinessPages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    description: "",
    website: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.get("/business/my");
      setPages(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.companyName.trim()) {
      toast.error("Company name is required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/business", formData);
      toast.success("Business Page Created!");
      setIsModalOpen(false);
      setFormData({ companyName: "", industry: "", description: "", website: "" });
      fetchPages();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to create business page.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building2 className="text-[#FACC15]" /> Business Pages
          </h1>
          <p className="text-white/50 mt-1">Manage your professional presence and company profiles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-[#FACC15] to-[#FF4D8D] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={18} /> Create Page
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#FACC15]" /></div>
      ) : pages.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center flex flex-col items-center">
          <Building2 className="w-16 h-16 text-white/20 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Business Pages Yet</h2>
          <p className="text-white/50 mb-6 max-w-md">Create a business page to connect with customers, post professional updates, and grow your brand.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <Plus size={18} /> Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page: any) => (
            <div key={page.id} className="bg-white/5 border border-white/10 rounded-[28px] overflow-hidden group hover:border-[#FACC15]/50 transition-colors">
              <div className="h-32 bg-gradient-to-br from-[#1E293B] to-[#0F172A] relative flex items-center justify-center">
                {page.cover_url ? (
                  <img src={page.cover_url} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                  <LayoutTemplate className="w-10 h-10 text-white/10" />
                )}
                <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-xl bg-[#0a0f24] p-1 border-2 border-white/10">
                  {page.logo_url ? (
                    <img src={page.logo_url} className="w-full h-full object-cover rounded-lg" alt="Logo" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#FACC15] to-[#FF4D8D] flex items-center justify-center text-white font-bold text-2xl">
                      {page.company_name[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-12 p-6">
                <h3 className="text-xl font-bold text-white mb-1">{page.company_name}</h3>
                {page.industry && <p className="text-xs text-[#FACC15] font-medium mb-3 uppercase tracking-wider">{page.industry}</p>}
                <p className="text-sm text-white/60 mb-4 line-clamp-2">{page.description || "No description provided."}</p>
                <div className="flex items-center justify-between text-xs font-medium text-white/40">
                  <span>{page.followers_count || 0} followers</span>
                  {page.website && (
                    <a href={page.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#00E5FF] transition-colors">
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0f24] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold text-white mb-6">Create Business Page</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Company Name *</label>
                <input 
                  type="text" 
                  value={formData.companyName} 
                  onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]" 
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Industry</label>
                <input 
                  type="text" 
                  value={formData.industry} 
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15]" 
                  placeholder="e.g. Technology"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FACC15] resize-none" 
                  placeholder="Tell us about your company..."
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Website</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input 
                    type="url" 
                    value={formData.website} 
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-[#FACC15]" 
                    placeholder="https://"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 text-white font-bold py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={saving || !formData.companyName.trim()}
                  className="flex-1 bg-gradient-to-r from-[#FACC15] to-[#FF4D8D] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Create Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
