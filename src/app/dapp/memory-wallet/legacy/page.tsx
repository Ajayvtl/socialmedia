'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageErrorBoundary } from '@/components/ui/PageErrorBoundary';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ShieldAlert, Heart, Clock, UserPlus, CheckCircle2, Shield, Settings, Mail, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  useVaults, 
  useBeneficiaries, 
  useAddBeneficiary, 
  useDeleteBeneficiary, 
  useLegacyTrigger, 
  useSetLegacyTrigger,
  useLegacyCheckIn
} from '@/features/memoryWallet/hooks/useMemoryWallet';

const LegacyGovernanceContent = () => {
  const router = useRouter();
  const { data: vaults = [] } = useVaults();
  const activeVault = vaults[0];

  const { data: beneficiaries = [], isLoading: isLoadingBen } = useBeneficiaries(activeVault?.id);
  const { data: trigger, isLoading: isLoadingTrigger } = useLegacyTrigger(activeVault?.id);

  const { mutate: addBeneficiary, isPending: isAddingBen } = useAddBeneficiary();
  const { mutate: deleteBeneficiary } = useDeleteBeneficiary();
  const { mutate: setTrigger, isPending: isSettingTrigger } = useSetLegacyTrigger();
  const { mutate: checkIn } = useLegacyCheckIn();

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newBen, setNewBen] = useState({ name: '', email: '', relationship: '', access: 'view' });

  const handleAddBen = () => {
    if (!newBen.name || !newBen.email || !activeVault) return;
    addBeneficiary({
      vault_id: activeVault.id,
      beneficiary_name: newBen.name,
      beneficiary_email: newBen.email,
      relationship: newBen.relationship,
      access_level: newBen.access
    }, {
      onSuccess: () => {
        setAddModalOpen(false);
        setNewBen({ name: '', email: '', relationship: '', access: 'view' });
      }
    });
  };

  const handleTriggerChange = (type: string, days?: number) => {
    if (!activeVault) return;
    setTrigger({
      vault_id: activeVault.id,
      trigger_type: type,
      inactivity_days: days
    });
  };

  if (!activeVault) {
    return <PageContainer className="py-20 text-center text-white">Loading vault...</PageContainer>;
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4">
        <button 
          onClick={() => router.push('/dapp/memory-wallet')}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors text-white shrink-0"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-[#8B5CF6]" />
            Legacy Governance
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Ensure your memories are safely passed on to your loved ones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Beneficiaries */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" /> 
                  Beneficiaries
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">People who will inherit your vault.</p>
              </div>
              <Button onClick={() => setAddModalOpen(true)} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-none gap-2">
                <UserPlus className="w-4 h-4" /> Add
              </Button>
            </div>

            {isLoadingBen ? (
              <div className="text-white/50 text-center py-8">Loading...</div>
            ) : beneficiaries.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-[var(--color-border)] rounded-xl">
                <Heart className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
                <p className="text-white font-medium">No Beneficiaries Added</p>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">Add loved ones to inherit your memories.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {beneficiaries.map(ben => (
                  <div key={ben.id} className="flex items-center justify-between p-4 bg-[var(--color-surface-hover)] rounded-xl border border-[var(--color-border)]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center text-white font-bold">
                        {ben.beneficiary_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{ben.beneficiary_name}</p>
                        <p className="text-[var(--color-text-muted)] text-xs">{ben.relationship} • {ben.beneficiary_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${ben.access_level === 'inherit' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {ben.access_level}
                      </span>
                      <button 
                        onClick={() => {
                          if (window.confirm('Remove this beneficiary?')) {
                            deleteBeneficiary({ id: ben.id, vaultId: activeVault.id });
                          }
                        }}
                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Right Column: Dead Man's Switch */}
        <div className="space-y-6">
          <GlassPanel className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="w-32 h-32 text-[#8B5CF6]" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[#8B5CF6]" /> 
                Release Trigger
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                How should the system detect when to release your vault?
              </p>

              <div className="space-y-4">
                {/* Trigger Types */}
                <label className={`block p-4 rounded-xl border-2 transition-colors cursor-pointer ${trigger?.trigger_type === 'inactivity' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[var(--color-border)] hover:border-[#8B5CF6]/50 bg-[var(--color-surface)]'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="trigger" 
                      checked={trigger?.trigger_type === 'inactivity'} 
                      onChange={() => handleTriggerChange('inactivity', 180)}
                      className="accent-[#8B5CF6]"
                    />
                    <div>
                      <p className="text-white font-medium">Inactivity Switch</p>
                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5">Triggers if you don't check in.</p>
                    </div>
                  </div>
                </label>

                <label className={`block p-4 rounded-xl border-2 transition-colors cursor-pointer ${trigger?.trigger_type === 'manual' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[var(--color-border)] hover:border-[#8B5CF6]/50 bg-[var(--color-surface)]'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="trigger" 
                      checked={trigger?.trigger_type === 'manual'} 
                      onChange={() => handleTriggerChange('manual')}
                      className="accent-[#8B5CF6]"
                    />
                    <div>
                      <p className="text-white font-medium">Manual Delegation</p>
                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5">Trustee must initiate the release.</p>
                    </div>
                  </div>
                </label>
                
                {trigger?.trigger_type === 'inactivity' && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                    <p className="text-sm font-medium text-white mb-2">Inactivity Threshold</p>
                    <select 
                      value={trigger.inactivity_days || 180}
                      onChange={(e) => handleTriggerChange('inactivity', parseInt(e.target.value))}
                      className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#8B5CF6]"
                    >
                      <option value={90}>90 Days</option>
                      <option value={180}>180 Days (6 Months)</option>
                      <option value={365}>365 Days (1 Year)</option>
                    </select>

                    <div className="mt-6 p-4 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-[#8B5CF6] uppercase tracking-wider">System Status</p>
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </div>
                      <p className="text-white text-sm">Last Check-in: <span className="font-bold">{new Date(trigger.last_check_in || Date.now()).toLocaleDateString()}</span></p>
                      <Button 
                        onClick={() => checkIn(activeVault.id)}
                        className="w-full mt-3 bg-white text-black hover:bg-gray-200"
                        size="sm"
                      >
                        Check In Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Add Beneficiary Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassPanel className="w-full max-w-md p-6 space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-pink-500" /> Add Beneficiary
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
                  <input 
                    value={newBen.name}
                    onChange={e => setNewBen({...newBen, name: e.target.value})}
                    placeholder="Jane Doe"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
                  <input 
                    type="email"
                    value={newBen.email}
                    onChange={e => setNewBen({...newBen, email: e.target.value})}
                    placeholder="jane@example.com"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Relationship</label>
                  <input 
                    value={newBen.relationship}
                    onChange={e => setNewBen({...newBen, relationship: e.target.value})}
                    placeholder="e.g. Spouse, Child"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 block">Access Level</label>
                  <select 
                    value={newBen.access}
                    onChange={e => setNewBen({...newBen, access: e.target.value})}
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-white text-sm focus:border-pink-500 focus:outline-none"
                  >
                    <option value="view">View Only</option>
                    <option value="download">Download</option>
                    <option value="inherit">Full Inheritance</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button variant="ghost" disabled={isAddingBen} onClick={() => setAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddBen} disabled={isAddingBen} className="bg-pink-500 hover:bg-pink-600 text-white border-none">
                {isAddingBen ? 'Adding...' : 'Add Beneficiary'}
              </Button>
            </div>
          </GlassPanel>
        </div>
      )}
    </PageContainer>
  );
};

export default function LegacyGovernancePage() {
  return (
    <PageErrorBoundary>
      <LegacyGovernanceContent />
    </PageErrorBoundary>
  );
}
