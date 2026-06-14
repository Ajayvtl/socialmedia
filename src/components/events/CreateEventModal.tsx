import React, { useState } from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { X, Calendar, MapPin, Image as ImageIcon, Map, Headphones, Loader2, Video, Users, Heart, Briefcase, Presentation, MonitorPlay, Sparkles, PartyPopper } from 'lucide-react';
import api, { getMediaUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import ImageCropperModal from '@/components/ui/ImageCropperModal';
import { getCroppedImg } from '@/lib/cropImage';
import { useSettings } from '@/context/SettingsContext';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  communityId?: number;
}

export default function CreateEventModal({ onClose, onSuccess, communityId }: Props) {
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'VIRTUAL',
    location: '',
    cover_image: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    max_attendees: '',
    ticket_type: 'FREE',
    ticket_price: '',
    currency: settings?.currency || 'INR'
  });

  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
       setSelectedImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    if (!selectedImageSrc) return;
    
    setIsUploading(true);
    setSelectedImageSrc(null); // close modal immediately
    try {
      const croppedBlob = await getCroppedImg(selectedImageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop");

      const file = new File([croppedBlob], "cover.jpg", { type: "image/jpeg" });
      const form = new FormData();
      form.append('file', file);
      
      const res = await api.post('/media/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.data && res.data.data.url) {
        setFormData(prev => ({ ...prev, cover_image: res.data.data.url }));
        toast.success("Cover photo uploaded!");
      } else {
         throw new Error("Invalid response");
      }
    } catch (err) {
      toast.error("Failed to upload image");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.title) return toast.error("Title is required");
    if (step === 2 && (!formData.start_date || !formData.start_time)) return toast.error("Start date and time are required");
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const startDateTime = `${formData.start_date} ${formData.start_time}:00`;
      const endDateTime = formData.end_date && formData.end_time ? `${formData.end_date} ${formData.end_time}:00` : null;

      await api.post('/events', {
        ...formData,
        community_id: communityId || null,
        start_time: startDateTime,
        end_time: endDateTime,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        ticket_price: formData.ticket_price ? parseFloat(formData.ticket_price) : 0
      });

      toast.success("Event created successfully!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <GlassPanel className="p-0 animate-in zoom-in-95 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border/50 bg-surface/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h3 className="font-bold text-2xl text-foreground tracking-tight">Host an Event</h3>
            <p className="text-xs text-foreground/60 font-medium mt-1">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-foreground/60 hover:text-foreground hover:bg-surface-secondary rounded-full transition-colors">
            <X className="w-6 h-6"/>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Event Title</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Neon City Cyber Rave"
                  className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors text-lg"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this event about?"
                  rows={4}
                  className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-3">Event Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                  {[
                    { id: 'VIRTUAL', icon: Map, label: 'Virtual 3D' },
                    { id: 'AUDIO', icon: Headphones, label: 'Audio Room' },
                    { id: 'VIDEO', icon: Video, label: 'Livestream' },
                    { id: 'IN_PERSON', icon: MapPin, label: 'In-Person' },
                    { id: 'COMMUNITY', icon: Users, label: 'Community' },
                    { id: 'DATING', icon: Heart, label: 'Dating' },
                    { id: 'NETWORKING', icon: Briefcase, label: 'Networking' },
                    { id: 'WORKSHOP', icon: Presentation, label: 'Workshop' },
                    { id: 'WEBINAR', icon: MonitorPlay, label: 'Webinar' },
                    { id: 'CREATOR', icon: Sparkles, label: 'Creator' },
                    { id: 'PARTY', icon: PartyPopper, label: 'Party' },
                  ].map(type => (
                    <div 
                      key={type.id}
                      onClick={() => setFormData({...formData, event_type: type.id})}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer border transition-all ${formData.event_type === type.id ? 'bg-primary/10 border-primary text-primary shadow-sm scale-105' : 'bg-surface border-border/50 text-foreground/60 hover:border-border hover:bg-surface-secondary'}`}
                    >
                      <type.icon className="w-5 h-5 mb-1.5" />
                      <span className="text-[10px] font-bold text-center leading-tight">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
               <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Start Date & Time</label>
                <div className="flex gap-3">
                  <input 
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="flex-1 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <input 
                    type="time"
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                    className="flex-1 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">End Date & Time <span className="text-foreground/40 font-normal">(Optional)</span></label>
                <div className="flex gap-3">
                  <input 
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({...formData, end_date: e.target.value})}
                    className="flex-1 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <input 
                    type="time"
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                    className="flex-1 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Location / Link</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                  <input 
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder={formData.event_type === 'IN_PERSON' ? '123 Main St, New York' : 'https://zoom.us/j/123456789'}
                    className="w-full bg-surface border border-border/50 rounded-xl pl-9 pr-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
               <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Cover Photo <span className="text-foreground/40 font-normal">(Optional)</span></label>
                <label className="w-full h-40 border-2 border-dashed border-border/50 rounded-xl bg-surface flex flex-col items-center justify-center text-foreground/50 hover:bg-surface-secondary hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} disabled={isUploading}/>
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center text-primary z-10 relative">
                      <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                      <span className="text-sm font-bold">Uploading...</span>
                    </div>
                  ) : formData.cover_image ? (
                    <>
                      <img src={getMediaUrl(formData.cover_image)} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-background/50 group-hover:bg-background/20 transition-colors"></div>
                      <div className="z-10 relative flex flex-col items-center justify-center text-white drop-shadow-md">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm font-bold">Change cover photo</span>
                      </div>
                    </>
                  ) : (
                    <div className="z-10 relative flex flex-col items-center justify-center group-hover:text-primary transition-colors">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload cover photo</span>
                      <span className="text-xs mt-1 text-foreground/40">Recommended: 1200x600px</span>
                    </div>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Maximum Attendees <span className="text-foreground/40 font-normal">(Optional)</span></label>
                <input 
                  type="number"
                  value={formData.max_attendees}
                  onChange={e => setFormData({...formData, max_attendees: e.target.value})}
                  placeholder="Leave blank for unlimited"
                  className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/80 mb-2">Ticketing <span className="text-foreground/40 font-normal">(Optional)</span></label>
                <div className="flex items-center gap-3 mb-3">
                  <button 
                    onClick={() => setFormData({...formData, ticket_type: 'FREE', ticket_price: ''})}
                    className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${formData.ticket_type === 'FREE' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border/50 text-foreground/60 hover:border-border'}`}
                  >
                    Free Entry
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, ticket_type: 'PAID'})}
                    className={`flex-1 py-2 rounded-xl border text-sm font-bold transition-all ${formData.ticket_type === 'PAID' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border/50 text-foreground/60 hover:border-border'}`}
                  >
                    Paid Ticket
                  </button>
                </div>
                {formData.ticket_type === 'PAID' && (
                  <div className="flex gap-3 animate-in slide-in-from-top-2">
                    <input 
                      type="number"
                      value={formData.ticket_price}
                      onChange={e => setFormData({...formData, ticket_price: e.target.value})}
                      placeholder="Ticket Price"
                      className="flex-1 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                    <select 
                      value={formData.currency}
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-24 bg-surface border border-border/50 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 bg-surface/50 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-md">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-sm font-bold text-foreground/60 hover:text-foreground px-4 py-2 transition-colors">
              Back
            </button>
          ) : <div></div>}
          
          {step < 3 ? (
            <GlowButton variant="primary" onClick={handleNext} className="px-8">Next Step</GlowButton>
          ) : (
            <GlowButton variant="primary" onClick={handleSubmit} disabled={isSubmitting} className="px-8">
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Creating...</> : 'Publish Event'}
            </GlowButton>
          )}
        </div>

      </GlassPanel>

      {selectedImageSrc && (
        <ImageCropperModal
          imageSrc={selectedImageSrc}
          onClose={() => setSelectedImageSrc(null)}
          onCropComplete={handleCropComplete}
          aspect={2}
          cropShape="rect"
        />
      )}
    </div>
  );
}
