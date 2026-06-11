"use client";

import React, { useState } from 'react';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { useCollageTemplates, useCreateCollageTemplate, useUpdateCollageTemplate, useDeleteCollageTemplate } from '@/features/memoryWallet/hooks/useMemoryWallet';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Power, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CollageTemplatesAdminPage() {
  const { data: templates = [], isLoading } = useCollageTemplates(true);
  const { mutate: createTemplate } = useCreateCollageTemplate();
  const { mutate: updateTemplate } = useUpdateCollageTemplate();
  const { mutate: deleteTemplate } = useDeleteCollageTemplate();

  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    layout_config: '{\n  "type": "masonry",\n  "cssClass": "columns-3 gap-4",\n  "items": []\n}',
    priority: 0,
    min_items: 1,
    max_items: 10,
    is_active: true
  });

  const handleEdit = (t: any) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name,
      layout_config: typeof t.layout_config === 'string' ? t.layout_config : JSON.stringify(t.layout_config, null, 2),
      priority: t.priority,
      min_items: t.min_items,
      max_items: t.max_items,
      is_active: t.is_active
    });
  };

  const handleSave = () => {
    try {
      JSON.parse(formData.layout_config); // Validate JSON
    } catch(e) {
      toast.error("Invalid JSON configuration");
      return;
    }

    if (editingTemplate) {
      updateTemplate({ id: editingTemplate.id, data: formData }, {
        onSuccess: () => {
          toast.success("Template updated");
          setEditingTemplate(null);
        }
      });
    } else {
      createTemplate(formData, {
        onSuccess: () => {
          toast.success("Template created");
          setEditingTemplate(null);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id, {
        onSuccess: () => toast.success("Template deleted")
      });
    }
  };

  const toggleActive = (t: any) => {
    updateTemplate({ id: t.id, data: { is_active: !t.is_active } }, {
      onSuccess: () => toast.success(`Template ${!t.is_active ? 'Activated' : 'Deactivated'}`)
    });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Memory Collage Templates" 
        description="Manage the dynamic layout algorithms for the Memory Wallet Auto-Collage engine."
        actions={
          <Button onClick={() => {
            setEditingTemplate(null);
            setFormData({
              name: '',
              layout_config: '{\n  "type": "masonry",\n  "cssClass": "columns-3 gap-4",\n  "items": []\n}',
              priority: 0,
              min_items: 1,
              max_items: 10,
              is_active: true
            });
          }}>
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="p-8 text-center text-white/50">Loading templates...</div>
          ) : templates.map((t: any) => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${t.is_active ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/40'}`}>
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    {t.name}
                    {!t.is_active && <span className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full uppercase tracking-wider font-bold">Inactive</span>}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">
                    Priority: {t.priority} • Fits: {t.min_items}-{t.max_items} memories
                  </p>
                  <p className="text-xs text-white/30 mt-1 font-mono">
                    {JSON.parse(typeof t.layout_config === 'string' ? t.layout_config : JSON.stringify(t.layout_config))?.cssClass || 'No CSS Class'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(t)} className={`p-2 rounded-lg transition-colors ${t.is_active ? 'hover:bg-red-500/20 text-white/50 hover:text-red-400' : 'hover:bg-cyan-500/20 text-white/50 hover:text-cyan-400'}`} title={t.is_active ? "Deactivate" : "Activate"}>
                  <Power className="w-5 h-5" />
                </button>
                <button onClick={() => handleEdit(t)} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Edit">
                  <Edit2 className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Editor Form */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-fit sticky top-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Template Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Hero Top Grid"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Priority</label>
                <input 
                  type="number" 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Min Items</label>
                <input 
                  type="number" 
                  value={formData.min_items}
                  onChange={e => setFormData({...formData, min_items: parseInt(e.target.value) || 0})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Max Items</label>
                <input 
                  type="number" 
                  value={formData.max_items}
                  onChange={e => setFormData({...formData, max_items: parseInt(e.target.value) || 0})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 flex justify-between">
                <span>Layout Config (JSON)</span>
                <span className="text-[10px] uppercase text-cyan-400 font-bold">Engine Mapping</span>
              </label>
              <textarea 
                value={formData.layout_config}
                onChange={e => setFormData({...formData, layout_config: e.target.value})}
                className="w-full bg-black/80 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm h-64 focus:outline-none focus:border-cyan-500"
                spellCheck={false}
              />
            </div>

            <Button onClick={handleSave} className="w-full mt-4">
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
