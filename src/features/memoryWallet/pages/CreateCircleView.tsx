'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageErrorBoundary } from '@/components/ui/PageErrorBoundary';
import { useVaults, useCreateCircle } from '../hooks/useMemoryWallet';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { ChevronLeft, Users, Image as ImageIcon, Heart, Calendar, GraduationCap, Briefcase, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CreateCircleViewContent = () => {
  const router = useRouter();
  const { data: vaults = [] } = useVaults();
  const { mutate: createCircle, isPending } = useCreateCircle();
  const activeVault = vaults[0];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [circleType, setCircleType] = useState('family');

  const circleTypes = [
    { id: 'family', label: 'Family', icon: Users },
    { id: 'wedding', label: 'Wedding', icon: Heart },
    { id: 'travel', label: 'Travel', icon: Calendar },
    { id: 'college', label: 'College', icon: GraduationCap },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'legacy', label: 'Legacy', icon: Clock },
    { id: 'custom', label: 'Custom', icon: ImageIcon },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVault || !name.trim()) return;

    createCircle(
      { vaultId: activeVault.id, data: { name, description, circle_type: circleType as any } },
      {
        onSuccess: (data) => {
          // data returned might have the new circle ID, if so, redirect there
          if (data && data.id) {
            router.push(`/dapp/memory-wallet/circles/${data.id}`);
          } else {
            router.push('/dapp/memory-wallet');
          }
        }
      }
    );
  };

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Create Memory Circle</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        <GlassPanel className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Circle Type</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {circleTypes.map(type => {
                  const Icon = type.icon;
                  const isSelected = circleType === type.id;
                  return (
                    <div 
                      key={type.id}
                      onClick={() => setCircleType(type.id)}
                      className={`cursor-pointer rounded-xl p-4 flex flex-col items-center gap-2 border-2 transition-all ${
                        isSelected 
                          ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-white' 
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[#8B5CF6]/50 hover:text-white'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Circle Name</label>
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Diya's Wedding 2024"
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What memories will you share here?"
                rows={3}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all resize-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isPending || !name.trim()} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-none">
                {isPending ? 'Creating...' : 'Create Circle'}
              </Button>
            </div>

          </form>
        </GlassPanel>
      </div>
    </PageContainer>
  );
};

export const CreateCircleView = () => (
  <PageErrorBoundary>
    <CreateCircleViewContent />
  </PageErrorBoundary>
);

export default CreateCircleView;
