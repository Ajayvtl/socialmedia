import React, { useState, useEffect } from 'react';
import { MemoryItem } from '../types/memoryWallet.types';
import { X, Copy, Check, Twitter, Send, MessagesSquare, Users, Globe, Loader2 } from 'lucide-react';
import { AppImage } from '@/components/ui/AppImage';
import api from '@/lib/api';

interface MemoryShareModalProps {
  item: MemoryItem | null;
  onClose: () => void;
}

export const MemoryShareModal: React.FC<MemoryShareModalProps> = ({ item, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (item) {
      // If we already have a token locally attached (if we loaded it), use it, otherwise fetch
      api.post(`/memory-wallet/items/${item.id}/share`)
        .then(res => {
          setShareToken(res.data?.data?.share_token);
        })
        .catch(err => console.error('Failed to generate share token', err))
        .finally(() => setIsLoading(false));
    }
  }, [item]);

  if (!item) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://aurora.app';
  const shareUrl = shareToken ? `${baseUrl}/s/${shareToken}` : 'Generating link...';
  
  const handleCopy = () => {
    if (!shareToken) return;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-[#111827] border border-[#374151] rounded-3xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white z-10 transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Share Card Preview */}
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          <AppImage
            src={item.thumbnail_url || item.url || ''}
            alt="Preview"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#8B5CF6] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                {item.visibility === 'circle' ? 'Family Circle' : 'Memory Vault'}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white leading-tight mb-1">
              {item.title || 'Shared Memory Journey'}
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium text-white/70 mt-2">
              <div className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> 1 Memory</div>
              <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Private Link</div>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="p-6">
          <p className="text-sm text-gray-400 mb-4 font-medium">
            Share this relationship-aware memory experience. Anyone with the link can view the interactive Timeline and Spatial Photos.
          </p>

          <div className="flex items-center gap-2 p-1 bg-[#1F2937] border border-[#374151] rounded-xl mb-6">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              className="flex-1 bg-transparent text-sm text-white px-3 focus:outline-none"
            />
            <button 
              onClick={handleCopy}
              disabled={isLoading || !shareToken}
              className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#8B5CF6]/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isLoading ? 'Wait' : isCopied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <a href={shareToken ? `https://wa.me/?text=View%20this%20memory%20on%20Aurora:%20${shareUrl}` : '#'} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors ${!shareToken && 'opacity-50 pointer-events-none'}`}>
              <MessagesSquare className="w-6 h-6" />
              <span className="text-xs font-bold">WhatsApp</span>
            </a>
            <a href={shareToken ? `https://twitter.com/intent/tweet?url=${shareUrl}&text=Check%20out%20this%20memory%20on%20Aurora` : '#'} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-black hover:bg-white/5 border border-white/10 text-white transition-colors ${!shareToken && 'opacity-50 pointer-events-none'}`}>
              <Twitter className="w-6 h-6" />
              <span className="text-xs font-bold">X</span>
            </a>
            <a href={shareToken ? `https://t.me/share/url?url=${shareUrl}&text=View%20this%20memory%20on%20Aurora` : '#'} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] transition-colors ${!shareToken && 'opacity-50 pointer-events-none'}`}>
              <Send className="w-6 h-6" />
              <span className="text-xs font-bold">Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
