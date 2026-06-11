import api from '@/lib/api';
import { MemoryVault, MemoryCircle, MemoryItem } from '../types/memoryWallet.types';

export const memoryWalletService = {
  // Vaults
  initializeVault: async (): Promise<{ vaultId: number }> => {
    const response = await api.post('/memory-wallet/vaults/init');
    return response.data;
  },

  getVaults: async (): Promise<MemoryVault[]> => {
    const response = await api.get('/memory-wallet/vaults');
    return response.data?.data || [];
  },

  // Circles
  getCircles: async (vaultId: number): Promise<MemoryCircle[]> => {
    const response = await api.get(`/memory-wallet/circles`, { params: { vaultId } });
    return response.data?.data || [];
  },

  getCircleById: async (id: number): Promise<MemoryCircle> => {
    const response = await api.get(`/memory-wallet/circles/${id}`);
    return response.data?.data;
  },

  createCircle: async (vaultId: number, data: Partial<MemoryCircle>): Promise<MemoryCircle> => {
    const response = await api.post('/memory-wallet/circles', { vaultId, ...data });
    return response.data?.data;
  },

  // Items
  getMemoryItems: async (vaultId: number, circleId?: number): Promise<MemoryItem[]> => {
    const response = await api.get('/memory-wallet/items', { params: { vaultId, circleId } });
    return response.data?.data || [];
  },

  addMemoryItem: async (data: Partial<MemoryItem>): Promise<{ id: number }> => {
    const response = await api.post('/memory-wallet/items', data);
    return response.data?.data;
  },

  updateMemoryItem: async (itemId: number, data: Partial<MemoryItem>): Promise<void> => {
    await api.put(`/memory-wallet/items/${itemId}`, data);
  },

  deleteMemoryItem: async (itemId: number): Promise<void> => {
    await api.delete(`/memory-wallet/items/${itemId}`);
  },

  // Legacy Governance
  getBeneficiaries: async (vaultId: number): Promise<any[]> => {
    const response = await api.get('/memory-wallet/legacy/beneficiaries', { params: { vaultId } });
    return response.data?.data || [];
  },
  addBeneficiary: async (data: any): Promise<any> => {
    const response = await api.post('/memory-wallet/legacy/beneficiaries', data);
    return response.data?.data;
  },
  updateBeneficiary: async (id: number, data: any): Promise<void> => {
    await api.put(`/memory-wallet/legacy/beneficiaries/${id}`, data);
  },
  deleteBeneficiary: async (id: number): Promise<void> => {
    await api.delete(`/memory-wallet/legacy/beneficiaries/${id}`);
  },
  getLegacyTrigger: async (vaultId: number): Promise<any> => {
    const response = await api.get('/memory-wallet/legacy/trigger', { params: { vaultId } });
    return response.data?.data;
  },
  setLegacyTrigger: async (data: any): Promise<any> => {
    const response = await api.post('/memory-wallet/legacy/trigger', data);
    return response.data?.data;
  },
  legacyCheckIn: async (vaultId: number): Promise<void> => {
    await api.post('/memory-wallet/legacy/trigger/check-in', { vaultId });
  },

  // Collage Templates
  getCollageTemplates: async (all: boolean = false): Promise<any[]> => {
    const response = await api.get('/memory-wallet/templates', { params: { all } });
    return response.data?.data || [];
  },
  createCollageTemplate: async (data: any): Promise<{ id: number }> => {
    const response = await api.post('/memory-wallet/templates', data);
    return response.data?.data;
  },
  updateCollageTemplate: async (id: number, data: any): Promise<void> => {
    await api.put(`/memory-wallet/templates/${id}`, data);
  },
  deleteCollageTemplate: async (id: number): Promise<void> => {
    await api.delete(`/memory-wallet/templates/${id}`);
  }
};
