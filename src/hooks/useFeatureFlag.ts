import { useUser } from "@/hooks/queries/useUser";

export function useFeatureFlag() {
  const { profile } = useUser();
  const userId = profile?.id;

  // Initial client configurations
  const flags: Record<string, { enabled: boolean; percentage: number }> = {
    "dating-premium": { enabled: false, percentage: 0 },
    "discover-recommended-posts": { enabled: true, percentage: 50 },
    "media-avif-compression": { enabled: true, percentage: 10 },
  };

  const isEnabled = (flagName: string): boolean => {
    const flag = flags[flagName];
    if (!flag) return false;
    if (!flag.enabled) return false;
    if (flag.percentage >= 100) return true;
    if (flag.percentage <= 0) return false;

    if (!userId) return false;
    const hashValue = Number(userId) % 100;
    return hashValue < flag.percentage;
  };

  return {
    isEnabled,
  };
}
export default useFeatureFlag;
