import { safeArray, safeObject } from "@/lib/utils";

export type CommunityTopicSubcategory = {
  id: string;
  name: string;

  country?: string;
  state?: string;
  city?: string;

  ageGroup?: string;

  enabled?: boolean;
  discoveryEnabled?: boolean;
  hashtagEnabled?: boolean;

  description?: string;
};

export type CommunityTopicCategory = {
  id: string;
  name: string;
  icon?: string;
  enabled?: boolean;
  discoveryEnabled?: boolean;
  hashtagEnabled?: boolean;
  description?: string;
  subcategories: CommunityTopicSubcategory[];
};

export type CommunityTopicTaxonomy = {
  version?: number;
  categories: CommunityTopicCategory[];
};

export function normalizeCommunityTaxonomy(value: any): CommunityTopicTaxonomy {
  const source = safeObject<any>(value);
  const categories = safeArray<any>(source.categories).map((category, index) => {
    const normalizedCategory = safeObject<any>(category);
    return {
      id: String(normalizedCategory.id || `cat-${index + 1}`),
      name: String(normalizedCategory.name || `Category ${index + 1}`),
      icon: String(normalizedCategory.icon || "Hash"),
      enabled: normalizedCategory.enabled !== false,
      discoveryEnabled: normalizedCategory.discoveryEnabled !== false,
      hashtagEnabled: normalizedCategory.hashtagEnabled !== false,
      description: String(normalizedCategory.description || ""),
      subcategories: safeArray<any>(normalizedCategory.subcategories).map((subcategory, subIndex) => {
        const normalizedSubcategory = safeObject<any>(subcategory);
        const type = String(normalizedSubcategory.type || "custom").toLowerCase();
        return {
          id: String(normalizedSubcategory.id || `sub-${index + 1}-${subIndex + 1}`),
          name: String(normalizedSubcategory.name || `Option ${subIndex + 1}`),
          country: normalizedSubcategory.country
            ? String(normalizedSubcategory.country)
            : "",

          state: normalizedSubcategory.state
            ? String(normalizedSubcategory.state)
            : "",

          city: normalizedSubcategory.city
            ? String(normalizedSubcategory.city)
            : "",
          ageGroup: normalizedSubcategory.ageGroup
            ? String(normalizedSubcategory.ageGroup)
            : "",
          enabled: normalizedSubcategory.enabled !== false,
          discoveryEnabled: normalizedSubcategory.discoveryEnabled !== false,
          hashtagEnabled: normalizedSubcategory.hashtagEnabled !== false,
          description: String(normalizedSubcategory.description || ""),
          value: normalizedSubcategory.value,
        };
      }),
    };
  });

  return {
    version: Number(source.version || 1),
    categories,
  };
}

export function getCommunityMapEmbedUrl(mapUrl?: string | null, latitude?: number | string | null, longitude?: number | string | null) {
  if (mapUrl && String(mapUrl).trim()) {
    const value = String(mapUrl).trim();
    if (value.includes("google.com/maps") || value.includes("goo.gl/maps")) {
      if (value.includes("/embed")) return value;
      if (value.includes("/place/")) {
        return `${value.replace(/\/$/, "")}/embed`;
      }
      const latLngMatch = value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
      if (latLngMatch) {
        return `https://www.google.com/maps?q=${latLngMatch[1]},${latLngMatch[2]}&z=15&output=embed`;
      }
      try {
        const parsed = new URL(value);
        const query = parsed.searchParams.get("q");
        if (query) {
          return `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
        }
      } catch {
        // fall back to coordinates below
      }
      return "";
    }
    return value;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  return "";
}

export function buildCommunityTagHints(category?: CommunityTopicCategory | null, subcategory?: CommunityTopicSubcategory | null) {
  const hints = new Set<string>();
  if (category?.hashtagEnabled !== false && category?.name) {
    hints.add(`#${category.name.replace(/\s+/g, "")}`);
  }
  if (subcategory?.hashtagEnabled !== false && subcategory?.name) {
    hints.add(`#${subcategory.name.replace(/\s+/g, "")}`);
  }
  return Array.from(hints);
}
