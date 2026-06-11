"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type Service = {
  id: number;
  name: string;
  country: string;
  min_age: number;
  max_age: number;
  is_active: number;
};

export default function ServicesPage() {
  const { user } = useAuth();
  const isDeveloper = user?.role === "DEVELOPER" || user?.role === "SUPER_ADMIN";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("ALL");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(100);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/settings/services");
      setServices(res.data?.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeveloper) return toast.error("Only developers can perform this action");

    try {
      const payload = {
        name,
        country,
        min_age: minAge,
        max_age: maxAge,
        is_active: isActive ? 1 : 0
      };

      if (editingId) {
        await api.put(`/settings/services/${editingId}`, payload);
        toast.success("Service updated");
      } else {
        await api.post("/settings/services", payload);
        toast.success("Service created");
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Operation failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!isDeveloper) return toast.error("Only developers can perform this action");
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      await api.delete(`/settings/services/${id}`);
      toast.success("Service deleted");
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Operation failed");
    }
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setName(s.name);
    setCountry(s.country);
    setMinAge(s.min_age);
    setMaxAge(s.max_age);
    setIsActive(s.is_active === 1);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setCountry("ALL");
    setMinAge(18);
    setMaxAge(100);
    setIsActive(true);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Onboarding Services</h1>
          <p className="text-slate-500">Configure "You are here for" options dynamically based on demographics.</p>
        </div>
        {isDeveloper && (
          <button onClick={openCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4">Service Name</th>
              <th className="px-6 py-4">Country Target</th>
              <th className="px-6 py-4">Age Range</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">No services configured.</td></tr>
            ) : (
              services.map(s => (
                <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-6 py-4 font-medium">{s.name}</td>
                  <td className="px-6 py-4">{s.country === 'ALL' ? <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs">Global</span> : s.country}</td>
                  <td className="px-6 py-4">{s.min_age} - {s.max_age} yrs</td>
                  <td className="px-6 py-4">
                    {s.is_active ? (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium"><CheckCircle className="w-3.5 h-3.5"/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600 text-xs font-medium"><XCircle className="w-3.5 h-3.5"/> Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isDeveloper && (
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEdit(s)} className="text-blue-500 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="text-rose-500 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Service" : "New Service"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Service Name (e.g. Dating)</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Country Code (or ALL)</label>
                <input required value={country} onChange={e => setCountry(e.target.value.toUpperCase())} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" placeholder="US, IN, UK, ALL" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Age</label>
                  <input type="number" required value={minAge} onChange={e => setMinAge(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Age</label>
                  <input type="number" required value={maxAge} onChange={e => setMaxAge(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded border-slate-300" />
                <label htmlFor="isActive" className="text-sm font-medium">Service is Enabled</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
