import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryWalletService } from '../services/memoryWallet.service';
import { MemoryVault, MemoryCircle, MemoryItem } from '../types/memoryWallet.types';

export const useVaults = () => {
  return useQuery<MemoryVault[]>({
    queryKey: ['memory-vaults'],
    queryFn: memoryWalletService.getVaults,
  });
};

export const useInitializeVault = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoryWalletService.initializeVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-vaults'] });
    },
  });
};

export const useCircles = (vaultId: number | undefined) => {
  return useQuery<MemoryCircle[]>({
    queryKey: ['memory-circles', vaultId],
    queryFn: () => memoryWalletService.getCircles(vaultId as number),
    enabled: !!vaultId,
  });
};

export const useMemoryItems = (vaultId: number | undefined, circleId?: number) => {
  return useQuery<MemoryItem[]>({
    queryKey: ['memory-items', vaultId, circleId],
    queryFn: () => memoryWalletService.getMemoryItems(vaultId as number, circleId),
    enabled: !!vaultId,
  });
};

export const useCreateCircle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vaultId, data }: { vaultId: number; data: Partial<MemoryCircle> }) =>
      memoryWalletService.createCircle(vaultId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memory-circles', variables.vaultId] });
    },
  });
};

export const useAddMemoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<MemoryItem>) => memoryWalletService.addMemoryItem(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memory-items', variables.vault_id] });
      if (variables.vault_id) {
        queryClient.invalidateQueries({ queryKey: ['memory-vaults'] }); // to refresh used_storage_bytes
      }
    },
  });
};

export const useUpdateMemoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: Partial<MemoryItem> }) =>
      memoryWalletService.updateMemoryItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-items'] });
    },
  });
};

export const useDeleteMemoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: number) => memoryWalletService.deleteMemoryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memory-items'] });
      queryClient.invalidateQueries({ queryKey: ['memory-vaults'] });
    },
  });
};

// --- Legacy Governance Hooks ---
export const useBeneficiaries = (vaultId: number | undefined) => {
  return useQuery({
    queryKey: ['legacy-beneficiaries', vaultId],
    queryFn: () => memoryWalletService.getBeneficiaries(vaultId as number),
    enabled: !!vaultId,
  });
};

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoryWalletService.addBeneficiary,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legacy-beneficiaries', variables.vault_id] });
    },
  });
};

export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data, vaultId }: { id: number; data: any; vaultId: number }) => 
      memoryWalletService.updateBeneficiary(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legacy-beneficiaries', variables.vaultId] });
    },
  });
};

export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, vaultId }: { id: number; vaultId: number }) => 
      memoryWalletService.deleteBeneficiary(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legacy-beneficiaries', variables.vaultId] });
    },
  });
};

export const useLegacyTrigger = (vaultId: number | undefined) => {
  return useQuery({
    queryKey: ['legacy-trigger', vaultId],
    queryFn: () => memoryWalletService.getLegacyTrigger(vaultId as number),
    enabled: !!vaultId,
  });
};

export const useSetLegacyTrigger = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoryWalletService.setLegacyTrigger,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legacy-trigger', variables.vault_id] });
    },
  });
};

export const useLegacyCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoryWalletService.legacyCheckIn,
    onSuccess: (_, vaultId) => {
      queryClient.invalidateQueries({ queryKey: ['legacy-trigger', vaultId] });
    },
  });
};

// --- Collage Templates Hooks ---
export const useCollageTemplates = (all: boolean = false) => {
  return useQuery({
    queryKey: ['collage-templates', all],
    queryFn: () => memoryWalletService.getCollageTemplates(all),
  });
};

export const useCreateCollageTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoryWalletService.createCollageTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collage-templates'] }),
  });
};

export const useUpdateCollageTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => memoryWalletService.updateCollageTemplate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collage-templates'] }),
  });
};

export const useDeleteCollageTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: memoryWalletService.deleteCollageTemplate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collage-templates'] }),
  });
};
