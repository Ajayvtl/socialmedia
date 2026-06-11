"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Shield, ShieldAlert, FileText, CheckCircle, XCircle, Trash2, Plus, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"reports" | "words">("reports");
  
  // Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  
  // Words State
  const [bannedWords, setBannedWords] = useState<any[]>([]);
  const [newWord, setNewWord] = useState("");
  const [isLoadingWords, setIsLoadingWords] = useState(false);

  // Modal State
  const [reportToHide, setReportToHide] = useState<number | null>(null);
  const [hideReason, setHideReason] = useState("This content was removed due to a copyright report.");

  useEffect(() => {
    if (activeTab === "reports") fetchReports();
    if (activeTab === "words") fetchWords();
  }, [activeTab]);

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await api.get("/admin/moderation/reports");
      setReports(res.data?.data || []);
    } catch (e) {
      toast.error("Failed to fetch copyright reports");
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchWords = async () => {
    setIsLoadingWords(true);
    try {
      const res = await api.get("/admin/moderation/banned-words");
      setBannedWords(res.data?.data || []);
    } catch (e) {
      toast.error("Failed to fetch banned words");
    } finally {
      setIsLoadingWords(false);
    }
  };

  const updateReportStatus = async (id: number, status: string, customReason?: string) => {
    try {
      await api.put(`/admin/moderation/reports/${id}`, { status, hiddenReason: customReason });
      toast.success("Report updated successfully");
      fetchReports();
      setReportToHide(null);
    } catch (e) {
      toast.error("Failed to update report");
    }
  };

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    try {
      await api.post("/admin/moderation/banned-words", { word: newWord.trim().toLowerCase() });
      setNewWord("");
      toast.success("Banned word added");
      fetchWords();
    } catch (e) {
      toast.error("Failed to add banned word");
    }
  };

  const handleDeleteWord = async (id: number) => {
    try {
      await api.delete(`/admin/moderation/banned-words/${id}`);
      toast.success("Word removed");
      fetchWords();
    } catch (e) {
      toast.error("Failed to remove word");
    }
  };

  if (!user || !['USER', 'SUPER_ADMIN', 'COMPANY_ADMIN', 'SUPPORT_ADMIN', 'DEVELOPER'].includes(user.role || '')) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <GlassPanel className="p-8 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60">You do not have permission to view the Admin Portal.</p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 h-screen overflow-y-auto hide-scrollbar max-w-6xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#00E5FF]/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide">Developer & Admin Portal</h1>
          <p className="text-white/60 text-sm mt-1">Manage platform safety, copyright, and content rules.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "reports" 
              ? "bg-gradient-to-r from-[#00E5FF]/20 to-[#8B5CF6]/20 text-[#00E5FF] border border-[#00E5FF]/50" 
              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
          }`}
        >
          <FileText className="w-5 h-5" />
          Copyright Reports
        </button>
        <button
          onClick={() => setActiveTab("words")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "words" 
              ? "bg-gradient-to-r from-[#FF4D8D]/20 to-[#8B5CF6]/20 text-[#FF4D8D] border border-[#FF4D8D]/50" 
              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
          }`}
        >
          <XCircle className="w-5 h-5" />
          Banned Words Configuration
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "reports" && (
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00E5FF]" /> Active Reports
              </h2>
              <button onClick={fetchReports} className="text-white/60 hover:text-white p-2">
                <RefreshCw className={`w-5 h-5 ${isLoadingReports ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 text-sm font-semibold text-white/50">Date</th>
                    <th className="p-3 text-sm font-semibold text-white/50">Reporter</th>
                    <th className="p-3 text-sm font-semibold text-white/50">Target</th>
                    <th className="p-3 text-sm font-semibold text-white/50">Reason</th>
                    <th className="p-3 text-sm font-semibold text-white/50">Status</th>
                    <th className="p-3 text-sm font-semibold text-white/50 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-white/40">No reports found.</td>
                    </tr>
                  ) : (
                    reports.map(report => (
                      <tr key={report.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3 text-sm text-white/80">{new Date(report.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-sm text-[#00E5FF]">{report.reporter_email || `User #${report.reporter_id}`}</td>
                        <td className="p-3 text-sm text-white/80 capitalize">
                          {report.target_type} #{report.target_id}
                        </td>
                        <td className="p-3 text-sm text-white/80 max-w-[200px] truncate" title={report.reason}>{report.reason}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            report.status === 'reviewed' ? 'bg-blue-500/20 text-blue-400' :
                            report.status === 'hidden' ? 'bg-red-500/20 text-red-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex justify-end gap-2">
                          {report.status !== 'hidden' && (
                            <button
                              onClick={() => setReportToHide(report.id)}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded text-xs font-bold transition-colors"
                            >
                              Hide Post
                            </button>
                          )}
                          {report.status !== 'rejected' && (
                            <button
                              onClick={() => updateReportStatus(report.id, 'rejected')}
                              className="px-3 py-1.5 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        )}

        {activeTab === "words" && (
          <GlassPanel className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#FF4D8D]" /> Banned Words
              </h2>
              
              <form onSubmit={handleAddWord} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  placeholder="Enter word to ban..."
                  className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-[#FF4D8D] text-sm"
                />
                <button
                  type="submit"
                  disabled={!newWord.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF4D8D] to-[#8B5CF6] text-white rounded-xl font-bold flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>
            
            {isLoadingWords ? (
              <div className="py-8 flex justify-center"><RefreshCw className="w-6 h-6 text-[#FF4D8D] animate-spin" /></div>
            ) : bannedWords.length === 0 ? (
              <div className="p-8 text-center text-white/40">No banned words configured.</div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {bannedWords.map(word => (
                  <div key={word.id} className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-[#FF4D8D]/30 rounded-lg group">
                    <span className="text-white/90 text-sm font-medium">{word.word}</span>
                    <button
                      onClick={() => handleDeleteWord(word.id)}
                      className="text-white/40 hover:text-[#FF4D8D] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        )}
      </div>

      {/* Hide Reason Modal */}
      {reportToHide !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161a20] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Hide Content
            </h3>
            <p className="text-white/60 text-sm mb-4">
              Enter a reason to show in place of the hidden post. This will be publicly visible.
            </p>
            <input
              type="text"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-red-500 mb-4"
              value={hideReason}
              onChange={(e) => setHideReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-white/5 text-white/80 hover:text-white rounded-xl text-sm font-bold transition-colors"
                onClick={() => setReportToHide(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                onClick={() => updateReportStatus(reportToHide, 'hidden', hideReason)}
                disabled={!hideReason.trim()}
              >
                Confirm & Hide
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
