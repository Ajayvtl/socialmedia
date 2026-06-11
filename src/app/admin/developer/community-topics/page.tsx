"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getMediaUrl } from "@/lib/api";
import { normalizeCommunityTaxonomy, type CommunityTopicCategory, type CommunityTopicSubcategory, type CommunityTopicTaxonomy } from "@/lib/communityTopics";
import { useAuth } from "@/context/AuthContext";
import { getCompanyRoleScope } from "@/lib/companyRoleScope";
import { IconMap } from "@/lib/iconMapping";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSection } from "@/components/ui/PageSection";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { AuroraInput } from "@/components/ui/AuroraInput";
import { AuroraSelect } from "@/components/ui/AuroraSelect";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppImage } from "@/components/ui/AppImage";
import { Hash, Plus, Save, Sparkles, Trash2, Edit2, CheckCircle2, XCircle, X, Smile, Tag, Shield } from "lucide-react";
import toast from "react-hot-toast";

type EmojiItem = {
  id: number;
  shortcode: string;
  image_url: string;
};

const initialTaxonomy: CommunityTopicTaxonomy = {
  version: 1,
  categories: [],
};

function slugify(value: string, prefix: string) {
  const raw = String(value || "").trim().toLowerCase();
  const slug = raw.replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${prefix}-${slug || "item"}`;
}

export default function CommunityTopicsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const scope = getCompanyRoleScope(user);
  const allowed = scope === "all" || scope === "developer" || scope === "admin";

  const [activeTab, setActiveTab] = useState<"categories" | "subcategories">("categories");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxonomy, setTaxonomy] = useState<CommunityTopicTaxonomy>(initialTaxonomy);

  // Selection states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Dropdown lists
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CommunityTopicCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<{
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
    discoveryEnabled: boolean;
    hashtagEnabled: boolean;
  }>({
    name: "",
    description: "",
    icon: "Hash",
    enabled: true,
    discoveryEnabled: true,
    hashtagEnabled: true,
  });

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<CommunityTopicSubcategory | null>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState<{
    name: string;

    country: string;
    state: string;
    city: string;

    ageGroup: string;

    enabled: boolean;
    discoveryEnabled: boolean;
    hashtagEnabled: boolean;
  }>({
    name: "",

    country: "",
    state: "",
    city: "",

    ageGroup: "",

    enabled: true,
    discoveryEnabled: true,
    hashtagEnabled: true,
  });

  useEffect(() => {
    if (!user) return;
    if (!allowed) {
      router.replace("/backend/login");
    }
  }, [allowed, router, user]);

  useEffect(() => {
    const load = async () => {
      try {
        const [taxonomyRes, emojiRes, countriesRes, statesRes, citiesRes] = await Promise.all([
          api.get("/settings/community-topics"),
          api.get("/emojis").catch(() => ({ data: { data: [] } })),
          api.get("/settings/countries").catch(() => ({ data: { data: [] } })),
          api.get("/settings/states").catch(() => ({ data: { data: [] } })),
          api.get("/settings/cities").catch(() => ({ data: { data: [] } })),
        ]);
        const normalized = normalizeCommunityTaxonomy(taxonomyRes.data?.data || initialTaxonomy);
        setTaxonomy(normalized);
        setSelectedCategoryId(normalized.categories[0]?.id || "");
        setEmojis(Array.isArray(emojiRes.data?.data) ? emojiRes.data.data : []);
        setCountries(Array.isArray(countriesRes.data?.data) ? countriesRes.data.data : []);
        setStates(Array.isArray(statesRes.data?.data) ? statesRes.data.data : []);
        setCities(Array.isArray(citiesRes.data?.data) ? citiesRes.data.data : []);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load community topics");
      } finally {
        setLoading(false);
      }
    };

    if (allowed) {
      load();
    } else {
      setLoading(false);
    }
  }, [allowed]);

  const selectedCategory = useMemo(
    () => taxonomy.categories.find((category) => category.id === selectedCategoryId) || null,
    [taxonomy.categories, selectedCategoryId]
  );

  const saveTaxonomy = async () => {
    console.log("SAVE TAXONOMY CLICKED");
    setSaving(true);
    try {
      const payload = normalizeCommunityTaxonomy(taxonomy);
      console.log("PAYLOAD", payload);
      const res = await api.put("/settings/community-topics", payload);
      console.log("API RESPONSE", res);
      const normalized = normalizeCommunityTaxonomy(res.data?.data || payload);
      setTaxonomy(normalized);
      toast.success("Community topics saved successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save community topics");
    } finally {
      setSaving(false);
    }
  };

  // Category Actions
  const openCategoryModal = (category: CommunityTopicCategory | null = null) => {
    setEditingCategory(category);
    if (category) {
      setCategoryFormData({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "Hash",
        enabled: category.enabled !== false,
        discoveryEnabled: category.discoveryEnabled !== false,
        hashtagEnabled: category.hashtagEnabled !== false,
      });
    } else {
      setCategoryFormData({
        name: "",
        description: "",
        icon: "Hash",
        enabled: true,
        discoveryEnabled: true,
        hashtagEnabled: true,
      });
    }
    setIsCategoryModalOpen(true);
  };

  const saveCategory = () => {
    const name = categoryFormData.name.trim();
    if (!name) return toast.error("Category name is required");

    if (editingCategory) {
      // Edit mode
      setTaxonomy((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...categoryFormData, name } : cat
        ),
      }));
      toast.success("Category updated locally");
    } else {
      // Add mode
      const nextCategory: CommunityTopicCategory = {
        id: slugify(name, "cat"),
        name,
        description: categoryFormData.description,
        icon: categoryFormData.icon,
        enabled: categoryFormData.enabled,
        discoveryEnabled: categoryFormData.discoveryEnabled,
        hashtagEnabled: categoryFormData.hashtagEnabled,
        subcategories: [],
      };
      setTaxonomy((prev) => ({
        ...prev,
        categories: [...prev.categories, nextCategory],
      }));
      if (!selectedCategoryId) {
        setSelectedCategoryId(nextCategory.id);
      }
      toast.success("Category added locally");
    }
    setIsCategoryModalOpen(false);
  };

const removeCategory = async (categoryId: string) => {
  if (
    !confirm(
      "Are you sure you want to remove this category and all its subcategories?"
    )
  ) {
    return;
  }

  const updatedTaxonomy = {
    ...taxonomy,
    categories: taxonomy.categories.filter(
      (cat) => cat.id !== categoryId
    ),
  };

  try {
    setTaxonomy(updatedTaxonomy);

    if (selectedCategoryId === categoryId) {
      const remaining = updatedTaxonomy.categories;
      setSelectedCategoryId(remaining[0]?.id || "");
    }

    const payload = normalizeCommunityTaxonomy(updatedTaxonomy);

    await api.put("/settings/community-topics", payload);

    toast.success("Category removed successfully");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      "Failed to remove category"
    );
  }
};

  const toggleCategoryStatus = (categoryId: string, field: "enabled" | "discoveryEnabled" | "hashtagEnabled") => {
    setTaxonomy((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, [field]: !cat[field] } : cat
      ),
    }));
    toast.success("Status updated locally");
  };

  // Subcategory Actions
  const openSubcategoryModal = (subcategory: CommunityTopicSubcategory | null = null) => {
    if (!selectedCategoryId) return toast.error("Please create or select a Category first");
    setEditingSubcategory(subcategory);
    if (subcategory) {
      setSubcategoryFormData({
        name: subcategory.name,
        country: subcategory.country || "",
        state: subcategory.state || "",
        city: subcategory.city || "",

        ageGroup: subcategory.ageGroup || "",

        enabled: subcategory.enabled !== false,
        discoveryEnabled: subcategory.discoveryEnabled !== false,
        hashtagEnabled: subcategory.hashtagEnabled !== false,
      });
    } else {
      setSubcategoryFormData({
        name: "",
        country: "",
        state: "",
        city: "",
        ageGroup: "",
        enabled: true,
        discoveryEnabled: true,
        hashtagEnabled: true,
      });
    }
    setIsSubcategoryModalOpen(true);
  };

const saveSubcategory = async () => {
  const name = subcategoryFormData.name.trim();

  if (!name) {
    return toast.error("Subcategory name is required");
  }

  let updatedTaxonomy: CommunityTopicTaxonomy;

  if (editingSubcategory) {
    updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;

        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === editingSubcategory.id
              ? {
                  ...sub,
                  ...subcategoryFormData,
                  name,
                }
              : sub
          ),
        };
      }),
    };
  } else {
    const nextSubcategory: CommunityTopicSubcategory = {
      id: slugify(name, selectedCategoryId),
      name,
      country: subcategoryFormData.country || "",
      state: subcategoryFormData.state || "",
      city: subcategoryFormData.city || "",
      ageGroup: subcategoryFormData.ageGroup || "",
      enabled: subcategoryFormData.enabled,
      discoveryEnabled: subcategoryFormData.discoveryEnabled,
      hashtagEnabled: subcategoryFormData.hashtagEnabled,
      description: "",
    };

    updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;

        return {
          ...cat,
          subcategories: [...cat.subcategories, nextSubcategory],
        };
      }),
    };
  }

  try {
    setTaxonomy(updatedTaxonomy);

    const payload = normalizeCommunityTaxonomy(updatedTaxonomy);

    await api.put("/settings/community-topics", payload);

    toast.success(
      editingSubcategory
        ? "Subcategory updated successfully"
        : "Subcategory added successfully"
    );

    setIsSubcategoryModalOpen(false);
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      "Failed to save subcategory"
    );
  }
};

const removeSubcategory = async (subcategoryId: string) => {
  if (!confirm("Are you sure you want to remove this subcategory?")) {
    return;
  }

  const updatedTaxonomy = {
    ...taxonomy,
    categories: taxonomy.categories.map((cat) => {
      if (cat.id !== selectedCategoryId) return cat;

      return {
        ...cat,
        subcategories: cat.subcategories.filter(
          (sub) => sub.id !== subcategoryId
        ),
      };
    }),
  };

  try {
    setTaxonomy(updatedTaxonomy);

    const payload = normalizeCommunityTaxonomy(updatedTaxonomy);

    await api.put("/settings/community-topics", payload);

    toast.success("Subcategory removed successfully");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
      "Failed to remove subcategory"
    );
  }
};

  const toggleSubcategoryStatus = (subcategoryId: string, field: "enabled" | "discoveryEnabled" | "hashtagEnabled") => {
    setTaxonomy((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id !== selectedCategoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === subcategoryId ? { ...sub, [field]: !sub[field] } : sub
          ),
        };
      }),
    }));
    toast.success("Status updated locally");
  };

  const iconOptions = ["Hash", "Tag", "Users", "MapPin", "Building2", "GlobeAltIcon", "BadgeCheck", "Sparkles"];

  const locationOptions = {
    country: countries
      .filter((item) => Boolean(item?.is_enabled))
      .map((item) => ({
        label: String(item.name || item.code || "Country"),
        value: String(item.name || item.code || ""),
      })),
    state: states
      .filter((item) => Boolean(item?.is_enabled))
      .map((item) => ({
        label: String(item.name || item.code || "State"),
        value: String(item.name || item.code || ""),
      })),

    city: cities
      .filter((item) => Boolean(item?.is_enabled))
      .map((item) => ({
        label: String(item.name || item.code || "City"),
        value: String(item.name || item.code || ""),
      })),
  };

  const typeOptions = [
    { label: "Age", value: "age" },
    { label: "City", value: "city" },
    { label: "State", value: "state" },
    { label: "Country", value: "country" },
    { label: "Custom", value: "custom" },
  ];

  const getValueOptions = (type?: string | null) => {
    if (type === "city") return locationOptions.city;
    if (type === "state") return locationOptions.state;
    if (type === "country") return locationOptions.country;
    return [];
  };

  const renderIcon = (icon?: string | null, className = "w-5 h-5") => {
    if (!icon) return null;
    if (String(icon).startsWith("http")) return null;
    const IconComponent = IconMap[String(icon)];
    if (IconComponent) return <IconComponent className={className} />;
    return icon;
  };

  if (loading) {
    return (
      <PageContainer size="xl">
        <div className="py-10 text-foreground/60">Loading community topics...</div>
      </PageContainer>
    );
  }

  if (!allowed) {
    return (
      <PageContainer size="md">
        <EmptyState
          title="Access restricted"
          description="This area is for developer and admin roles that manage shared community taxonomy."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Community Topics"
        description="Table-driven category and subcategory management for community discovery and location taxonomy."
        actions={(
          <Button isLoading={saving} icon={<Save className="w-4 h-4" />} onClick={saveTaxonomy}>
            Save Changes
          </Button>
        )}
      />

      <PageSection className="space-y-6">
        {/* Tab Selection */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "categories"
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50"
                : "text-white/50 hover:bg-white/5"
                }`}
            >
              <Hash size={18} /> Categories
            </button>
            <button
              onClick={() => {
                setActiveTab("subcategories");
                if (!selectedCategoryId && taxonomy.categories.length > 0) {
                  setSelectedCategoryId(taxonomy.categories[0].id);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === "subcategories"
                ? "bg-[#FF4D8D]/20 text-[#FF4D8D] border border-[#FF4D8D]/50"
                : "text-white/50 hover:bg-white/5"
                }`}
            >
              <Tag size={18} /> Subcategories
            </button>
          </div>

          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => (activeTab === "categories" ? openCategoryModal() : openSubcategoryModal())}
          >
            Add New
          </Button>
        </div>

        {activeTab === "categories" ? (
          <GlassPanel className="p-6 border border-white/5 bg-black/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="p-4 font-medium text-sm">ID</th>
                    <th className="p-4 font-medium text-sm">Icon & Name</th>
                    <th className="p-4 font-medium text-sm">Description</th>
                    <th className="p-4 font-medium text-sm">Subcategories</th>
                    <th className="p-4 font-medium text-sm">Enabled</th>
                    <th className="p-4 font-medium text-sm">Discovery</th>
                    <th className="p-4 font-medium text-sm">Hashtag</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-white text-sm">
                  {taxonomy.categories.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-4 text-center text-white/55">
                        No categories yet. Click "Add New" to get started.
                      </td>
                    </tr>
                  ) : (
                    taxonomy.categories.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white/55 text-xs">{c.id}</td>
                        <td className="p-4 font-bold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                            {String(c.icon || "").startsWith("http") ? (
                              <img src={getMediaUrl(c.icon)} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              renderIcon(c.icon, "w-4 h-4 text-[#00E5FF]") || <Hash className="w-4 h-4 text-[#00E5FF]" />
                            )}
                          </div>
                          {c.name}
                        </td>
                        <td className="p-4 text-white/70 max-w-[200px] truncate">{c.description || "—"}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              setSelectedCategoryId(c.id);
                              setActiveTab("subcategories");
                            }}
                            className="text-[#00E5FF] font-bold hover:underline"
                          >
                            {c.subcategories?.length || 0} subcategories
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleCategoryStatus(c.id, "enabled")}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.enabled !== false ? "bg-[#00D97E]/20 text-[#00D97E]" : "bg-red-500/20 text-red-500"
                              }`}
                          >
                            {c.enabled !== false ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {c.enabled !== false ? "Enabled" : "Disabled"}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleCategoryStatus(c.id, "discoveryEnabled")}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.discoveryEnabled !== false ? "bg-[#00E5FF]/20 text-[#00E5FF]" : "bg-white/10 text-white/50"
                              }`}
                          >
                            {c.discoveryEnabled !== false ? "Active" : "Off"}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleCategoryStatus(c.id, "hashtagEnabled")}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${c.hashtagEnabled !== false ? "bg-[#8B5CF6]/20 text-[#8B5CF6]" : "bg-white/10 text-white/50"
                              }`}
                          >
                            {c.hashtagEnabled !== false ? "Active" : "Off"}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openCategoryModal(c)}
                            className="text-white/50 hover:text-[#00E5FF] transition-colors p-2"
                            title="Edit Category"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => removeCategory(c.id)}
                            className="text-white/50 hover:text-red-400 transition-colors p-2"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        ) : (
          <div className="space-y-4">
            {/* Category selector for Subcategories */}
            <div className="max-w-xs bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1">
              <label className="text-[11px] text-white/50 uppercase tracking-wider font-semibold">Active Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer"
              >
                {taxonomy.categories.map((cat) => (
                  <option key={cat.id} className="bg-[#0a0f24]" value={cat.id}>
                    {cat.name} ({cat.subcategories?.length || 0})
                  </option>
                ))}
              </select>
            </div>

            <GlassPanel className="p-6 border border-white/5 bg-black/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-white/50 border-b border-white/10">
                      <th className="p-4 font-medium text-sm">ID</th>
                      <th className="p-4 font-medium text-sm">Name</th>
                      <th className="p-4 font-medium text-sm">City</th>
                      <th className="p-4 font-medium text-sm">State</th>
                      <th className="p-4 font-medium text-sm">Country</th>
                      <th className="p-4 font-medium text-sm">Age (Range)</th>
                      <th className="p-4 font-medium text-sm">Enable</th>
                                            <th className="p-4 font-medium text-sm">Discovery</th>
                      <th className="p-4 font-medium text-sm">Status</th>
                      <th className="p-4 font-medium text-sm text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-white text-sm">
                    {!selectedCategory || !selectedCategory.subcategories || selectedCategory.subcategories.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-white/55">
                          No subcategories in this category yet. Click "Add New" to add one.
                        </td>
                      </tr>
                    ) : (
                      selectedCategory.subcategories.map((sub) => (
                        <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-white/55 text-xs">{sub.id}</td>
                          <td className="p-4 font-bold">{sub.name}</td>
                          <td className="p-4 capitalize text-xs text-white/60">{sub.city || "city"}</td>
                          <td className="p-4 text-xs font-mono text-[#00E5FF]">{sub.state || "state"}</td>
                          <td className="p-4 capitalize text-xs text-white/60">{sub.country || "country"}</td>
                          <td className="p-4 text-xs font-mono text-[#00E5FF]">{sub.ageGroup || "ageGroup"}</td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleSubcategoryStatus(sub.id, "enabled")}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sub.enabled !== false ? "bg-[#00D97E]/20 text-[#00D97E]" : "bg-red-500/20 text-red-500"
                                }`}
                            >
                              {sub.enabled !== false ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                              {sub.enabled !== false ? "Enabled" : "Disabled"}
                            </button>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleSubcategoryStatus(sub.id, "discoveryEnabled")}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sub.discoveryEnabled !== false ? "bg-[#00E5FF]/20 text-[#00E5FF]" : "bg-white/10 text-white/50"
                                }`}
                            >
                              {sub.discoveryEnabled !== false ? "Active" : "Off"}
                            </button>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleSubcategoryStatus(sub.id, "hashtagEnabled")}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sub.hashtagEnabled !== false ? "bg-[#8B5CF6]/20 text-[#8B5CF6]" : "bg-white/10 text-white/50"
                                }`}
                            >
                              {sub.hashtagEnabled !== false ? "Active" : "Off"}
                            </button>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openSubcategoryModal(sub)}
                              className="text-white/50 hover:text-[#FF4D8D] transition-colors p-2"
                              title="Edit Subcategory"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => removeSubcategory(sub.id)}
                              className="text-white/50 hover:text-red-400 transition-colors p-2"
                              title="Delete Subcategory"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </div>
        )}
      </PageSection>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0f24] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCategory ? "Edit" : "Add"} Category
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuroraInput
                  label="Category Name"
                  placeholder="e.g. Startups"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                />
                <AuroraSelect
                  label="Default Icon"
                  value={categoryFormData.icon}
                  onValueChange={(val) => setCategoryFormData({ ...categoryFormData, icon: String(val) })}
                  options={iconOptions.map((icon) => ({ label: icon, value: icon }))}
                  searchable={false}
                />
              </div>

              <AuroraInput
                label="Description"
                placeholder="What is this category about?"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              />

              <div className="rounded-xl border border-white/10 p-4 space-y-3 bg-white/5">
                <p className="text-xs uppercase tracking-wider text-white/50 font-bold">Emoji Pack Assign</p>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                  {emojis.slice(0, 16).map((emoji) => (
                    <button
                      key={emoji.id}
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, icon: emoji.image_url })}
                      className={`rounded-xl border p-2 hover:border-[#00E5FF]/50 transition ${categoryFormData.icon === emoji.image_url ? "border-[#00E5FF]" : "border-white/10 bg-black/20"
                        }`}
                      title={emoji.shortcode}
                    >
                      <img src={getMediaUrl(emoji.image_url)} alt={emoji.shortcode} className="w-8 h-8 object-contain mx-auto" />
                      <span className="mt-1 block text-[9px] text-white/50 truncate">:{emoji.shortcode}:</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFormData.enabled}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                  />
                  <span className="text-xs text-white">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFormData.discoveryEnabled}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, discoveryEnabled: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                  />
                  <span className="text-xs text-white">Discovery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFormData.hashtagEnabled}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, hashtagEnabled: e.target.checked })}
                    className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                  />
                  <span className="text-xs text-white">Hashtags</span>
                </label>
              </div>

              <button
                onClick={saveCategory}
                disabled={!categoryFormData.name}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 mt-4"
              >
                Save 
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0f24] border border-white/10 rounded-2xl w-full max-w-lg p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingSubcategory ? "Edit" : "Add"} Subcategory
              </h2>
              <button onClick={() => setIsSubcategoryModalOpen(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AuroraInput
                  label="Subcategory Name"
                  placeholder="e.g. Mumbai or 18 - 24"
                  value={subcategoryFormData.name}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                />
                <AuroraSelect
                  label="Taxonomy Type"
                  value={subcategoryFormData.type}
                  onValueChange={(val) =>
                    setSubcategoryFormData({
                      ...subcategoryFormData,
                      type: val as CommunityTopicSubcategory["type"],
                      value: "",
                    })
                  }
                  options={typeOptions}
                  searchable={false}
                />
              </div>

              <div>
                {getValueOptions(subcategoryFormData.type).length > 0 ? (
                  <AuroraSelect
                    label="Assigned System Value"
                    value={subcategoryFormData.value}
                    onValueChange={(val) => setSubcategoryFormData({ ...subcategoryFormData, value: String(val) })}
                    options={getValueOptions(subcategoryFormData.type)}
                  />
                ) : (
                  <AuroraInput
                    label="Value (Optional)"
                    placeholder="e.g. 18-24"
                    value={subcategoryFormData.value}
                    onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, value: e.target.value })}
                  />
                )}
              </div> */}
            <div className="space-y-4">
              <AuroraInput
                label="Subcategory Name"
                placeholder="e.g. AI Ahmedabad"
                value={subcategoryFormData.name}
                onChange={(e) =>
                  setSubcategoryFormData({
                    ...subcategoryFormData,
                    name: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AuroraSelect
                  label="Country"
                  value={subcategoryFormData.country}
                  onValueChange={(val) =>
                    setSubcategoryFormData({
                      ...subcategoryFormData,
                      country: String(val),
                      state: "",
                      city: "",
                    })
                  }
                  options={locationOptions.country}
                />

                <AuroraSelect
                  label="State"
                  value={subcategoryFormData.state}
                  onValueChange={(val) =>
                    setSubcategoryFormData({
                      ...subcategoryFormData,
                      state: String(val),
                      city: "",
                    })
                  }
                  options={locationOptions.state}
                  disabled={!locationOptions.state.length}
                />

                <AuroraSelect
                  label="City"
                  value={subcategoryFormData.city}
                  onValueChange={(val) =>
                    setSubcategoryFormData({
                      ...subcategoryFormData,
                      city: String(val),
                    })
                  }
                  options={locationOptions.city}
                  disabled={!locationOptions.city.length}
                />
              </div>

              <AuroraInput
                label="Custom / Age Group (Optional)"
                placeholder="e.g. 18-24"
                value={subcategoryFormData.ageGroup}
                onChange={(e) =>
                  setSubcategoryFormData({
                    ...subcategoryFormData,
                    ageGroup: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subcategoryFormData.enabled}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, enabled: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                />
                <span className="text-xs text-white">Enabled</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subcategoryFormData.discoveryEnabled}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, discoveryEnabled: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                />
                <span className="text-xs text-white">Discovery</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subcategoryFormData.hashtagEnabled}
                  onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, hashtagEnabled: e.target.checked })}
                  className="w-4 h-4 rounded bg-white/5 border-white/10 text-[#00E5FF] focus:ring-[#00E5FF] focus:ring-offset-0"
                />
                <span className="text-xs text-white">Hashtags</span>
              </label>
            </div>

            <button
              onClick={saveSubcategory}
              disabled={!subcategoryFormData.name}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#00E5FF] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 mt-4"
            >
              Apply Local Changes
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
