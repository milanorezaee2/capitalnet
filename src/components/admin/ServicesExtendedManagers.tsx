/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin - Extended Management Components
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Users,
  Briefcase,
  TrendingUp,
  Globe,
  Mail,
  FileText,
  Layers,
  Zap,
  Target,
  Upload,
  Search,
  Filter,
} from 'lucide-react';
import {
  benefitsApi,
  processStepsApi,
  deliverablesApi,
  technologiesApi,
  portfolioApi,
  caseStudiesApi,
  statisticsApi,
  clientLogosApi,
  teamMembersApi,
  contactFormApi,
  newsletterApi,
  relatedContentApi,
  ctaApi,
} from '@/lib/cmsApi';
import {
  ServiceBenefit,
  ProcessStep,
  Deliverable,
  Technology,
  Portfolio,
  CaseStudy,
  Statistic,
  ClientLogo,
  TeamMember,
  ContactForm,
  Newsletter,
  RelatedContent,
  CTA,
} from '@/types/servicesCms';

// ─────────────────────────────────────────────────────────────────────────────
// BENEFITS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function BenefitsManager() {
  const [items, setItems] = useState<ServiceBenefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceBenefit>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await benefitsApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ order: items.length });
  };

  const handleEdit = (item: ServiceBenefit) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await benefitsApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await benefitsApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save benefit:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await benefitsApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete benefit:', error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index].order, newItems[index - 1].order] = [
      newItems[index - 1].order,
      newItems[index].order,
    ];
    await benefitsApi.reorder(
      newItems.map((c) => ({ id: c.id, order: c.order })),
      'user-id'
    );
    loadItems();
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index].order, newItems[index + 1].order] = [
      newItems[index + 1].order,
      newItems[index].order,
    ];
    await benefitsApi.reorder(
      newItems.map((c) => ({ id: c.id, order: c.order })),
      'user-id'
    );
    loadItems();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> مزیت جدید
      </button>

      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {editingId && (
          <div className="p-4 border-b border-white/7 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="عنوان"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="آیکون"
                value={editForm.icon || ''}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="توضیح"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
                rows={2}
              />
              <input
                type="color"
                value={editForm.color || '#06B6D4'}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> ذخیره
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> لغو
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {items.map((item, index) => (
            <div key={item.id} className="p-4 transition flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="flex items-center gap-3 flex-1">
                {item.icon && <span className="text-2xl">{item.icon}</span>}
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded disabled:opacity-50" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="p-1 rounded disabled:opacity-50" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESS STEPS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function ProcessStepsManager() {
  const [items, setItems] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProcessStep>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await processStepsApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load process steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ step: items.length + 1, order: items.length });
  };

  const handleEdit = (item: ProcessStep) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await processStepsApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await processStepsApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save process step:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await processStepsApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete process step:', error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index].order, newItems[index - 1].order] = [
      newItems[index - 1].order,
      newItems[index].order,
    ];
    await processStepsApi.reorder(
      newItems.map((c) => ({ id: c.id, order: c.order })),
      'user-id'
    );
    loadItems();
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index].order, newItems[index + 1].order] = [
      newItems[index + 1].order,
      newItems[index].order,
    ];
    await processStepsApi.reorder(
      newItems.map((c) => ({ id: c.id, order: c.order })),
      'user-id'
    );
    loadItems();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> مرحله جدید
      </button>

      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {editingId && (
          <div className="p-4 border-b border-white/7 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="شماره مرحله"
                value={editForm.step || ''}
                onChange={(e) => setEditForm({ ...editForm, step: parseInt(e.target.value) })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="عنوان"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="توضیح"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
                rows={2}
              />
              <input
                type="text"
                placeholder="آیکون"
                value={editForm.icon || ''}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="لینک"
                value={editForm.link || ''}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="color"
                value={editForm.color || '#06B6D4'}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> ذخیره
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> لغو
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {items.map((item, index) => (
            <div key={item.id} className="p-4 transition flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-cyan-400 font-bold" style={{ background: 'rgba(34,211,238,0.15)' }}>
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 rounded disabled:opacity-50" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === items.length - 1}
                  className="p-1 rounded disabled:opacity-50" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERABLES MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function DeliverablesManager() {
  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Deliverable>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await deliverablesApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load deliverables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ order: items.length });
  };

  const handleEdit = (item: Deliverable) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await deliverablesApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await deliverablesApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save deliverable:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await deliverablesApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete deliverable:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> خروجی جدید
      </button>

      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {editingId && (
          <div className="p-4 border-b border-white/7 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="عنوان"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="لینک دانلود"
                value={editForm.downloadLink || ''}
                onChange={(e) => setEditForm({ ...editForm, downloadLink: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="توضیح"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> ذخیره
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> لغو
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          {items.map((item) => (
            <div key={item.id} className="p-4 transition flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div className="flex-1">
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TECHNOLOGIES MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function TechnologiesManager() {
  const [items, setItems] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Technology>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await technologiesApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load technologies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ order: items.length });
  };

  const handleEdit = (item: Technology) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await technologiesApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await technologiesApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save technology:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await technologiesApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete technology:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> تکنولوژی جدید
      </button>

      <div className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {editingId && (
          <div className="p-4 border-b border-white/7 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="نام تکنولوژی"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="لینک"
                value={editForm.link || ''}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="لوگو (URL)"
                value={editForm.logo || ''}
                onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
                className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="color"
                value={editForm.color || '#06B6D4'}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> ذخیره
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditForm({});
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> لغو
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
          {items.map((item) => (
            <div key={item.id} className="border border-white/7 rounded-lg p-3 hover:shadow-md transition">
              {item.logo && (
                <img src={item.logo} alt={item.name} className="w-12 h-12 object-contain mx-auto mb-2" />
              )}
              <p className="font-medium text-white text-center text-sm">{item.name}</p>
              <div className="flex justify-center gap-2 mt-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Edit2 className="w-3 h-3 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded" style={{ background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Trash2 className="w-3 h-3 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PORTFOLIO MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function PortfolioManager() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Portfolio>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ featured: false, status: true, order: items.length, technologies: [] });
  };

  const handleEdit = (item: Portfolio) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await portfolioApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await portfolioApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save portfolio item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await portfolioApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete portfolio item:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> نمونه‌کار جدید
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg shadow overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {item.image && (
              <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
            )}
            <div className="p-4">
              <h3 className="font-bold text-white">{item.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{item.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.technologies.map((tech) => (
                  <span key={tech} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.1)' }}>{tech}</span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 px-3 py-2 rounded transition text-sm" style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}>
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 px-3 py-2 rounded transition text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}>
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'نمونه‌کار جدید' : 'ویرایش نمونه‌کار'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="عنوان"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="دسته"
              value={editForm.category || ''}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <textarea
              placeholder="توضیح"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
              rows={3}
            />
            <input
              type="text"
              placeholder="تصویر (URL)"
              value={editForm.image || ''}
              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="لینک"
              value={editForm.link || ''}
              onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.featured || false}
                onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">نمونه‌کار برگزیده</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> ذخیره
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" /> لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CASE STUDIES MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function CaseStudiesManager() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CaseStudy>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await caseStudiesApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load case studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ featured: false, statistics: [], order: items.length });
  };

  const handleEdit = (item: CaseStudy) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await caseStudiesApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await caseStudiesApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save case study:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await caseStudiesApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete case study:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> مطالعه موردی جدید
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg shadow p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-white">{item.title}</h3>
            <p className="text-sm text-slate-400 mt-2">{item.challenge}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-sm"
              >
                ویرایش
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'مطالعه موردی جدید' : 'ویرایش مطالعه موردی'}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="عنوان"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <textarea
              placeholder="چالش"
              value={editForm.challenge || ''}
              onChange={(e) => setEditForm({ ...editForm, challenge: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
            />
            <textarea
              placeholder="راه‌حل"
              value={editForm.solution || ''}
              onChange={(e) => setEditForm({ ...editForm, solution: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
            />
            <textarea
              placeholder="نتیجه"
              value={editForm.result || ''}
              onChange={(e) => setEditForm({ ...editForm, result: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> ذخیره
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" /> لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATISTICS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function StatisticsManager() {
  const [items, setItems] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Statistic>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await statisticsApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ order: items.length });
  };

  const handleEdit = (item: Statistic) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await statisticsApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await statisticsApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save statistic:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await statisticsApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete statistic:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> آمار جدید
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg shadow p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-3xl font-black text-white">{item.value}</p>
            <p className="text-slate-400 mt-2">{item.label}</p>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => handleEdit(item)}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <Edit2 className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'آمار جدید' : 'ویرایش آمار'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="مقدار"
              value={editForm.value || ''}
              onChange={(e) => setEditForm({ ...editForm, value: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="برچسب"
              value={editForm.label || ''}
              onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="پیشوند"
              value={editForm.prefix || ''}
              onChange={(e) => setEditForm({ ...editForm, prefix: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="پسوند"
              value={editForm.suffix || ''}
              onChange={(e) => setEditForm({ ...editForm, suffix: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex gap-2 md:col-span-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> ذخیره
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" /> لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT LOGOS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function ClientLogosManager() {
  const [items, setItems] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientLogo>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await clientLogosApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load client logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ order: items.length });
  };

  const handleEdit = (item: ClientLogo) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await clientLogosApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await clientLogosApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save client logo:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await clientLogosApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete client logo:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> لوگوی جدید
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg shadow p-4 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <img src={item.logo} alt={item.alt || 'Client'} className="max-h-12 object-contain" />
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 p-1 hover:bg-red-100 rounded"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'لوگوی جدید' : 'ویرایش لوگو'}
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="URL لوگو"
              value={editForm.logo || ''}
              onChange={(e) => setEditForm({ ...editForm, logo: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="متن جایگزین (Alt)"
              value={editForm.alt || ''}
              onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="لینک"
              value={editForm.link || ''}
              onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
              className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> ذخیره
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" /> لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEAM MEMBERS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function TeamMembersManager() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await teamMembersApi.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ expertise: [], socialLinks: [], order: items.length });
  };

  const handleEdit = (item: TeamMember) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await teamMembersApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await teamMembersApi.update(editingId, editForm, 'user-id');
      }
      loadItems();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save team member:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await teamMembersApi.delete(id, 'user-id');
      loadItems();
    } catch (error) {
      console.error('Failed to delete team member:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> عضو جدید
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg shadow p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-full object-cover" />
              )}
              <div>
                <h3 className="font-bold text-white">{item.name}</h3>
                <p className="text-sm text-slate-400">{item.position}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(item)}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition text-sm"
              >
                ویرایش
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'عضو جدید' : 'ویرایش عضو'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="نام"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="سمت"
              value={editForm.position || ''}
              onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="تصویر (URL)"
              value={editForm.image || ''}
              onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <textarea
              placeholder="تخصص‌ها (جدا شده با کاما)"
              value={editForm.expertise?.join(', ') || ''}
              onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value.split(',').map(s => s.trim()) })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={2}
            />
            <textarea
              placeholder="بیوگرافی"
              value={editForm.bio || ''}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
              rows={3}
            />
            <div className="flex gap-2 md:col-span-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> ذخیره
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
              >
                <X className="w-4 h-4" /> لغو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function ContactFormManager() {
  const [form, setForm] = useState<ContactForm | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadForm();
  }, []);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await contactFormApi.get();
      setForm(
        data || {
          id: '',
          enabled: true,
          fields: [],
          successMessage: 'پیام شما با موفقیت ارسال شد.',
          errorMessage: 'خطا در ارسال پیام. لطفاً دوباره تلاش کنید.',
          recipientEmail: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to load contact form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await contactFormApi.update(form, 'user-id');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save contact form:', error);
    }
  };

  if (!form) return <div>درحال بارگذاری...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-xl font-bold text-white mb-6">تنظیمات فرم تماس</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-slate-700">فعال بودن فرم</span>
          </label>

          <input
            type="email"
            placeholder="ایمیل گیرنده"
            value={form.recipientEmail}
            onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="پیام موفقیت"
            value={form.successMessage}
            onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="پیام خطا"
            value={form.errorMessage}
            onChange={(e) => setForm({ ...form, errorMessage: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEWSLETTER MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function NewsletterManager() {
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadNewsletter();
  }, []);

  const loadNewsletter = async () => {
    try {
      setLoading(true);
      const data = await newsletterApi.get();
      setNewsletter(
        data || {
          id: '',
          title: 'عضویت در خبرنامه',
          description: 'به‌روزترین مقالات و راهکارها را دریافت کنید.',
          placeholder: 'ایمیل شما',
          buttonText: 'عضویت',
          successMessage: 'با موفقیت عضو شدید!',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to load newsletter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newsletter) return;
    try {
      await newsletterApi.update(newsletter, 'user-id');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save newsletter:', error);
    }
  };

  if (!newsletter) return <div>درحال بارگذاری...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-xl font-bold text-white mb-6">تنظیمات خبرنامه</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="عنوان"
            value={newsletter.title}
            onChange={(e) => setNewsletter({ ...newsletter, title: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <textarea
            placeholder="توضیح"
            value={newsletter.description}
            onChange={(e) => setNewsletter({ ...newsletter, description: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={2}
          />

          <input
            type="text"
            placeholder="Placeholder"
            value={newsletter.placeholder}
            onChange={(e) => setNewsletter({ ...newsletter, placeholder: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="متن دکمه"
            value={newsletter.buttonText}
            onChange={(e) => setNewsletter({ ...newsletter, buttonText: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="پیام موفقیت"
            value={newsletter.successMessage}
            onChange={(e) => setNewsletter({ ...newsletter, successMessage: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RELATED CONTENT MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function RelatedContentManager() {
  const [content, setContent] = useState<RelatedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await relatedContentApi.get();
      setContent(
        data || {
          id: '',
          blogArticles: [],
          relatedServices: [],
          autoSelect: true,
          count: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to load related content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    try {
      await relatedContentApi.update(content, 'user-id');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save related content:', error);
    }
  };

  if (!content) return <div>درحال بارگذاری...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-xl font-bold text-white mb-6">تنظیمات محتوای مرتبط</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={content.autoSelect}
              onChange={(e) => setContent({ ...content, autoSelect: e.target.checked })}
              className="rounded"
            />
            <span className="text-slate-700">انتخاب خودکار</span>
          </label>

          <input
            type="number"
            placeholder="تعداد نمایش"
            value={content.count}
            onChange={(e) => setContent({ ...content, count: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function CTAManager() {
  const [cta, setCTA] = useState<CTA | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadCTA();
  }, []);

  const loadCTA = async () => {
    try {
      setLoading(true);
      const data = await ctaApi.get();
      setCTA(
        data || {
          id: '',
          title: 'آماده برای شروع هستید؟',
          description: 'همین حالا با ما تماس بگیرید.',
          buttonText: 'تماس با ما',
          buttonLink: '#contact',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Failed to load CTA:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!cta) return;
    try {
      await ctaApi.update(cta, 'user-id');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save CTA:', error);
    }
  };

  if (!cta) return <div>درحال بارگذاری...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg shadow p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-xl font-bold text-white mb-6">تنظیمات فراخوان عمل (CTA)</h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="عنوان"
            value={cta.title}
            onChange={(e) => setCTA({ ...cta, title: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <textarea
            placeholder="توضیح"
            value={cta.description}
            onChange={(e) => setCTA({ ...cta, description: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={2}
          />

          <input
            type="text"
            placeholder="متن دکمه"
            value={cta.buttonText}
            onChange={(e) => setCTA({ ...cta, buttonText: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="لینک دکمه"
            value={cta.buttonLink}
            onChange={(e) => setCTA({ ...cta, buttonLink: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <input
            type="text"
            placeholder="تصویر پس‌زمینه (URL)"
            value={cta.background || ''}
            onChange={(e) => setCTA({ ...cta, background: e.target.value })}
            className="w-full px-3 py-2 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> ذخیره تنظیمات
          </button>
          {saved && <span className="text-green-600 font-medium">✓ تنظیمات ذخیره شد</span>}
        </div>
      </div>
    </div>
  );
}

export default {
  BenefitsManager,
  ProcessStepsManager,
  DeliverablesManager,
  TechnologiesManager,
  PortfolioManager,
  CaseStudiesManager,
  StatisticsManager,
  ClientLogosManager,
  TeamMembersManager,
  ContactFormManager,
  NewsletterManager,
  RelatedContentManager,
  CTAManager,
};
