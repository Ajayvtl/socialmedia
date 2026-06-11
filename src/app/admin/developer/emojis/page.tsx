"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";

export default function AdminEmojisPage() {
  const [emojis, setEmojis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shortcode, setShortcode] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchEmojis = async () => {
    try {
      const res = await api.get('/emojis');
      setEmojis(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmojis();
  }, []);

  const handleAddEmoji = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcode || !imageUrl) return;
    try {
      await api.post('/emojis/admin', { shortcode, imageUrl });
      setShortcode("");
      setImageUrl("");
      fetchEmojis();
    } catch (err) {
      console.error(err);
      alert("Failed to add emoji. Ensure shortcode is unique.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await api.delete(`/emojis/admin/${id}`);
      fetchEmojis();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Custom Emojis Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassPanel className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Plus className="w-5 h-5 text-[#00E5FF]"/> Add New Emoji</h2>
          <form onSubmit={handleAddEmoji} className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Shortcode</label>
              <input 
                type="text" 
                value={shortcode}
                onChange={e => setShortcode(e.target.value)}
                placeholder="e.g. pepe_happy"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Image URL</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#00E5FF] outline-none"
              />
            </div>
            
            {imageUrl && (
              <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
                <span className="text-sm text-white/50">Preview:</span>
                <img src={imageUrl} className="w-10 h-10 object-contain" alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            <button type="submit" className="w-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity">
              Add Custom Emoji
            </button>
          </form>
        </GlassPanel>

        <GlassPanel className="p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-[#FF4D8D]"/> Installed Custom Emojis</h2>
          
          {isLoading ? (
            <div className="text-white/50">Loading...</div>
          ) : emojis.length === 0 ? (
            <div className="text-white/50 py-10 text-center">No custom emojis installed yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {emojis.map(e => (
                <div key={e.id} className="bg-black/20 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3 relative group">
                  <button 
                    onClick={() => handleDelete(e.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                  <img src={e.image_url} alt={e.shortcode} className="w-12 h-12 object-contain" />
                  <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-1 rounded">:{e.shortcode}:</span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
