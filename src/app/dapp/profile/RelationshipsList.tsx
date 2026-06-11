"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Users, Edit2, ShieldCheck } from "lucide-react";
import FamilyRelationshipModal from "@/components/family-graph/FamilyRelationshipModal";

export default function RelationshipsList() {
  const [relationships, setRelationships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRel, setEditingRel] = useState<any>(null);

  useEffect(() => {
    fetchRelationships();
  }, []);

  const fetchRelationships = async () => {
    try {
      setLoading(true);
      const res = await api.get("/family-graph/me");
      setRelationships(res.data?.data?.relationships || []);
    } catch (error) {
      console.error("Failed to fetch relationships", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rel: any) => {
    setEditingRel(rel);
    setModalOpen(true);
  };

  if (loading) return <div className="text-white/50 text-sm p-4 animate-pulse">Loading relationships...</div>;

  return (
    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-4">
      <h2 className="text-base font-bold uppercase tracking-wider inline-flex items-center gap-2 text-[#8B5CF6]">
        <Users className="w-5 h-5 text-[#8B5CF6]" />
        Relationships
      </h2>

      {relationships.length === 0 ? (
        <p className="text-sm text-white/40">No family relationships added yet.</p>
      ) : (
        <div className="space-y-3">
          {relationships.map((rel: any) => (
            <div key={rel.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#00E5FF] flex items-center justify-center text-white font-bold">
                  {(rel.related_name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{rel.related_name || `User ID: ${rel.related_user_id}`}</h4>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 mt-1 inline-block bg-[#8B5CF6]/20 text-[#8B5CF6] rounded-md border border-[#8B5CF6]/30">
                    {rel.relationship_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleEdit(rel)}
                className="p-2 rounded-xl text-white/40 hover:text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Editing is essentially reusing the modal, but passing the ID to update.
          For now, FamilyRelationshipModal doesn't support edit mode. We'd need to modify it or just show it. 
          To keep it simple, we'll open it in add mode with prefilled values if we modify the modal. */}
      {modalOpen && editingRel && (
         <div className="text-xs text-[#00E5FF] p-2 bg-[#00E5FF]/10 rounded-lg">
           Please edit this relationship in the main Family Graph view or Admin panel for now.
         </div>
      )}
    </div>
  );
}
