import api from "./api";

export interface IdentityProfile {
  id: number;
  user_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  location?: string;
  country?: string;
  dob?: string;
  gender?: string;
  interested_in?: string;
  is_private: boolean;
  purposes?: string | string[];
  interests?: string | number[];
  verified?: boolean;
  verification_tier?: "standard" | "premium" | "gold";
}

// In-memory cache map to avoid redundant social profile API requests
const profileCache = new Map<string, Promise<IdentityProfile> | IdentityProfile>();

export const identityService = {
  /**
   * Fetch a single user profile (by userId or username)
   */
  async getUser(userIdOrUsername: string, forceRefresh = false): Promise<IdentityProfile> {
    if (!userIdOrUsername) throw new Error("userIdOrUsername is required");
    
    const cacheKey = userIdOrUsername.toString();
    if (!forceRefresh && profileCache.has(cacheKey)) {
      const cached = profileCache.get(cacheKey);
      if (cached instanceof Promise) return cached;
      return Promise.resolve(cached as IdentityProfile);
    }

    const promise = api.get(`/social-profile/${userIdOrUsername}`)
      .then(res => {
        const data = res.data?.data;
        if (!data) throw new Error("User not found");
        profileCache.set(cacheKey, data);
        // Also cache under username and ID if available
        if (data.username && data.username !== cacheKey) {
          profileCache.set(data.username, data);
        }
        if (data.user_id && data.user_id.toString() !== cacheKey) {
          profileCache.set(data.user_id.toString(), data);
        }
        return data;
      })
      .catch(err => {
        profileCache.delete(cacheKey);
        throw err;
      });

    profileCache.set(cacheKey, promise);
    return promise;
  },

  /**
   * Fetch multiple user profiles by ID in batch
   */
  async getUsers(userIds: string[]): Promise<IdentityProfile[]> {
    if (!userIds || userIds.length === 0) return [];
    
    const uncachedIds = userIds.filter(id => !profileCache.has(id.toString()));
    
    if (uncachedIds.length > 0) {
      try {
        const res = await api.post("/social-profile/batch", { userIds: uncachedIds });
        const list = res.data?.data || [];
        list.forEach((p: IdentityProfile) => {
          const idStr = p.user_id?.toString();
          if (idStr) profileCache.set(idStr, p);
          if (p.username) profileCache.set(p.username, p);
        });
      } catch (err) {
        console.error("Failed to batch fetch user profiles", err);
      }
    }

    return Promise.all(
      userIds.map(id => 
        Promise.resolve(profileCache.get(id.toString()))
          .then(val => val as IdentityProfile)
          .catch(() => null)
      )
    ).then(list => list.filter(Boolean) as IdentityProfile[]);
  },

  /**
   * Update the logged in user's profile identity
   */
  async updateIdentity(data: Partial<IdentityProfile>): Promise<IdentityProfile> {
    const res = await api.put("/social-profile", data);
    const updated = res.data?.data;
    if (updated) {
      this.invalidateUser(updated.user_id?.toString());
      if (updated.username) {
        this.invalidateUser(updated.username);
      }
      profileCache.set(updated.user_id?.toString(), updated);
      if (updated.username) {
        profileCache.set(updated.username, updated);
      }
    }
    return updated;
  },

  /**
   * Invalidate cache for a specific user ID or username
   */
  invalidateUser(userIdOrUsername: string): void {
    if (userIdOrUsername) {
      profileCache.delete(userIdOrUsername.toString());
    }
  },

  /**
   * Clear entire profile cache
   */
  clearCache(): void {
    profileCache.clear();
  }
};
