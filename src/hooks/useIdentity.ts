"use client";

import { useState, useEffect } from "react";
import { identityService, type IdentityProfile } from "@/lib/identityService";

/**
 * React hook to fetch and subscribe to a user's identity profile
 */
export function useUser(userIdOrUsername: string | null | undefined, forceRefresh = false) {
  const [user, setUser] = useState<IdentityProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userIdOrUsername) {
      setUser(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    identityService.getUser(userIdOrUsername, forceRefresh)
      .then((data) => {
        if (isMounted) {
          setUser(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userIdOrUsername, forceRefresh]);

  return { user, loading, error };
}

/**
 * React hook to batch fetch and subscribe to multiple users' identity profiles
 */
export function useUsers(userIds: string[] | null | undefined) {
  const [users, setUsers] = useState<IdentityProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userIds || userIds.length === 0) {
      setUsers([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    identityService.getUsers(userIds)
      .then((data) => {
        if (isMounted) {
          setUsers(data);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(userIds)]); // stringify ensures dependency comparison for array values

  return { users, loading, error };
}
