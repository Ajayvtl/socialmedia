import { useState } from "react";
import { X, Users, Loader2 } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface FamilyRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
  onSuccess?: () => void;
}

export default function FamilyRelationshipModal({ isOpen, onClose, targetUser, onSuccess }: FamilyRelationshipModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    relationship_type: "sibling",
    notes: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/family-graph/relationships", {
        related_user_id: targetUser?.id,
        related_name: targetUser?.name,
        relationship_type: formData.relationship_type,
        notes: formData.notes
      });
      toast.success("Relationship added to Family Graph!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add relationship");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0a0f24] border border-white/10 rounded-3xl w-full max-w-md relative overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.1)]">
        
        {/* Header */}
        <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00E5FF]" />
              Add to Family Graph
            </h2>
            <p className="text-white/50 text-xs mt-1">Connect {targetUser?.name || "this user"} to your tree</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <SearchableSelect 
                label="Relationship Type"
                value={formData.relationship_type}
                onChange={val => setFormData({ ...formData, relationship_type: val })}
                options={[
                  { value: 'father', label: 'Father' },
                  { value: 'mother', label: 'Mother' },
                  { value: 'sibling', label: 'Sibling' },
                  { value: 'spouse', label: 'Spouse' },
                  { value: 'child', label: 'Child' },
                  { value: 'relative', label: 'Relative' },
                  { value: 'friend', label: 'Friend' },
                  { value: 'close_friend', label: 'Close Friend' },
                  { value: 'business', label: 'Business' },
                  { value: 'college_friend', label: 'College Friend' }
                ]}
                className="[&>div>div]:bg-[#050816]/60 [&>div>div]:border-white/10 [&>div>div]:text-white [&>label]:text-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white/70 mb-2 block">Notes (Optional)</label>
              <textarea 
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any specific notes about this relation?"
                className="w-full bg-[#050816]/60 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00E5FF] transition-all placeholder:text-white/20"
                rows={3}
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#8B5CF6] text-white font-bold py-3.5 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to Family Graph"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
