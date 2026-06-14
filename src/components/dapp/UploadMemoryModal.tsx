import { useState } from "react";
import { X, UploadCloud, Users, Calendar, MapPin, Tag, Heart, FileText, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import api from "@/lib/api";

export default function UploadMemoryModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [memoryData, setMemoryData] = useState<any>({
    who: [],
    when: "",
    where: "",
    type: "",
    media: null,
    story: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, 6));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // Mock upload for MVP
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In reality: upload media to /api/media, get ID, then post to /api/memory-wallet/items
      onClose();
      setStep(1);
      setMemoryData({ who: [], when: "", where: "", type: "", media: null, story: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSelection = (field: string, value: string) => {
    setMemoryData((prev: any) => {
      if (Array.isArray(prev[field])) {
        if (prev[field].includes(value)) {
          return { ...prev, [field]: prev[field].filter((i: string) => i !== value) };
        } else {
          return { ...prev, [field]: [...prev[field], value] };
        }
      }
      return { ...prev, [field]: value };
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
              <p className="text-white/50">Tag family members or connections</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Mom', 'Dad', 'Sister', 'Wife', 'Son', 'Daughter', 'Ajay'].map(person => (
                <button 
                  key={person} 
                  onClick={() => toggleSelection('who', person)}
                  className={`p-4 rounded-xl border ${memoryData.who.includes(person) ? 'bg-[#FF4D8D]/20 border-[#FF4D8D]' : 'bg-white/5 border-white/10'} text-left transition-colors flex items-center justify-between`}
                >
                  <span className="font-medium text-white">{person}</span>
                  {memoryData.who.includes(person) && <CheckCircle2 className="w-5 h-5 text-[#FF4D8D]" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-[#00E5FF] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">When did this happen?</h2>
              <p className="text-white/50">Context helps organize the timeline</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Today', 'Birthday', 'Anniversary', 'Trip', 'Wedding', 'Custom Date'].map(time => (
                <button 
                  key={time} 
                  onClick={() => toggleSelection('when', time)}
                  className={`p-4 rounded-xl border ${memoryData.when === time ? 'bg-[#00E5FF]/20 border-[#00E5FF]' : 'bg-white/5 border-white/10'} text-left transition-colors`}
                >
                  <span className="font-medium text-white">{time}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-[#FACC15] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Where were you?</h2>
              <p className="text-white/50">Add location context</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Home', 'School', 'Temple', 'Goa', 'Trip', 'Custom Location'].map(loc => (
                <button 
                  key={loc} 
                  onClick={() => toggleSelection('where', loc)}
                  className={`p-4 rounded-xl border ${memoryData.where === loc ? 'bg-[#FACC15]/20 border-[#FACC15]' : 'bg-white/5 border-white/10'} text-left transition-colors`}
                >
                  <span className="font-medium text-white">{loc}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <Tag className="w-12 h-12 text-[#8B5CF6] mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">What type of memory is this?</h2>
              <p className="text-white/50">Categorize for the legacy vault</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Family', 'Milestone', 'Travel', 'Achievement', 'Tradition', 'Legacy'].map(type => (
                <button 
                  key={type} 
                  onClick={() => toggleSelection('type', type)}
                  className={`p-4 rounded-xl border ${memoryData.type === type ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]' : 'bg-white/5 border-white/10'} text-left transition-colors`}
                >
                  <span className="font-medium text-white">{type}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-6">
              <UploadCloud className="w-12 h-12 text-white mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-white">Add the Artifact</h2>
              <p className="text-white/50">Upload the actual memory</p>
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => toggleSelection('media', 'mock_file.jpg')}>
              {memoryData.media ? (
                <div>
                  <CheckCircle2 className="w-12 h-12 text-[#00E5FF] mx-auto mb-2" />
                  <p className="text-white font-medium">Media Attached</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium mb-2">Tap to Upload</p>
                  <p className="text-white/40 text-sm">Photo • Video • Voice Note • Letter</p>
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
              <p className="text-white/50">Not just a caption. What does this mean to you?</p>
            </div>
            <textarea 
              value={memoryData.story}
              onChange={(e) => setMemoryData({...memoryData, story: e.target.value})}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#FF4D8D] resize-none"
              placeholder="e.g., Dad teaching me to ride a bike for the first time..."
            />
          </div>
        );
    }
  };

  const isStepValid = () => {
    switch(step) {
      case 1: return memoryData.who.length > 0;
      case 2: return !!memoryData.when;
      case 3: return !!memoryData.where;
      case 4: return !!memoryData.type;
      case 5: return !!memoryData.media;
      case 6: return true;
      default: return true;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-[#050816] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/5">
          <div className="h-full bg-gradient-to-r from-[#FF4D8D] to-[#00E5FF] transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }} />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10 p-2">
          <X size={24} />
        </button>

        <div className="p-6 md:p-10 pt-12 min-h-[400px] flex flex-col justify-between">
          
          {renderStepContent()}

          <div className="flex justify-between items-center mt-10">
            <button 
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center gap-2 font-medium transition-colors ${step === 1 ? 'text-white/20' : 'text-white/60 hover:text-white'}`}
            >
              <ChevronLeft size={20} /> Back
            </button>
            
            {step < 6 ? (
              <button 
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all ${isStepValid() ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
              >
                Next <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-2 rounded-full font-bold bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity"
              >
                {isUploading ? 'Saving...' : 'Save Memory'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
