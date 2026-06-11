export type MemoryVaultType = 'personal' | 'family' | 'legacy';
export type MemoryCircleType = 'family' | 'wedding' | 'travel' | 'college' | 'legacy' | 'business' | 'custom';
export type MemoryItemType = 'photo' | 'video' | 'document' | 'voice_note' | 'letter';
export type MemoryVisibility = 'private' | 'circle' | 'vault';
export type VaultMemberRole = 'owner' | 'editor' | 'viewer';

export interface MemoryVault {
  id: number;
  company_id: number;
  owner_id: number;
  vault_name: string;
  vault_type: MemoryVaultType;
  storage_limit_bytes: number;
  used_storage_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface MemoryCircle {
  id: number;
  vault_id: number;
  name: string;
  description: string | null;
  circle_type: MemoryCircleType;
  created_by: number;
  member_count?: number;
  memory_count?: number;
  created_at: string;
}

export interface MemoryItem {
  id: number;
  vault_id: number;
  circle_id: number | null;
  media_file_id: number;
  title: string | null;
  caption: string | null;
  owner_user_id: number;
  uploaded_by: number;
  memory_type: MemoryItemType;
  visibility: MemoryVisibility;
  is_archived: boolean;
  is_favorite: boolean;
  is_locked: boolean;
  relationship_id: number | null;
  event_id: number | null;
  community_id: number | null;
  location_name: string | null;
  memory_date: string | null;
  created_at: string;
  
  // Joined media properties
  url?: string;
  thumbnail_url?: string;
  depth_map_url?: string;
  depth_type?: string;
  raw_media_type?: string;
  file_size?: number;
  relationship_name?: string;
  relationship_type?: string;
}
