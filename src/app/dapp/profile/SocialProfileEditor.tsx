import { useState, useEffect } from "react";
import { User, MapPin, Heart, PenSquare, Camera, Calendar, Globe, Sparkles, Check } from "lucide-react";
import toast from "react-hot-toast";
import api, { getMediaUrl } from "@/lib/api";
import { safeArray } from "@/lib/utils";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import { getCroppedImg } from "@/lib/cropImage";

export default function SocialProfileEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [activePersonaTab, setActivePersonaTab] = useState<"universal" | "family" | "business" | "anonymous">("universal");
  
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    location: "",
    gender: "",
    interested_in: "",
    is_private: false,
    avatar_url: "",
    first_name: "",
    last_name: "",
    dob: "",
    country: "",
    purposes: [] as string[],
    interests: [] as number[],
    family_name: "",
    family_avatar_url: "",
    business_name: "",
    business_avatar_url: "",
    anonymous_name: "",
    anonymous_avatar_url: ""
  });

  const [globalInterests, setGlobalInterests] = useState<any[]>([]);
  const [globalServices, setGlobalServices] = useState<any[]>([]);
  
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileUploadProgress, setProfileUploadProgress] = useState(0);

  useEffect(() => {
    const fetchSocialProfile = async () => {
      try {
        const [profileRes, interestsRes, servicesRes] = await Promise.all([
          api.get("/social-profile"),
          api.get("/settings/interests").catch(() => ({ data: { data: [] } })),
          api.get("/settings/services").catch(() => ({ data: { data: [] } }))
        ]);
        
        setGlobalInterests(interestsRes.data?.data || []);
        setGlobalServices(servicesRes.data?.data || []);
        
        const data = profileRes.data.data;
        if (data) {
          const parsedPurposes = safeArray<string>(data.purposes);
          const parsedInterests = safeArray<any>(data.interests);

          setFormData({
            username: data.username || "",
            bio: data.bio || "",
            location: data.location || "",
            gender: data.gender || "",
            interested_in: data.interested_in || "",
            is_private: data.is_private === 1 || data.is_private === true,
            avatar_url: data.avatar_url || "",
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            dob: data.dob ? data.dob.split('T')[0] : "",
            country: data.country || "",
            purposes: Array.isArray(parsedPurposes) ? parsedPurposes : [],
            interests: Array.isArray(parsedInterests) ? parsedInterests.map(Number) : [],
            family_name: data.family_name || "",
            family_avatar_url: data.family_avatar_url || "",
            business_name: data.business_name || "",
            business_avatar_url: data.business_avatar_url || "",
            anonymous_name: data.anonymous_name || "",
            anonymous_avatar_url: data.anonymous_avatar_url || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch social profile");
      } finally {
        setLoading(false);
      }
    };
    fetchSocialProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/social-profile", formData);
      toast.success("Social profile updated!");
      setEditMode(false);
    } catch (error) {
      toast.error("Failed to update social profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImageSrc(reader.result?.toString() || null);
        setCropperOpen(true);
      });
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // reset
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!selectedImageSrc) return;
    setCropperOpen(false);
    setUploadingImage(true);
    try {
      const croppedBlob = await getCroppedImg(selectedImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Crop failed");
      
      const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "image");

      const res = await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProfileUploadProgress(percentCompleted);
        }
      });
      
      const newUrl = res.data.data.url;
      const key = activePersonaTab === 'universal' ? 'avatar_url' : `${activePersonaTab}_avatar_url`;
      const updatedData = { ...formData, [key]: newUrl };
      setFormData(updatedData);
      
      // Auto-save so it reflects across the platform
      await api.put("/social-profile", updatedData);
      toast.success(`${activePersonaTab.charAt(0).toUpperCase() + activePersonaTab.slice(1)} picture updated!`);
      
      // Hard refresh to ensure top nav and other contexts catch the new image
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
      setProfileUploadProgress(0);
    }
  };

  const togglePurpose = (p: string) => {
    setFormData(prev => {
      const purposes = prev.purposes.includes(p)
        ? prev.purposes.filter(x => x !== p)
        : [...prev.purposes, p];
      return { ...prev, purposes };
    });
  };

  const toggleInterest = (id: number) => {
    setFormData(prev => {
      const interests = prev.interests.includes(id)
        ? prev.interests.filter(x => x !== id)
        : [...prev.interests, id];
      if (interests.length > 5) {
        toast.error("You can select a maximum of 5 interests");
        return prev;
      }
      return { ...prev, interests };
    });
  };

  if (loading) return <div className="text-white/50 text-sm">Loading social profile...</div>;

  return (
    <div className="rounded-2xl border border-[#1e2329] bg-[#161a20] p-5 space-y-4">
      {cropperOpen && selectedImageSrc && (
        <ImageCropperModal 
          imageSrc={selectedImageSrc} 
          onClose={() => setCropperOpen(false)} 
          onCropComplete={handleCropComplete} 
        />
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold inline-flex items-center gap-2 text-[#f5f5f5]">
          <Heart className="w-5 h-5 text-pink-500" />
          Identity Profile
        </h2>
        <button 
          onClick={() => setEditMode(!editMode)}
          className="text-xs text-[#5bbcff] hover:text-[#1ea0ff] flex items-center gap-1"
        >
          <PenSquare className="w-3.5 h-3.5" />
          {editMode ? "Cancel" : "Edit"}
        </button>
      </div>

      {editMode ? (
        <div className="space-y-6">
          <div className="flex bg-[#0b0e11] p-1 rounded-xl border border-[#2b3139]">
            {["universal", "family", "business", "anonymous"].map(tab => (
              <button
                key={tab}
                onClick={() => setActivePersonaTab(tab as any)}
                className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-2 rounded-lg transition-all ${activePersonaTab === tab ? 'bg-[#5bbcff] text-[#09111c]' : 'text-[#848e9c] hover:text-[#f5f5f5]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 bg-[#111418] p-4 rounded-xl border border-[#2b3139]">
            <p className="text-xs text-[#848e9c] uppercase font-bold tracking-wide">
              {activePersonaTab === 'universal' ? 'Universal Avatar' : `${activePersonaTab} Persona Avatar`}
            </p>
            <div className="relative group w-24 h-24 rounded-full border-4 border-[#2b3139] overflow-hidden bg-[#0b0e11] flex items-center justify-center">
              {(activePersonaTab === 'universal' ? formData.avatar_url : (formData as any)[`${activePersonaTab}_avatar_url`]) ? (
                <img src={getMediaUrl(activePersonaTab === 'universal' ? formData.avatar_url : (formData as any)[`${activePersonaTab}_avatar_url`])} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#848e9c]" />
              )}
              
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                {uploadingImage ? (
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1"></div>
                    {profileUploadProgress > 0 && <span className="text-[10px] text-white font-bold">{profileUploadProgress}%</span>}
                  </div>
                ) : <Camera className="w-6 h-6 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={uploadingImage} />
              </label>
            </div>
            <p className="text-xs text-[#848e9c]">Click to change avatar</p>
          </div>

          {activePersonaTab === 'universal' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">First Name</label>
                <input 
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Last Name</label>
                <input 
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
                  placeholder="Last Name"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">{activePersonaTab} Display Name</label>
              <input 
                type="text"
                value={(formData as any)[`${activePersonaTab}_name`] || ""}
                onChange={(e) => setFormData({...formData, [`${activePersonaTab}_name`]: e.target.value})}
                className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
                placeholder={`e.g. ${activePersonaTab === 'family' ? 'Dad / Honey' : activePersonaTab === 'business' ? 'Dr. Smith' : 'Anonymous User'}`}
              />
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Username (Unique URL)</label>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#2b3139] bg-[#0b0e11] text-[#848e9c] text-sm">
                dapp/u/
              </span>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full rounded-r-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
                placeholder="your_custom_handle"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Bio</label>
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2.5 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Location</label>
              <input 
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
                placeholder="City"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Country</label>
              <input 
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
                placeholder="Country"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Date of Birth</label>
              <input 
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Interested In</label>
              <select 
                value={formData.interested_in}
                onChange={(e) => setFormData({...formData, interested_in: e.target.value})}
                className="mt-1 w-full rounded-lg border border-[#2b3139] bg-[#111418] p-2 text-sm text-[#f5f5f5] focus:border-[#5bbcff] focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="male">Men</option>
                <option value="female">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Onboarding Purpose</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {globalServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => togglePurpose(service.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    formData.purposes.includes(service.name)
                      ? "bg-[#5bbcff]/20 border-[#5bbcff] text-[#5bbcff]"
                      : "bg-[#111418] border-[#2b3139] text-[#848e9c] hover:border-white/20"
                  }`}
                >
                  {service.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#848e9c]">Interests (Max 5)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {globalInterests.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(Number(interest.id))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
                    formData.interests.includes(Number(interest.id))
                      ? "bg-gradient-to-r from-[#00E5FF]/20 to-[#8B5CF6]/20 border-[#00E5FF] text-white"
                      : "bg-[#111418] border-[#2b3139] text-[#848e9c] hover:border-white/20"
                  }`}
                >
                  <span>{interest.icon}</span>
                  <span>{interest.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-[#2b3139] bg-[#111418]">
            <div>
              <p className="text-sm font-bold text-white">Private Profile</p>
              <p className="text-xs text-[#848e9c]">Only connected users can see your posts and stories</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={formData.is_private} onChange={(e) => setFormData({...formData, is_private: e.target.checked})} />
              <div className="w-11 h-6 bg-[#2b3139] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5bbcff]"></div>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#5bbcff] px-4 py-2 text-sm font-semibold text-[#09111c] hover:bg-[#1ea0ff] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {(formData.first_name || formData.last_name) && (
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-4 text-[#eaecef]">
              <p className="text-[#848e9c] text-xs mb-1">Full Name</p>
              <p className="font-semibold text-lg">{formData.first_name} {formData.last_name}</p>
            </div>
          )}
          {formData.username && (
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-4 text-[#eaecef]">
              <p className="text-[#848e9c] text-xs mb-1">Public URL</p>
              <a href={`/dapp/u/${formData.username}`} target="_blank" rel="noopener noreferrer" className="text-[#5bbcff] hover:underline font-medium">
                {window.location.host}/dapp/u/{formData.username}
              </a>
            </div>
          )}
          <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-4 text-[#eaecef]">
            <p className="text-[#848e9c] text-xs mb-1">About Me</p>
            <p className="whitespace-pre-wrap">{formData.bio || "No bio added yet."}</p>
          </div>
          <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-4 flex items-center justify-between">
            <span className="text-[#848e9c] text-xs font-medium uppercase tracking-wide">Account Privacy</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${formData.is_private ? 'bg-red-500/20 text-red-400' : 'bg-[#0ecb81]/20 text-[#0ecb81]'}`}>
              {formData.is_private ? 'Private' : 'Public'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-3 flex flex-col justify-center">
              <p className="text-[#848e9c] text-[10px] uppercase flex items-center gap-1"><MapPin className="w-3 h-3 text-[#5bbcff]"/> Location</p>
              <p className="text-[#f5f5f5] font-medium mt-1 truncate">{formData.location || "-"}</p>
            </div>
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-3 flex flex-col justify-center">
              <p className="text-[#848e9c] text-[10px] uppercase flex items-center gap-1"><Globe className="w-3 h-3 text-[#5bbcff]"/> Country</p>
              <p className="text-[#f5f5f5] font-medium mt-1 truncate">{formData.country || "-"}</p>
            </div>
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-3 flex flex-col justify-center">
              <p className="text-[#848e9c] text-[10px] uppercase flex items-center gap-1"><Calendar className="w-3 h-3 text-[#5bbcff]"/> DOB</p>
              <p className="text-[#f5f5f5] font-medium mt-1 truncate">{formData.dob || "-"}</p>
            </div>
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-3 flex flex-col justify-center">
              <p className="text-[#848e9c] text-[10px] uppercase">Gender</p>
              <p className="text-[#f5f5f5] font-medium mt-1 truncate capitalize">{formData.gender || "-"}</p>
            </div>
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-3 flex flex-col justify-center col-span-2 md:col-span-1">
              <p className="text-[#848e9c] text-[10px] uppercase">Interested In</p>
              <p className="text-[#f5f5f5] font-medium mt-1 truncate capitalize">{formData.interested_in === 'male' ? 'Men' : formData.interested_in === 'female' ? 'Women' : formData.interested_in || "-"}</p>
            </div>
          </div>

          {formData.purposes.length > 0 && (
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-4 text-[#eaecef]">
              <p className="text-[#848e9c] text-xs mb-2 uppercase tracking-wide">Purpose / Services</p>
              <div className="flex flex-wrap gap-1.5">
                {formData.purposes.map((p, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#5bbcff]/10 border border-[#5bbcff]/20 text-[#5bbcff]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {formData.interests.length > 0 && (
            <div className="rounded-xl border border-[#2b3139] bg-[#111418] p-4 text-[#eaecef]">
              <p className="text-[#848e9c] text-xs mb-2 uppercase tracking-wide">My Interests</p>
              <div className="flex flex-wrap gap-1.5">
                {formData.interests.map((intId) => {
                  const interest = globalInterests.find(i => Number(i.id) === intId);
                  return (
                    <span key={intId} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-white flex items-center gap-1">
                      <span>{interest?.icon || "✨"}</span>
                      <span>{interest?.name || `Interest #${intId}`}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
