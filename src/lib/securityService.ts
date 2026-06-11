"use client";

import { AxiosInstance, AxiosError } from "axios";
import toast from "react-hot-toast";

interface RateLimitTracker {
  count: number;
  lastRequestTime: number;
}

const endpointRequestTracker: Record<string, RateLimitTracker> = {};
let isSyncingListenerAttached = false;

export const securityService = {
  /**
   * Decodes JWT token payload safely without external dependencies
   */
  decodeJwt(token: string): { exp?: number; sub?: string; role?: string } | null {
    if (!token) return null;
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  },

  /**
   * Checks if the active JWT token is close to expiration (within buffer in seconds)
   */
  isTokenExpiringSoon(token: string | null, bufferSeconds = 300): boolean {
    if (!token) return true;
    const payload = this.decodeJwt(token);
    if (!payload?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - now <= bufferSeconds;
  },

  /**
   * Syncs authorization state changes across multiple active browser tabs
   */
  syncTokenAcrossTabs(onLogout: () => void) {
    if (typeof window === "undefined" || isSyncingListenerAttached) return;

    window.addEventListener("storage", (event) => {
      // If the token was removed or modified in another tab, sync state
      if (event.key === "token") {
        if (!event.newValue) {
          toast.error("Session expired or logged out in another tab.");
          onLogout();
        } else {
          // Token changed, reload tab to pick up new context
          window.location.reload();
        }
      }
    });

    isSyncingListenerAttached = true;
  },

  /**
   * Client-side request throttling to block rapid duplicate clicks (within a cooldown window)
   */
  shouldThrottleRequest(endpoint: string, maxRequestsPerSec = 5): boolean {
    const now = Date.now();
    const tracker = endpointRequestTracker[endpoint];

    if (!tracker) {
      endpointRequestTracker[endpoint] = { count: 1, lastRequestTime: now };
      return false;
    }

    const elapsed = now - tracker.lastRequestTime;
    if (elapsed < 1000) {
      if (tracker.count >= maxRequestsPerSec) {
        return true; // Throttle
      }
      tracker.count++;
    } else {
      tracker.count = 1;
      tracker.lastRequestTime = now;
    }

    return false;
  },

  /**
   * Sets up global Axios interception for handling HTTP 429 Rate Limits
   */
  setupRateLimitInterceptor(axiosInstance: AxiosInstance) {
    axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          const delayText = retryAfter ? ` in ${retryAfter}s` : " shortly";
          toast.error(`Too many requests. Please try again${delayText}.`);
        }
        return Promise.reject(error);
      }
    );
  },

  /**
   * Standardized Socket.IO auth handshake connection setup
   */
  getSocketAuthOptions(token: string | null) {
    return {
      auth: {
        token: token ? `Bearer ${token}` : "",
      },
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    };
  },

  /**
   * Tracks and formats OTP Verification cooldown timing values
   */
  getOtpTimeRemaining(expiryTime: number): { seconds: number; formatted: string; expired: boolean } {
    const now = Date.now();
    const remainingMs = Math.max(0, expiryTime - now);
    const seconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formatted = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return {
      seconds,
      formatted,
      expired: remainingMs === 0,
    };
  }
};
