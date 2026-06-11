import React from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MemoryVault } from '../types/memoryWallet.types';
import { Database, Cloud, Shield } from 'lucide-react';

interface Props {
  vault: MemoryVault;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const MemoryVaultStatus: React.FC<Props> = ({ vault }) => {
  const percentage = vault.storage_limit_bytes > 0 
    ? (vault.used_storage_bytes / vault.storage_limit_bytes) * 100 
    : 0;

  const isNearingLimit = percentage > 85;

  return (
    <GlassPanel className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {vault.vault_type === 'legacy' ? <Shield className="w-5 h-5 text-indigo-400" /> : <Database className="w-5 h-5 text-emerald-400" />}
            {vault.vault_name}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] capitalize">
            {vault.vault_type} Vault
          </p>
        </div>
        <div className="p-3 bg-[var(--color-surface-hover)] rounded-full">
          <Cloud className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-secondary)]">Storage Used</span>
          <span className="font-medium text-white">
            {formatBytes(vault.used_storage_bytes)} / {formatBytes(vault.storage_limit_bytes)}
          </span>
        </div>
        
        <div className="h-2 w-full bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isNearingLimit ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {isNearingLimit && (
          <p className="text-xs text-[var(--color-danger)] mt-2">
            You are running low on space. Consider upgrading your plan.
          </p>
        )}
      </div>
    </GlassPanel>
  );
};
