"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader2, Plus, Edit2, Globe, Heart, CheckCircle2, XCircle, X, Smile } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false }) as any;

export default function SystemVariablesPage() {
  const [activeTab, setActiveTab] = useState<"countries" | "states" | "cities" | "interests" | "postLimits" | "relationTree">("countries");
  const [loading, setLoading] = useState(true);
  
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [generalSettings, setGeneralSettings] = useState<any>({});
  const [relationships, setRelationships] = useState<any[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, ciRes, iRes, genRes, relRes] = await Promise.all([
        api.get("/settings/countries").catch(() => ({ data: { data: [] } })),
        api.get("/settings/states").catch(() => ({ data: { data: [] } })),
        api.get("/settings/cities").catch(() => ({ data: { data: [] } })),
        api.get("/settings/interests").catch(() => ({ data: { data: [] } })),
        api.get("/settings/general").catch(() => ({ data: { data: {} } })),
        api.get("/family-graph/admin/relationships").catch(() => ({ data: { data: [] } }))
      ]);
      setCountries(cRes.data?.data || []);
      setStates(sRes.data?.data || []);
      setCities(ciRes.data?.data || []);
      setInterests(iRes.data?.data || []);
      setGeneralSettings(genRes.data?.data || {});
      setRelationships(relRes.data?.data || []);
    } catch (err) {
      toast.error("Failed to load system variables");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (type: "countries" | "states" | "cities" | "interests", item: any) => {
    try {
      const endpointMap = {
        countries: `/settings/countries/${item.id}`,
        states: `/settings/states/${item.id}`,
        cities: `/settings/cities/${item.id}`,
        interests: `/settings/interests/${item.id}`,
      } as const;
      const endpoint = endpointMap[type];
      await api.put(endpoint, { ...item, is_enabled: !item.is_enabled });
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error("Update failed. You might lack permissions.");
    }
  };

  const openModal = (item?: any) => {
    setEditingItem(item || null);
    setShowEmojiPicker(false);
    if (activeTab === "countries") {
      setFormData(item || { name: "", icon: "", code: "", currency: "", currency_symbol: "", is_enabled: true });
    } else if (activeTab === "states") {
      setFormData(item || { name: "", icon: "", code: "", country: "", is_enabled: true });
    } else if (activeTab === "cities") {
      setFormData(item || { name: "", icon: "", code: "", state: "", country: "", is_enabled: true });
    } else if (activeTab === "relationTree") {
      setFormData(item || { user_id: "", related_user_id: "", related_name: "", relationship_type: "", notes: "" });
    } else {
      setFormData(item || { name: "", icon: "", gender_target: "all", is_enabled: true });
    }
    setIsModalOpen(true);
  };

  const saveItem = async () => {
    setSaving(true);
    try {
      const isEdit = !!editingItem;
      const endpointMap = {
        countries: isEdit ? `/settings/countries/${editingItem.id}` : `/settings/countries`,
        states: isEdit ? `/settings/states/${editingItem.id}` : `/settings/states`,
        cities: isEdit ? `/settings/cities/${editingItem.id}` : `/settings/cities`,
        interests: isEdit ? `/settings/interests/${editingItem.id}` : `/settings/interests`,
        relationTree: isEdit ? `/family-graph/admin/relationships/${editingItem.id}` : `/family-graph/admin/relationships`,
      } as const;
      const endpoint = activeTab === "postLimits" ? "" : endpointMap[activeTab as keyof typeof endpointMap];
      
      if (isEdit) {
        await api.put(endpoint, formData);
      } else {
        await api.post(endpoint, formData);
      }
      
      toast.success("Saved successfully");
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const saveGeneralSettings = async () => {
    setSaving(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(generalSettings).forEach(key => {
        formDataToSend.append(key, generalSettings[key]);
      });
      await api.put("/settings/general", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Settings saved successfully");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRelation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this relationship?")) return;
    try {
      await api.delete(`/family-graph/admin/relationships/${id}`);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">System Variables</h1>
          <p className="text-white/50 text-sm mt-1">Manage global system configurations</p>
        </div>
        {activeTab !== "postLimits" && (
          <button onClick={() => openModal()} className="bg-[#00E5FF] text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#00E5FF]/80 transition-colors">
            <Plus size={18} /> Add New
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab("countries")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'countries' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50' : 'text-white/50 hover:bg-white/5'}`}
        >
          <Globe size={18} /> Countries
        </button>
        <button 
          onClick={() => setActiveTab("states")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'states' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50' : 'text-white/50 hover:bg-white/5'}`}
        >
          <Globe size={18} /> States
        </button>
        <button 
          onClick={() => setActiveTab("cities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'cities' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50' : 'text-white/50 hover:bg-white/5'}`}
        >
          <Globe size={18} /> Cities
        </button>
        <button 
          onClick={() => setActiveTab("interests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'interests' ? 'bg-[#FF4D8D]/20 text-[#FF4D8D] border border-[#FF4D8D]/50' : 'text-white/50 hover:bg-white/5'}`}
        >
          <Heart size={18} /> Interests
        </button>
        <button 
          onClick={() => setActiveTab("relationTree")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'relationTree' ? 'bg-[#00D97E]/20 text-[#00D97E] border border-[#00D97E]/50' : 'text-white/50 hover:bg-white/5'}`}
        >
          <Globe size={18} /> Relation Tree
        </button>
        <button 
          onClick={() => setActiveTab("postLimits")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'postLimits' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/50' : 'text-white/50 hover:bg-white/5'}`}
        >
          <Edit2 size={18} /> Post Limits
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
        </div>
      ) : (
        <GlassPanel className="p-6 border border-white/5 bg-black/20">
          {activeTab === "countries" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="p-4 font-medium text-sm">ID</th>
                    <th className="p-4 font-medium text-sm">Flag & Name</th>
                    <th className="p-4 font-medium text-sm">Code</th>
                    <th className="p-4 font-medium text-sm">Currency</th>
                    <th className="p-4 font-medium text-sm">Status</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {countries.map(c => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">{c.id}</td>
                      <td className="p-4 font-bold flex items-center gap-3">
                        {c.code ? (
                          <img src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} alt={c.name} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                        ) : c.icon ? (
                          <span className="text-xl">{c.icon}</span>
                        ) : null}
                        {c.name}
                      </td>
                      <td className="p-4">{c.code}</td>
                      <td className="p-4">{c.currency_symbol} {c.currency}</td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus('countries', c)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.is_enabled ? 'bg-[#00D97E]/20 text-[#00D97E]' : 'bg-red-500/20 text-red-500'}`}>
                          {c.is_enabled ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {c.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openModal(c)} className="text-white/50 hover:text-[#00E5FF] transition-colors p-2"><Edit2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "states" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="p-4 font-medium text-sm">ID</th>
                    <th className="p-4 font-medium text-sm">Flag & Name</th>
                    <th className="p-4 font-medium text-sm">Code</th>
                    <th className="p-4 font-medium text-sm">Country</th>
                    <th className="p-4 font-medium text-sm">Status</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {states.map(s => (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">{s.id}</td>
                      <td className="p-4 font-bold flex items-center gap-3">
                        {s.icon ? <span className="text-xl">{s.icon}</span> : null}
                        {s.name}
                      </td>
                      <td className="p-4">{s.code}</td>
                      <td className="p-4">{s.country || "ALL"}</td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus('states', s)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${s.is_enabled ? 'bg-[#00D97E]/20 text-[#00D97E]' : 'bg-red-500/20 text-red-500'}`}>
                          {s.is_enabled ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {s.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openModal(s)} className="text-white/50 hover:text-[#00E5FF] transition-colors p-2"><Edit2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "cities" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="p-4 font-medium text-sm">ID</th>
                    <th className="p-4 font-medium text-sm">Flag & Name</th>
                    <th className="p-4 font-medium text-sm">Code</th>
                    <th className="p-4 font-medium text-sm">State</th>
                    <th className="p-4 font-medium text-sm">Country</th>
                    <th className="p-4 font-medium text-sm">Status</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {cities.map(c => (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">{c.id}</td>
                      <td className="p-4 font-bold flex items-center gap-3">
                        {c.icon ? <span className="text-xl">{c.icon}</span> : null}
                        {c.name}
                      </td>
                      <td className="p-4">{c.code}</td>
                      <td className="p-4">{c.state || "ALL"}</td>
                      <td className="p-4">{c.country || "ALL"}</td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus('cities', c)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.is_enabled ? 'bg-[#00D97E]/20 text-[#00D97E]' : 'bg-red-500/20 text-red-500'}`}>
                          {c.is_enabled ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {c.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openModal(c)} className="text-white/50 hover:text-[#00E5FF] transition-colors p-2"><Edit2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "interests" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="p-4 font-medium text-sm">ID</th>
                    <th className="p-4 font-medium text-sm">Icon & Name</th>
                    <th className="p-4 font-medium text-sm">Gender Target</th>
                    <th className="p-4 font-medium text-sm">Status</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {interests.map(i => (
                    <tr key={i.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">{i.id}</td>
                      <td className="p-4 flex items-center gap-3">
                         <span className="text-2xl">{i.icon}</span>
                         <span className="font-bold">{i.name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${i.gender_target === 'male' ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : i.gender_target === 'female' ? 'bg-[#FF4D8D]/20 text-[#FF4D8D]' : 'bg-white/10 text-white'}`}>
                          {i.gender_target === 'all' ? 'Male and Female' : i.gender_target}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus('interests', i)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${i.is_enabled ? 'bg-[#00D97E]/20 text-[#00D97E]' : 'bg-red-500/20 text-red-500'}`}>
                          {i.is_enabled ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                          {i.is_enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => openModal(i)} className="text-white/50 hover:text-[#FF4D8D] transition-colors p-2"><Edit2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "relationTree" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="p-4 font-medium text-sm">ID</th>
                    <th className="p-4 font-medium text-sm">User ID</th>
                    <th className="p-4 font-medium text-sm">Related User ID</th>
                    <th className="p-4 font-medium text-sm">Related Name</th>
                    <th className="p-4 font-medium text-sm">Type</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {relationships.map(r => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">{r.id}</td>
                      <td className="p-4">{r.user_id} {r.user_username ? `(@${r.user_username})` : ''}</td>
                      <td className="p-4">{r.related_user_id || 'N/A'} {r.related_username ? `(@${r.related_username})` : ''}</td>
                      <td className="p-4">{r.related_name || 'N/A'}</td>
                      <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-[#00D97E]/20 text-[#00D97E] uppercase">{r.relationship_type}</span></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => openModal(r)} className="text-white/50 hover:text-[#00E5FF] transition-colors p-2"><Edit2 size={16}/></button>
                        <button onClick={() => deleteRelation(r.id)} className="text-white/50 hover:text-red-500 transition-colors p-2"><XCircle size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 space-y-6 max-w-lg">
              <div>
                <label className="text-sm text-white/70 mb-2 block font-medium">Default Post Character Limit</label>
                <input 
                  type="number" 
                  min="0"
                  value={generalSettings.default_post_character_limit ?? 500} 
                  onChange={e => setGeneralSettings({ ...generalSettings, default_post_character_limit: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#8B5CF6] transition-colors" 
                  placeholder="e.g. 500"
                />
                <p className="text-xs text-white/40 mt-2">
                  This limit applies globally to all users. Paid plans can override this default. Enter 0 for unlimited.
                </p>
              </div>
              
              <button 
                onClick={saveGeneralSettings}
                disabled={saving}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Save Post Limits'}
              </button>
            </div>
          )}
        </GlassPanel>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0f24] border border-white/10 rounded-2xl w-full max-w-md p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editingItem ? 'Edit' : 'Add'} {activeTab === 'countries' ? 'Country' : activeTab === 'states' ? 'State' : activeTab === 'cities' ? 'City' : activeTab === 'relationTree' ? 'Relationship' : 'Interest'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              {activeTab === 'countries' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Name</label>
                      <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Flag (Emoji)</label>
                      <div className="relative">
                        <input type="text" value={formData.icon || ''} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white outline-none focus:border-[#00E5FF]" />
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1">
                          <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute top-full mt-2 right-0 z-50">
                            <EmojiPicker 
                              theme="dark"
                              onEmojiClick={(emojiData: any) => {
                                setFormData({...formData, icon: emojiData.emoji});
                                setShowEmojiPicker(false);
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Code (e.g. US)</label>
                      <input type="text" value={formData.code} onChange={e=>setFormData({...formData, code: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Currency (e.g. USD)</label>
                      <input type="text" value={formData.currency} onChange={e=>setFormData({...formData, currency: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Currency Symbol (e.g. $)</label>
                    <input type="text" value={formData.currency_symbol} onChange={e=>setFormData({...formData, currency_symbol: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                  </div>
                </>
              ) : activeTab === 'states' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Name</label>
                      <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Flag (Emoji)</label>
                      <div className="relative">
                        <input type="text" value={formData.icon || ''} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white outline-none focus:border-[#00E5FF]" />
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1">
                          <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute top-full mt-2 right-0 z-50">
                            <EmojiPicker 
                              theme="dark"
                              onEmojiClick={(emojiData: any) => {
                                setFormData({...formData, icon: emojiData.emoji});
                                setShowEmojiPicker(false);
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Code (e.g. MH)</label>
                      <input type="text" value={formData.code || ''} onChange={e=>setFormData({...formData, code: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Country</label>
                      <select 
                        value={formData.country || ''} 
                        onChange={e=>setFormData({...formData, country: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF] appearance-none"
                      >
                        <option value="">Select Country</option>
                        {countries.filter(c => c.is_enabled).map(c => (
                          <option key={c.id} className="bg-[#0a0f24]" value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : activeTab === 'cities' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Name</label>
                      <input type="text" value={formData.name || ''} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Flag (Emoji)</label>
                      <div className="relative">
                        <input type="text" value={formData.icon || ''} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white outline-none focus:border-[#00E5FF]" />
                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1">
                          <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute top-full mt-2 right-0 z-50">
                            <EmojiPicker 
                              theme="dark"
                              onEmojiClick={(emojiData: any) => {
                                setFormData({...formData, icon: emojiData.emoji});
                                setShowEmojiPicker(false);
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Code (e.g. MUM)</label>
                      <input type="text" value={formData.code || ''} onChange={e=>setFormData({...formData, code: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Country</label>
                      <select 
                        value={formData.country || ''} 
                        onChange={e=>{
                          setFormData({
                            ...formData, 
                            country: e.target.value,
                            state: '' // Reset state when country changes
                          });
                        }} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF] appearance-none"
                      >
                        <option value="">Select Country</option>
                        {countries.filter(c => c.is_enabled).map(c => (
                          <option key={c.id} className="bg-[#0a0f24]" value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">State</label>
                    <select 
                      value={formData.state || ''} 
                      onChange={e=>setFormData({...formData, state: e.target.value})} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF] appearance-none"
                    >
                      <option value="">Select State</option>
                      {states
                        .filter(s => s.is_enabled && (!formData.country || s.country === formData.country))
                        .map(s => (
                          <option key={s.id} className="bg-[#0a0f24]" value={s.name}>{s.name}</option>
                        ))}
                    </select>
                  </div>
                </>
              ) : activeTab === 'relationTree' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">User ID (Owner)</label>
                      <input type="number" value={formData.user_id || ''} onChange={e=>setFormData({...formData, user_id: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Related User ID (Optional)</label>
                      <input type="number" value={formData.related_user_id || ''} onChange={e=>setFormData({...formData, related_user_id: e.target.value ? Number(e.target.value) : ''})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Related Name (Optional, if no user ID)</label>
                    <input type="text" value={formData.related_name || ''} onChange={e=>setFormData({...formData, related_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Relationship Type</label>
                    <select value={formData.relationship_type || ''} onChange={e=>setFormData({...formData, relationship_type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF] appearance-none">
                      <option value="">Select Type</option>
                      <option className="bg-[#0a0f24]" value="father">Father</option>
                      <option className="bg-[#0a0f24]" value="mother">Mother</option>
                      <option className="bg-[#0a0f24]" value="sibling">Sibling</option>
                      <option className="bg-[#0a0f24]" value="spouse">Spouse</option>
                      <option className="bg-[#0a0f24]" value="child">Child</option>
                      <option className="bg-[#0a0f24]" value="relative">Relative</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Notes (Optional)</label>
                    <textarea value={formData.notes || ''} onChange={e=>setFormData({...formData, notes: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" rows={3} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Name</label>
                    <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF]" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Icon (Emoji)</label>
                    <div className="relative">
                      <input type="text" value={formData.icon || ''} onChange={e=>setFormData({...formData, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white outline-none focus:border-[#00E5FF]" />
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1">
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute top-full mt-2 right-0 z-50">
                          <EmojiPicker 
                            theme="dark"
                            onEmojiClick={(emojiData: any) => {
                              setFormData({...formData, icon: emojiData.emoji});
                              setShowEmojiPicker(false);
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Gender Target</label>
                    <select value={formData.gender_target} onChange={e=>setFormData({...formData, gender_target: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-[#00E5FF] appearance-none">
                      <option className="bg-[#0a0f24]" value="all">Male and Female (Everyone)</option>
                      <option className="bg-[#0a0f24]" value="male">Male Only</option>
                      <option className="bg-[#0a0f24]" value="female">Female Only</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab !== 'relationTree' && (
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_enabled} onChange={e => setFormData({...formData, is_enabled: e.target.checked})} className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0" />
                    <span className="text-sm text-white">Enable this {activeTab === 'countries' ? 'Country' : 'Interest'} globally</span>
                  </label>
                </div>
              )}
              
              <button 
                onClick={saveItem}
                disabled={saving || (activeTab === 'relationTree' ? (!formData.user_id || !formData.relationship_type) : !formData.name)}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 mt-4 flex justify-center items-center"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
