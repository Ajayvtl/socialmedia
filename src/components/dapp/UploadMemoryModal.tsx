import { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Users, Calendar, MapPin, Tag, Heart, FileText, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import api, { getMediaUrl } from "@/lib/api";
import toast from "react-hot-toast";

interface ConnectionItem {
  id: number;
  name: string;
  avatar?: string;
  relationship?: string;
}

export default function UploadMemoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [vaultId, setVaultId] = useState<number | null>(null);
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [selectedConnections, setSelectedConnections] = useState<number[]>([]);
  
  const [memoryDate, setMemoryDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [locationName, setLocationName] = useState<string>("");
  const [category, setCategory] = useState<string>("Family");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [story, setStory] = useState<string>("");
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadVaults();
      loadConnections();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setSelectedConnections([]);
    setMemoryDate(new Date().toISOString().substring(0, 10));
    setLocationName("");
    setCategory("Family");
    setSelectedFile(null);
    setTitle("");
    setStory("");
  };

  const loadVaults = async () => {
    try {
      const res = await api.get('/memory-wallet/vaults');
      if (res.data?.data?.length > 0) {
        setVaultId(res.data.data[0].id);
      }
    } catch (e) {
      console.error("Failed to load vaults:", e);
    }
  };

  const loadConnections = async () => {
    try {
      const res = await api.get('/family-graph/me');
      const data = res.data?.data;
      const list = [
        ...(data?.relationships || []).map((r: any) => ({
          id: r.related_user_id || r.id,
          name: r.related_name || r.display_name || r.name,
          avatar: r.avatar_url,
          relationship: r.relationship_type
        })),
        ...(data?.connections || []).map((c: any) => ({
          id: c.connection_id || c.id,
          name: c.display_name || c.username,
          avatar: c.avatar_url,
          relationship: 'connection'
        }))
      ].filter((p, index, self) => p.id && self.findIndex(o => o.id === p.id) === index);
      setConnections(list);
    } catch (e) {
      console.error("Failed to load connections:", e);
    }
  };

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      // Auto-populate title if empty
      if (!title) {
        const fileNameWithoutExt = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setTitle(fileNameWithoutExt);
      }
    }
  };

  const handleUpload = async () => {
    if (!vaultId) {
      toast.error("No memory vault initialized.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please upload a media file.");
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Upload media file
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const mediaRes = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const mediaFileId = mediaRes.data?.data?.id;
      if (!mediaFileId) {
        throw new Error("Failed to get media file ID from server");
      }

      // Step 2: Create memory wallet item
      const itemRes = await api.post('/memory-wallet/items', {
        vault_id: vaultId,
        media_file_id: mediaFileId,
        title: title || selectedFile.name,
        caption: story || null,
        location_name: locationName || null,
        memory_date: memoryDate || null,
        memory_type: selectedFile.type.startsWith('video') ? 'video' : 'photo',
        visibility: 'vault'
      });

      const memoryId = itemRes.data?.data?.id;

      // Step 3: Tag users if selected
      if (memoryId && selectedConnections.length > 0) {
        await api.post(`/shared-memories/${memoryId}/tags`, {
          user_ids: selectedConnections
        });
      }

      toast.success("Memory saved successfully!");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload memory");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleConnectionTag = (id: number) => {
    setSelectedConnections(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Users className="w-12 h-12 text-[#FF4D8D] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Who is in this memory?</h2>
              <p className="text-white/50 text-xs">Tag family members or connections to share the story</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {connections.map(person => (
                <button 
                  key={person.id} 
                  onClick={() => toggleConnectionTag(person.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${selectedConnections.includes(person.id) ? 'bg-[#FF4D8D]/20 border-[#FF4D8D]' : 'bg-white/5 border-white/10'}`}
                >
                  <div className="flex items-center gap-2 text-left min-w-0">
                    {person.avatar ? (
                      <img src={getMediaUrl(person.avatar)} className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs shrink-0 text-white">
                        {person.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-xs truncate">{person.name}</p>
                      <p className="text-[9px] text-white/40 capitalize">{person.relationship}</p>
                    </div>
                  </div>
                  {selectedConnections.includes(person.id) && <CheckCircle2 className="w-4 h-4 text-[#FF4D8D] shrink-0" />}
                </button>
              ))}
              {connections.length === 0 && (
                <p className="text-xs text-white/40 italic text-center col-span-2 py-4">No connections found in your Family Graph.</p>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-[#00E5FF] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">When did this happen?</h2>
              <p className="text-white/50 text-xs">Timeline context aligns your legacy milestones</p>
            </div>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <input 
                type="date"
                value={memoryDate}
                onChange={(e) => setMemoryDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#00E5FF] focus:outline-none [color-scheme:dark]"
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {['Today', 'Christmas', 'Birthday', 'Anniversary', 'Summer Trip'].map(label => (
                  <button
                    key={label}
                    onClick={() => {
                      if (label === 'Today') {
                        setMemoryDate(new Date().toISOString().substring(0, 10));
                      }
                    }}
                    className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-[#FACC15] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Where were you?</h2>
              <p className="text-white/50 text-xs">Add location details to group memories by trips</p>
            </div>
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <input 
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Goa, India"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#FACC15] focus:outline-none"
              />
              <div className="flex flex-wrap gap-2 justify-center">
                {['Home', 'Temple', 'Goa', 'Park', 'Grandpa\'s House'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setLocationName(loc)}
                    className="px-3 py-1.5 rounded-full border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Tag className="w-12 h-12 text-[#8B5CF6] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">What type of memory is this?</h2>
              <p className="text-white/50 text-xs">Categorize this artifact for the legacy vault</p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              {['Family', 'Milestone', 'Travel', 'Achievement', 'Tradition', 'Legacy'].map(type => (
                <button 
                  key={type} 
                  onClick={() => setCategory(type)}
                  className={`p-3 rounded-xl border text-center transition-colors text-xs font-semibold ${category === type ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-white' : 'bg-white/5 border-white/10 text-white/60'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <UploadCloud className="w-12 h-12 text-[#00E5FF] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Attach the Artifact</h2>
              <p className="text-white/50 text-xs">Upload your image, video or letter</p>
            </div>
            
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer max-w-xs mx-auto"
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-[#00E5FF] mx-auto" />
                  <p className="text-white font-bold text-xs truncate max-w-[200px] mx-auto">{selectedFile.name}</p>
                  <p className="text-white/40 text-[10px]">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-white font-bold text-xs">Click to Browse</p>
                  <p className="text-white/40 text-[10px]">Photos or Videos (up to 50MB)</p>
                </div>
              )}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <FileText className="w-12 h-12 text-white mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Tell the Story</h2>
              <p className="text-white/50 text-xs">Give this memory a title and write down what happened</p>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Memory Title"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs focus:border-[#FF4D8D] focus:outline-none"
              />
              <textarea 
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#FF4D8D] resize-none"
                placeholder="Write what this memory means to you..."
              />
            </div>
          </div>
        );
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return true; // Tagging can be skipped
      case 2: return !!memoryDate;
      case 3: return true; // Location can be skipped
      case 4: return !!category;
      case 5: return !!selectedFile;
      case 6: return !!title;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#050816] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-[#FF4D8D] to-[#00E5FF] transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }} />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10 p-2">
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 pt-10 min-h-[380px] flex flex-col justify-between">
          
          {renderStepContent()}

          <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
            <button 
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${step === 1 ? 'text-white/20' : 'text-white/60 hover:text-white'}`}
            >
              <ChevronLeft size={16} /> Back
            </button>
            
            {step < 6 ? (
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold transition-all ${isStepValid() ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleUpload}
                disabled={isUploading || !isStepValid()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity"
              >
                {isUploading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
                ) : 'Save Memory'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
