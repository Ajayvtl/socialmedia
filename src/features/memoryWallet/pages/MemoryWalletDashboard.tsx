'use client';

import React, { useEffect } from 'react';
import { PageErrorBoundary } from '@/components/ui/PageErrorBoundary';
import { AsyncBoundary } from '@/components/ui/AsyncBoundary';
import { useVaults, useInitializeVault, useCircles, useMemoryItems, useUpdateMemoryItem } from '../hooks/useMemoryWallet';
import { MemoryItemCard } from '../components/MemoryItemCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Plus, Search, Bell, Image as ImageIcon, Users, 
  Calendar, Share2, Shield, Play, ChevronRight, 
  Archive, Clock, FolderHeart, Trash2, Sun
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AppImage } from '@/components/ui/AppImage';
import { LifePlayback } from '../components/LifePlayback';
import { MemoryFocusModal } from '../components/MemoryFocusModal';
import { MemoryShareModal } from '../components/MemoryShareModal';
import { MemoryItem } from '../types/memoryWallet.types';
import { LivingBackground } from '@/components/ui/LivingBackground';
import { LivingCursor } from '@/components/ui/LivingCursor';

const MemoryWalletDashboardContent = () => {
  const { data: vaults = [], isLoading: isLoadingVaults, error: vaultError } = useVaults();
  const { mutate: initVault, isPending: isInitializing } = useInitializeVault();
  const router = useRouter();
  const [selectedMemory, setSelectedMemory] = React.useState<MemoryItem | null>(null);
  const [shareMemory, setShareMemory] = React.useState<MemoryItem | null>(null);

  const activeVault = vaults[0];
  const { data: circles = [], isLoading: isLoadingCircles } = useCircles(activeVault?.id);
  const { data: recentMemories = [], isLoading: isLoadingItems } = useMemoryItems(activeVault?.id);
  const { mutate: updateItem } = useUpdateMemoryItem();

  useEffect(() => {
    if (!isLoadingVaults && vaults.length === 0 && !isInitializing && !vaultError) {
      initVault();
    }
  }, [isLoadingVaults, vaults.length, isInitializing, vaultError, initVault]);

  const isLoading = isLoadingVaults || isInitializing || (!!activeVault && isLoadingCircles) || (!!activeVault && isLoadingItems);

  // Storage calculation for the UI
  const storageUsed = activeVault ? (activeVault.used_storage_bytes / (1024 * 1024 * 1024)).toFixed(1) : '0';
  const storageLimit = activeVault ? (activeVault.storage_limit_bytes / (1024 * 1024 * 1024)).toFixed(0) : '50';
  const storagePercentage = Math.min((parseFloat(storageUsed) / parseFloat(storageLimit)) * 100, 100);

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full text-white relative">
      <LivingBackground theme="aurora" intensity="subtle" />
      
      {/* Mobile Top Header (Visible only on mobile) */}
      <div className="flex md:hidden items-center justify-between p-4 sticky top-0 z-20 bg-[#050816]/80 backdrop-blur-md border-b border-[var(--color-border)]">
        <h1 className="text-xl font-bold">Memory Wallet</h1>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-[var(--color-text-muted)]" />
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10" />
        </div>
      </div>

      {/* LEFT SIDEBAR (Web View) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md h-screen sticky top-0 overflow-y-auto shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF]">AURORA</h2>
        </div>

        <div className="px-4 flex-1 flex flex-col gap-6">
          {/* User Profile Info */}
          <div className="flex items-center gap-3 p-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600" />
            <div>
              <h3 className="text-sm font-bold">Ajay Kumar <span className="text-[10px] text-yellow-400">👑</span></h3>
              <p className="text-xs text-[var(--color-text-muted)]">Premium Family Plan</p>
            </div>
          </div>

          {/* Sub Navigation */}
          <nav className="flex flex-col gap-1">
            <button className="flex items-center gap-3 px-4 py-3 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xl font-medium text-sm transition-colors">
              <Archive className="w-5 h-5" /> Memory Wallet
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors">
              <Clock className="w-5 h-5" /> Timeline
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors">
              <Users className="w-5 h-5" /> Circles
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors">
              <Calendar className="w-5 h-5" /> Milestones
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors">
              <FolderHeart className="w-5 h-5" /> Vaults
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors">
              <Share2 className="w-5 h-5" /> Shared With Me
            </button>
            <button onClick={() => router.push('/dapp/memory-wallet/legacy')} className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors mt-4">
              <Shield className="w-5 h-5" /> Legacy Vault
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-hover)] rounded-xl font-medium text-sm transition-colors">
              <Trash2 className="w-5 h-5" /> Trash
            </button>
          </nav>

          {/* Storage Widget (Web) */}
          <div className="mt-auto p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">Storage</span>
              <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
            </div>
            <div className="text-xl font-bold">
              {storageUsed} GB <span className="text-sm font-normal text-[var(--color-text-muted)]">/ {storageLimit} GB used</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
              <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${storagePercentage}%` }} />
            </div>
            <div className="text-xs text-[var(--color-text-muted)] mt-1">{(parseFloat(storageLimit) - parseFloat(storageUsed)).toFixed(1)} GB free</div>
            <button className="mt-2 w-full py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-yellow-500/20">
              👑 Manage Plan
            </button>
          </div>

          {/* Upgrade Banner (Web) */}
          <div className="p-5 bg-gradient-to-br from-[#8B5CF6]/20 to-[#4C1D95]/40 border border-[#8B5CF6]/30 rounded-2xl relative overflow-hidden group mb-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Users className="w-24 h-24" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2 relative z-10">Upgrade to Family Vault</h4>
            <p className="text-xs text-[var(--color-text-muted)] mb-4 relative z-10">200 GB shared storage for your family</p>
            <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg text-sm font-bold transition-colors relative z-10">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 w-full max-w-full overflow-y-auto pb-32">
        {/* Mobile Storage Banner */}
        <div className="md:hidden m-4 p-5 bg-gradient-to-r from-[#111827] to-[#1f2937] border border-[#374151] rounded-2xl mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-400">Your Storage</span>
            <span className="text-xs text-gray-500">{storageLimit} GB Plan</span>
          </div>
          <div className="text-2xl font-bold text-white mb-3">
            {storageUsed} GB <span className="text-sm font-normal text-gray-400">/ {storageLimit} GB used</span>
          </div>
          <div className="h-2 w-full bg-[#050816] rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] rounded-full" style={{ width: `${storagePercentage}%` }} />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400">{(parseFloat(storageLimit) - parseFloat(storageUsed)).toFixed(1)} GB free</span>
            <button className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1">👑 Manage Plan</button>
          </div>
        </div>

        {/* Padding container for content below the banner */}
        <div className="px-4 md:px-8 space-y-8">

          {/* Mobile Quick Access Pills */}
          <div className="md:hidden mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Quick Access</h2>
              <span className="text-xs text-[#8B5CF6]">View All</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center justify-center p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl gap-2 active:scale-95 transition-transform">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Memories</span>
              </button>
              <button onClick={() => router.push('/dapp/memory-wallet/circles')} className="flex flex-col items-center justify-center p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl gap-2 active:scale-95 transition-transform">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Circles</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl gap-2 active:scale-95 transition-transform">
                <Calendar className="w-5 h-5 text-pink-400" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Milestones</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl gap-2 active:scale-95 transition-transform">
                <FolderHeart className="w-5 h-5 text-emerald-400" />
                <span className="text-[10px] text-[var(--color-text-muted)] font-medium">Vaults</span>
              </button>
            </div>
          </div>

          {/* Web Top Header Area */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Memory Wallet</h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">Your life moments, beautifully organized.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input 
                  type="text" 
                  placeholder="Search memories, people, places..." 
                  className="w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full py-2.5 pl-10 pr-4 text-sm focus:border-[#8B5CF6] focus:outline-none transition-colors"
                />
              </div>
              <button onClick={() => router.push('/dapp/memory-wallet/legacy')} className="p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                <Shield className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]">
                <Sun className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#8B5CF6] rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/10" />
            </div>
          </div>

          {/* Web Stats Grid */}
          <div className="hidden md:grid grid-cols-4 gap-4 mb-10">
            <Card className="p-5 flex flex-col justify-between border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg hover:border-[#8B5CF6]/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Total Memories</p>
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-[#8B5CF6]" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{recentMemories.length || 0}</h3>
              <p className="text-xs text-emerald-400 mt-2 font-medium">+124 this month</p>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg hover:border-[#8B5CF6]/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Memory Circles</p>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">{circles.length || 0}</h3>
              <p className="text-xs text-emerald-400 mt-2 font-medium">+2 this month</p>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg hover:border-[#8B5CF6]/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Milestones</p>
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-pink-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">24</h3>
              <p className="text-xs text-yellow-400 mt-2 font-medium">Upcoming 3</p>
            </Card>

            <Card className="p-5 flex flex-col justify-between border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg hover:border-[#8B5CF6]/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">Shared With</p>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white">15</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-2 font-medium">People</p>
            </Card>
          </div>

          {/* Life Journey Timeline */}
          {!isLoadingItems && recentMemories.length > 0 && (
            <LifePlayback memories={recentMemories} onMemoryClick={(mem) => setSelectedMemory(mem)} />
          )}

          <AsyncBoundary
            loading={isLoading}
            error={vaultError}
            empty={!isLoading && !!activeVault && circles.length === 0 && recentMemories.length === 0}
            emptyTitle="No Memories Yet"
            emptyDesc="Create your first Memory Circle or upload a memory to start organizing."
            emptyActionLabel="Create Circle"
            emptyOnAction={() => router.push('/dapp/memory-wallet/circles/new')}
          >
            <div className="space-y-8 md:space-y-10 pb-[100px] md:pb-8">
              
              {/* Memory Circles Section (Horizontal Scroll on Mobile, Flex Wrap/Grid on Web) */}
              <div className="space-y-4 md:order-1 order-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-white">Memory Circles</h2>
                  <button onClick={() => router.push('/dapp/memory-wallet/circles')} className="text-xs md:text-sm text-[#8B5CF6] md:text-[var(--color-text-muted)] md:hover:text-white font-medium">View All</button>
                </div>
                
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                  {/* Web layout matches the design: Cards on the left, Create Circle dashed card on the right */}
                  {circles.map((circle, i) => (
                    <div 
                      key={circle.id} 
                      onClick={() => router.push(`/dapp/memory-wallet/circles/${circle.id}`)}
                      className="flex-none w-[160px] md:w-[220px] aspect-[4/5] rounded-3xl relative overflow-hidden group cursor-pointer shadow-lg"
                    >
                      <AppImage 
                        src={`https://source.unsplash.com/random/400x500?${circle.circle_type}&sig=${i}`}
                        alt={circle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/40 to-transparent opacity-90" />
                      
                      <div className="absolute bottom-0 left-0 w-full p-4 md:p-5">
                        <div className="flex -space-x-2 mb-3">
                          <div className="w-7 h-7 rounded-full border-2 border-[#050816] bg-purple-500" />
                          <div className="w-7 h-7 rounded-full border-2 border-[#050816] bg-pink-500" />
                          <div className="w-7 h-7 rounded-full border-2 border-[#050816] bg-indigo-500 flex items-center justify-center text-[9px] text-white font-bold">+2</div>
                        </div>
                        <h3 className="font-bold text-white text-base md:text-lg line-clamp-1">{circle.name}</h3>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1 font-medium">{circle.memory_count || 0} Memories</p>
                      </div>
                    </div>
                  ))}

                  {/* Create Circle Button */}
                  <div 
                    onClick={() => router.push('/dapp/memory-wallet/circles/new')}
                    className="flex-none w-[160px] md:w-[220px] aspect-[4/5] rounded-3xl border-2 border-dashed border-[var(--color-border)] hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="p-3">
                      <Plus className="w-8 h-8 text-[var(--color-text-muted)] group-hover:text-[#8B5CF6] transition-colors" />
                    </div>
                    <span className="font-bold text-[var(--color-text-secondary)] group-hover:text-[#8B5CF6] text-sm md:text-base transition-colors">Create Circle</span>
                  </div>
                </div>
              </div>

              {/* Recent Memories Section (Web: Grid, Mobile: Horizontal scroll) */}
              <div className="space-y-4 md:order-2 order-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-white">Recent Memories</h2>
                  
                  {/* Web filters */}
                  <div className="hidden md:flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full p-1 gap-1">
                    <button className="px-5 py-1.5 rounded-full bg-[#8B5CF6] text-white text-xs font-bold">All</button>
                    <button className="px-5 py-1.5 rounded-full text-[var(--color-text-muted)] hover:text-white text-xs font-bold transition-colors">Photos</button>
                    <button className="px-5 py-1.5 rounded-full text-[var(--color-text-muted)] hover:text-white text-xs font-bold transition-colors">Videos</button>
                    <button className="px-5 py-1.5 rounded-full text-[var(--color-text-muted)] hover:text-white text-xs font-bold transition-colors">Documents</button>
                  </div>
                  
                  {/* Mobile View All */}
                  <button className="md:hidden text-xs text-[#8B5CF6] font-medium">View All</button>
                </div>
                
                {/* Mobile: Horizontal Scroll, Web: Grid */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 md:gap-5 pb-4 md:pb-0">
                  {recentMemories.slice(0, 8).map(item => (
                    <div key={item.id} className="flex-none w-[200px] md:w-auto h-auto">
                      <MemoryItemCard 
                        item={item} 
                        onClick={() => setSelectedMemory(item)} 
                        onShare={(item) => setShareMemory(item)}
                        onFavorite={(item) => {
                          updateItem({ itemId: item.id, data: { is_favorite: !item.is_favorite } });
                        }}
                      />
                    </div>
                  ))}
                  
                  {recentMemories.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-3xl w-full">
                      <ImageIcon className="w-12 h-12 text-[var(--color-text-muted)] mb-3" />
                      <p className="text-[var(--color-text-secondary)] text-sm font-medium">No recent memories found.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Legacy Vault Promo Banner */}
              <div className="hidden md:flex order-3 bg-[#1A1435] border border-[#8B5CF6]/30 rounded-[32px] relative overflow-hidden p-10 items-center justify-between shadow-[0_0_40px_rgba(139,92,246,0.1)]">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.4),transparent_70%)] pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Legacy Vault</h3>
                    <p className="text-[var(--color-text-muted)] font-medium">Preserve your most precious memories for your loved ones.</p>
                  </div>
                </div>
                <button onClick={() => router.push('/dapp/memory-wallet/legacy')} className="px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl font-bold flex items-center gap-2 relative z-10 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  Go to Legacy Vault <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </AsyncBoundary>
        </div>
      </main>

      <MemoryFocusModal 
        item={selectedMemory} 
        onClose={() => setSelectedMemory(null)} 
        onShare={(item) => setShareMemory(item)}
        onFavorite={(item) => {
          updateItem({ itemId: item.id, data: { is_favorite: !item.is_favorite } });
        }}
      />
      <MemoryShareModal item={shareMemory} onClose={() => setShareMemory(null)} />

      {/* Mobile Floating Action Button */}
      <button 
        onClick={() => router.push('/dapp/memory-wallet/circles/new')}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] z-50 text-white active:scale-95 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      <LivingCursor />
    </div>
  );
};

export const MemoryWalletDashboard = () => (
  <PageErrorBoundary>
    <MemoryWalletDashboardContent />
  </PageErrorBoundary>
);

export default MemoryWalletDashboard;
