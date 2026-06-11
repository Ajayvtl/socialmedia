'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageErrorBoundary } from '@/components/ui/PageErrorBoundary';
import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { useVaults, useCircles, useMemoryItems, useAddMemoryItem, useUpdateMemoryItem, useDeleteMemoryItem } from '../hooks/useMemoryWallet';
import { MemoryItem } from '../types/memoryWallet.types';
import { MemoryItemCard } from '../components/MemoryItemCard';
import { MemoryShareCard } from '../components/MemoryShareCard';
import { LivingCursor } from '@/components/ui/LivingCursor';
import { MemoryShareModal } from '../components/MemoryShareModal';
import { MemoryFocusModal } from '../components/MemoryFocusModal';
import { AutoCollage } from '../components/AutoCollage';
import { AutoStorybook } from '../components/AutoStorybook';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { AppImage } from '@/components/ui/AppImage';
import { LivingBackground } from '@/components/ui/LivingBackground';
import { TimeWarpSlider } from '../components/TimeWarpSlider';
import { 
  ChevronLeft, Users, Plus, Upload, Lock, Share2, 
  Settings, Image as ImageIcon, Video, Calendar, Loader2, BookOpen
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';

const MemoryCircleViewContent = () => {
  const router = useRouter();
  const params = useParams();
  const circleId = Number(params?.id);
  
  const { data: vaults = [] } = useVaults();
  const activeVault = vaults[0];

  const { data: circles = [], isLoading: isLoadingCircles } = useCircles(activeVault?.id);
  const circle = circles.find(c => c.id === circleId);

  const { data: items = [], isLoading: isLoadingItems } = useMemoryItems(activeVault?.id, circleId);
  const { mutate: addItem, isPending: isUploading } = useAddMemoryItem();
  const { mutate: updateItem } = useUpdateMemoryItem();
  const { mutate: deleteItem } = useDeleteMemoryItem();

  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [memoryDetails, setMemoryDetails] = useState({
    title: '',
    caption: '',
    location_name: '',
    memory_date: ''
  });
  const [selectedViewerItem, setSelectedViewerItem] = useState<any>(null);
  const [viewerZoom, setViewerZoom] = useState(1);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [sharingItem, setSharingItem] = useState<any>(null); // For external share modal
  const [feedShareItem, setFeedShareItem] = useState<any>(null); // For timeline post
  const [shareText, setShareText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [warpYear, setWarpYear] = useState<number | null>(null);
  const [isStorybookMode, setIsStorybookMode] = useState(false);
  
  // Smart Sections collapse state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const isLoading = isLoadingCircles || (!!circle && isLoadingItems);

  const filteredItems = items.filter(item => {
    // Type Filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'photo' && item.memory_type !== 'photo') return false;
      if (activeFilter === 'video' && item.memory_type !== 'video') return false;
      if (activeFilter === 'document' && item.memory_type !== 'document') return false;
    }
    
    // Time Warp Filter
    if (warpYear !== null) {
      const dateStr = item.memory_date || item.created_at;
      if (dateStr) {
        const itemYear = new Date(dateStr).getFullYear();
        if (itemYear !== warpYear) return false;
      }
    }
    
    return true;
  });

  // Group items by year and location/title for Auto-Collapse Smart Sections
  const smartGroups = React.useMemo(() => {
    const groups: Record<string, MemoryItem[]> = {};
    filteredItems.forEach(item => {
      let groupName = 'Uncategorized';
      if (item.memory_date) {
        const d = new Date(item.memory_date);
        groupName = `${d.getFullYear()}`;
        if (item.location_name) {
          groupName = `${item.location_name} ${groupName}`;
        }
      } else if (item.created_at) {
        groupName = `${new Date(item.created_at).getFullYear()}`;
      }
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredItems]);

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Extract all unique years from memories
  const availableYears = React.useMemo(() => {
    if (!items.length) return [];
    const years = new Set<number>();
    items.forEach(item => {
      const dateStr = item.memory_date || item.created_at;
      if (dateStr) {
        years.add(new Date(dateStr).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => a - b);
  }, [items]);

  // Set initial warp year to the latest year if not set
  useEffect(() => {
    if (availableYears.length > 0 && warpYear === null) {
      setWarpYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, warpYear]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleRealUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0 || !activeVault || !circle) return;

    try {
      setIsUploadingFiles(true);
      
      // Step 1: Upload raw media to S3 via the global media endpoint
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('files', selectedFiles[i]);
      }

      const mediaResponse = await api.post('/media/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!mediaResponse.data?.data) throw new Error('Failed to upload media');

      // Step 2: Tie the returned physical media IDs to the Memory Wallet
      const uploadedMedia = mediaResponse.data.data;
      
      // Since multiple parallel updates to the same vault storage row can cause DB deadlocks, 
      // we do sequential insertions.
      for (const media of uploadedMedia) {
        await addItem({
          vault_id: activeVault.id,
          circle_id: circle.id,
          media_file_id: media.id,
          title: memoryDetails.title || media.original_name || 'New Memory',
          caption: memoryDetails.caption || null,
          location_name: memoryDetails.location_name || null,
          memory_date: memoryDetails.memory_date || null,
          memory_type: media.media_type === 'video' ? 'video' : 'photo',
          visibility: 'circle'
        });
      }

      setUploadModalOpen(false);
      setSelectedFiles(null);
      setMemoryDetails({ title: '', caption: '', location_name: '', memory_date: '' });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload memories. Please try again.');
    } finally {
      setIsUploadingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleShareToFeed = async () => {
    if (!feedShareItem) return;
    try {
      setIsSharing(true);
      await api.post('/posts', {
        content: shareText || '',
        mediaUrl: feedShareItem.original_url || feedShareItem.url,
        mediaType: feedShareItem.memory_type,
        communityId: null
      });
      alert('Memory successfully shared to timeline!');
      setFeedShareItem(null);
      setShareText('');
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to share memory.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleFavorite = (item: any) => {
    updateItem({ itemId: item.id, data: { is_favorite: !item.is_favorite } });
  };

  if (!isLoading && !circle) {
    return (
      <PageContainer className="flex flex-col items-center justify-center py-32">
        <h2 className="text-2xl font-bold text-white mb-2">Circle Not Found</h2>
        <p className="text-[var(--color-text-secondary)] mb-6">This memory circle doesn't exist or you don't have access.</p>
        <Button onClick={() => router.push('/dapp/memory-wallet')}>Back to Wallet</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <LivingBackground theme={circle?.circle_type === 'family' ? 'ocean' : 'memory'} intensity="subtle" />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-4">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => router.push('/dapp/memory-wallet')}
            className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors text-white shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2 truncate">
              {circle?.name || 'Loading Circle...'}
              <Lock className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
            </h1>
            <p className="text-[var(--color-text-muted)] text-xs md:text-sm mt-0.5 md:mt-1 capitalize truncate">
              {circle?.circle_type} Circle • {items.length} Memories
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#050816] bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              You
            </div>
            {/* Mock other members */}
            <div className="w-8 h-8 rounded-full border-2 border-[#050816] bg-gray-600" />
            <div className="w-8 h-8 rounded-full border-2 border-[#050816] bg-gray-500" />
          </div>
                <Button variant="outline" size="sm" onClick={() => setUploadModalOpen(true)} className="border-white/20 hover:bg-white/10 hidden md:flex">
                  <Upload className="w-4 h-4 mr-2" />
                  Add Memory
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsStorybookMode(!isStorybookMode)} 
                  className={`border-white/20 transition-colors ${isStorybookMode ? 'bg-[#FF4D8D]/20 border-[#FF4D8D] text-white' : 'hover:bg-white/10'}`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  {isStorybookMode ? 'Exit Storybook' : 'Storybook'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsShareCardOpen(true)} className="border-white/20 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Circle
                </Button>
        </div>
      </div>

      <AsyncBoundary
        loading={isLoading}
        empty={!isLoading && items.length === 0}
        emptyTitle="No Memories Yet"
        emptyDesc={`Upload your first photo or video to the ${circle?.name || 'Circle'}.`}
        emptyActionLabel="Upload Memory"
        emptyOnAction={() => setUploadModalOpen(true)}
      >
        <div className="space-y-8 pb-24 md:pb-8">
          
          {/* Filters Bar */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar gap-4">
            <div className="flex items-center gap-4 md:gap-6 shrink-0">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`font-medium text-sm pb-4 -mb-[17px] transition-colors ${activeFilter === 'all' ? 'text-white border-b-2 border-[#8B5CF6]' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >All</button>
              <button 
                onClick={() => setActiveFilter('photo')}
                className={`font-medium text-sm pb-4 -mb-[17px] transition-colors ${activeFilter === 'photo' ? 'text-white border-b-2 border-[#8B5CF6]' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >Photos</button>
              <button 
                onClick={() => setActiveFilter('video')}
                className={`font-medium text-sm pb-4 -mb-[17px] transition-colors ${activeFilter === 'video' ? 'text-white border-b-2 border-[#8B5CF6]' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >Videos</button>
              <button 
                onClick={() => setActiveFilter('document')}
                className={`font-medium text-sm pb-4 -mb-[17px] transition-colors ${activeFilter === 'document' ? 'text-white border-b-2 border-[#8B5CF6]' : 'text-[var(--color-text-muted)] hover:text-white'}`}
              >Documents</button>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <button className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors">
                <Calendar className="w-5 h-5 md:w-5 md:h-5 w-4 h-4" />
              </button>
              <button className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors">
                <Settings className="w-5 h-5 md:w-5 md:h-5 w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Smart Auto-Collapse Sections */}
          <div className="space-y-12">
            {/* Upload Card Group */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
              <div 
                onClick={() => setUploadModalOpen(true)}
                className="aspect-[4/5] md:aspect-square rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
              >
                <div className="p-3 rounded-full bg-[var(--color-surface-hover)] group-hover:bg-[#8B5CF6]/20 transition-colors">
                  <Upload className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-text-muted)] group-hover:text-[#8B5CF6]" />
                </div>
                <span className="font-medium text-[var(--color-text-secondary)] group-hover:text-white text-xs md:text-sm">Upload</span>
              </div>
            </div>
            </div>

            {isStorybookMode && filteredItems.length > 0 ? (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <AutoStorybook 
                  memories={filteredItems}
                  title={circle?.name || 'Storybook'}
                  onMemoryClick={(item) => setSelectedViewerItem(item)}
                  onShare={(item) => setSharingItem(item)}
                  onFavorite={handleToggleFavorite}
                />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                {smartGroups.map(([groupName, groupItems]) => {
                  const parts = groupName.split(' ');
                  const year = parts.pop();
                  const location = parts.join(' ') || 'General';
                  const isCollapsed = collapsedGroups[groupName];

                  return (
                    <div key={groupName} className="relative">
                      {/* Smart Section Header */}
                      <div 
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => toggleGroup(groupName)}
                      >
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:via-white/40 transition-colors"></div>
                        <div className="flex flex-col items-center px-4">
                          <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">{year}</span>
                          <span className="text-[10px] uppercase tracking-widest text-[#00E5FF] font-bold">{location} • {groupItems.length} items</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/20 via-transparent to-transparent group-hover:from-white/40 transition-colors"></div>
                      </div>

                      {/* Section Content */}
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-6 pt-4">
                              <AutoCollage 
                                memories={groupItems}
                                onMemoryClick={(item) => setSelectedViewerItem(item)}
                                onShare={(item) => setSharingItem(item)}
                                onFavorite={handleToggleFavorite}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No memories found</h3>
                    <p className="text-white/50">Try adjusting your filters or upload some new ones.</p>
                  </div>
                )}
              </div>
            )}
          </div>
      </AsyncBoundary>

      {/* Real Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassPanel className="w-full max-w-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Upload to {circle?.name}</h2>
            
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            {!selectedFiles ? (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-xl border border-[var(--color-border)] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 flex flex-col items-center gap-3 transition-colors text-white"
                >
                  <ImageIcon className="w-8 h-8 text-blue-400" />
                  <span className="font-medium">Photos</span>
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 rounded-xl border border-[var(--color-border)] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10 flex flex-col items-center gap-3 transition-colors text-white"
                >
                  <Video className="w-8 h-8 text-pink-400" />
                  <span className="font-medium">Videos</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{selectedFiles.length} file(s) selected</span>
                  <button onClick={() => setSelectedFiles(null)} className="text-xs text-[#8B5CF6] hover:underline">Change</button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Title (Optional)</label>
                    <input 
                      value={memoryDetails.title}
                      onChange={e => setMemoryDetails({...memoryDetails, title: e.target.value})}
                      placeholder="e.g. Diya's Wedding"
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Caption</label>
                    <textarea 
                      value={memoryDetails.caption}
                      onChange={e => setMemoryDetails({...memoryDetails, caption: e.target.value})}
                      placeholder="Write something about these memories..."
                      rows={2}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Location</label>
                      <input 
                        value={memoryDetails.location_name}
                        onChange={e => setMemoryDetails({...memoryDetails, location_name: e.target.value})}
                        placeholder="e.g. Goa, India"
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Date</label>
                      <input 
                        type="date"
                        value={memoryDetails.memory_date}
                        onChange={e => setMemoryDetails({...memoryDetails, memory_date: e.target.value})}
                        className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button 
                variant="ghost" 
                onClick={() => { setUploadModalOpen(false); setSelectedFiles(null); }} 
                disabled={isUploadingFiles || isUploading}
              >Cancel</Button>
              {selectedFiles ? (
                <Button 
                  onClick={handleRealUpload}
                  disabled={isUploadingFiles || isUploading} 
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-none"
                >
                  {(isUploadingFiles || isUploading) ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
                  ) : `Upload ${selectedFiles.length} Memory`}
                </Button>
              ) : (
                <Button disabled className="bg-[var(--color-surface-hover)] text-white/50 border-none cursor-default">
                  Select files above
                </Button>
              )}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Mobile Floating Action Button for Adding Memory */}
      <button 
        onClick={() => setUploadModalOpen(true)}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-[#8B5CF6] to-[#E879F9] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] z-40 text-white active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Fullscreen Photo/Video Viewer */}
      {selectedViewerItem && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-12 cursor-pointer overflow-hidden"
          onClick={() => { setSelectedViewerItem(null); setViewerZoom(1); }}
        >
          <div className="relative w-full h-full max-w-6xl flex items-center justify-center flex-col gap-4 overflow-hidden">
            {/* Close Button */}
            <button 
              className="absolute top-0 right-0 md:-right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors z-50"
              onClick={(e) => { e.stopPropagation(); setSelectedViewerItem(null); setViewerZoom(1); }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoom Controls */}
            <div 
              className="absolute bottom-20 right-4 flex flex-col gap-2 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewerZoom(prev => Math.min(prev + 0.5, 4))}
                className="p-3 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewerZoom(prev => Math.max(prev - 0.5, 1))}
                className="p-3 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>

            {/* Media Content */}
            <div 
              className="relative w-full h-full flex items-center justify-center overflow-auto hide-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div 
                className="transition-transform duration-200 ease-out flex items-center justify-center"
                style={{ transform: `scale(${viewerZoom})`, transformOrigin: 'center center' }}
              >
                {selectedViewerItem.memory_type === 'video' ? (
                  <video 
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedViewerItem.url}`} 
                    controls 
                    autoPlay
                    className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                  />
                ) : (
                  <AppImage 
                    src={selectedViewerItem.original_url || selectedViewerItem.url} 
                    alt={selectedViewerItem.title || 'Memory'} 
                    className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
                  />
                )}
              </div>
            </div>

            {/* Details Footer */}
            <div className="text-center mt-2 cursor-default" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-white text-xl font-bold">{selectedViewerItem.title || 'Memory'}</h3>
              {selectedViewerItem.caption && <p className="text-white/70 mt-1 max-w-2xl mx-auto">{selectedViewerItem.caption}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Edit Details Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassPanel className="w-full max-w-md p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Edit Memory Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Title</label>
                <input 
                  value={editingItem.title || ''}
                  onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                  placeholder="Memory Title"
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Caption</label>
                <textarea 
                  value={editingItem.caption || ''}
                  onChange={e => setEditingItem({...editingItem, caption: e.target.value})}
                  placeholder="Write a caption..."
                  rows={2}
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Location</label>
                  <input 
                    value={editingItem.location_name || ''}
                    onChange={e => setEditingItem({...editingItem, location_name: e.target.value})}
                    placeholder="e.g. Goa, India"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Date</label>
                  <input 
                    type="date"
                    value={editingItem.memory_date ? editingItem.memory_date.substring(0, 10) : ''}
                    onChange={e => setEditingItem({...editingItem, memory_date: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
              <Button onClick={() => { 
                updateItem({ itemId: editingItem.id, data: {
                  title: editingItem.title,
                  caption: editingItem.caption,
                  location_name: editingItem.location_name,
                  memory_date: editingItem.memory_date,
                } });
                setEditingItem(null); 
              }} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-none">
                Save Changes
              </Button>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Share as Post Modal */}
      {feedShareItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassPanel className="w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">Share Memory to Feed</h2>
            <div className="flex gap-3 mb-4 p-3 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
               <AppImage src={feedShareItem.thumbnail_url || feedShareItem.url} alt="thumbnail" className="w-16 h-16 rounded-lg object-cover" />
               <div>
                 <p className="text-sm font-medium text-white">{feedShareItem.title || 'Memory'}</p>
                 <p className="text-xs text-[var(--color-text-muted)]">This will be attached to your post.</p>
               </div>
            </div>
            <div>
              <textarea 
                value={shareText}
                onChange={e => setShareText(e.target.value)}
                placeholder="What's on your mind?..."
                rows={4}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-[#8B5CF6] focus:outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button variant="ghost" disabled={isSharing} onClick={() => setFeedShareItem(null)}>Cancel</Button>
              <Button onClick={handleShareToFeed} disabled={isSharing} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-none flex items-center gap-2">
                {isSharing && <Loader2 className="w-4 h-4 animate-spin" />}
                Post to Feed
              </Button>
            </div>
          </GlassPanel>
        </div>
      )}

      {isShareCardOpen && (
        <MemoryShareCard
          title={circle?.name || 'My Memory Circle'}
          relationshipName={circle?.circle_type === 'family' ? 'Family Circle' : `${circle?.circle_type || 'Custom'} Circle`}
          stats={{
            yearsTogether: new Date().getFullYear() - (circle?.created_at ? new Date(circle.created_at).getFullYear() : new Date().getFullYear()) || 1,
            memories: items.length,
            events: items.filter(i => i.event_id).length || 2,
            videos: items.filter(i => i.memory_type === 'video').length
          }}
          photos={items.filter(i => i.memory_type === 'photo').map(i => (i as any).original_url || i.url).slice(0, 5)}
          onShare={() => {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mem.aurora.app';
            const shareUrl = `${baseUrl}/dapp/memory-wallet/circles/${circle?.id || '2'}?invite=GT26ABX`;
            navigator.clipboard.writeText(shareUrl);
            alert(`A unique token has been generated: ${shareUrl}. Copied to clipboard!`);
            setIsShareCardOpen(false);
          }}
          onClose={() => setIsShareCardOpen(false)}
        />
      )}

      <MemoryShareModal item={sharingItem} onClose={() => setSharingItem(null)} />
      
      <MemoryFocusModal 
        item={selectedViewerItem} 
        onClose={() => setSelectedViewerItem(null)} 
        onShare={(item) => setSharingItem(item)}
        onFavorite={(item) => handleToggleFavorite(item)}
      />

      {availableYears.length > 1 && warpYear !== null && (
        <TimeWarpSlider 
          years={availableYears} 
          currentYear={warpYear} 
          onChange={setWarpYear} 
        />
      )}
    </PageContainer>
  );
};

export const MemoryCircleView = () => (
  <PageErrorBoundary>
    <MemoryCircleViewContent />
  </PageErrorBoundary>
);

export default MemoryCircleView;
