import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, GripVertical,
  Star, Eye, EyeOff, RefreshCw, Save, X,
} from 'lucide-react';
import {
  fetchAllTestimonials, createTestimonial,
  updateTestimonial, deleteTestimonial, updateSortOrders,
} from '../../lib/testimonialsApi';
import type { Testimonial } from '../../lib/testimonialsApi';

interface EditModalProps {
  item: Partial<Testimonial> | null;
  onClose: () => void;
  onSave: (data: Partial<Testimonial>) => Promise<void>;
}

function EditModal({ item, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({
    name:       item?.name ?? '',
    role:       item?.role ?? '',
    company:    item?.company ?? '',
    text:       item?.text ?? '',
    is_active:  item?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.text) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputCls = 'w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-colors';
  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' };
  const onFocus = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(0,188,212,0.5)');
  const onBlur  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl"
      style={{ background: 'rgba(0,0,0,0.7)' }}>
      <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: '#07111e', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">{item?.id ? 'ویرایش نظر' : 'نظر جدید'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">نام *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="علی رضایی" className={inputCls} style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">شرکت</label>
            <input value={form.company} onChange={e => set('company', e.target.value)}
              placeholder="StartupX" className={inputCls} style={inputStyle}
              onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">سمت / نقش *</label>
          <input value={form.role} onChange={e => set('role', e.target.value)}
            placeholder="بنیان‌گذار و CEO" className={inputCls} style={inputStyle}
            onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">متن نظر *</label>
          <textarea value={form.text} onChange={e => set('text', e.target.value)}
            rows={4} placeholder="نظر کامل..."
            className={`${inputCls} resize-none`} style={inputStyle}
            onFocus={onFocus} onBlur={onBlur} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div onClick={() => set('is_active', !form.is_active)}
            className="w-10 h-5 rounded-full relative transition-colors"
            style={{ background: form.is_active ? '#00BCD4' : 'rgba(255,255,255,0.1)' }}>
            <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all"
              style={{ right: form.is_active ? '2px' : 'calc(100% - 18px)' }} />
          </div>
          <span className="text-sm text-slate-300">نمایش در سایت</span>
        </label>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
            انصراف
          </button>
          <button onClick={handleSave} disabled={saving || !form.name || !form.text}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={14} />}
            {saving ? 'ذخیره...' : 'ذخیره'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<Testimonial> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAllTestimonials();
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditItem({}); setShowModal(true); };
  const openEdit = (item: Testimonial) => { setEditItem(item); setShowModal(true); };

  const handleSave = async (data: Partial<Testimonial>) => {
    if (editItem?.id) {
      await updateTestimonial(editItem.id, data);
      setItems(prev => prev.map(i => i.id === editItem.id ? { ...i, ...data } : i));
    } else {
      const newItem = await createTestimonial({
        ...data,
        sort_order: items.length,
        is_active: data.is_active ?? true,
      } as any);
      if (newItem) setItems(prev => [...prev, newItem]);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('این نظر حذف شود؟')) return;
    await deleteTestimonial(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    await updateTestimonial(id, { is_active: !current });
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_active: !current } : i));
  };

  // ── Drag and Drop ─────────────────────────────────────────────────────────
  const dragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const newItems = [...items];
    const [dragged] = newItems.splice(dragIdx, 1);
    newItems.splice(idx, 0, dragged);
    setItems(newItems);
    setDragIdx(idx);
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    await updateSortOrders(items.map((item, idx) => ({ id: item.id, sort_order: idx })));
    setSavingOrder(false);
    setOrderChanged(false);
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">مدیریت نظرات</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {items.filter(i => i.is_active).length} نظر فعال از {items.length} نظر کل
          </p>
        </div>
        <div className="flex items-center gap-2">
          {orderChanged && (
            <button onClick={saveOrder} disabled={savingOrder}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Save size={13} />
              {savingOrder ? 'ذخیره ترتیب...' : 'ذخیره ترتیب جدید'}
            </button>
          )}
          <button onClick={load} disabled={loading}
            className="p-2 rounded-xl transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)', color: '#fff' }}>
            <Plus size={15} />
            نظر جدید
          </button>
        </div>
      </div>

      {/* Drag hint */}
      <p className="text-xs text-slate-600">
        برای تغییر ترتیب، کارت‌ها را بکشید (Drag & Drop)
      </p>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Star size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">نظری وجود ندارد</p>
          <button onClick={openNew} className="mt-3 text-teal-400 text-sm hover:underline">
            اولین نظر را اضافه کنید
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <motion.div key={item.id}
              layout
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => dragOver(e, idx)}
              onDragEnd={() => setDragIdx(null)}
              className="rounded-2xl p-4 cursor-grab active:cursor-grabbing transition-all"
              style={{
                background: dragIdx === idx ? 'rgba(0,188,212,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${dragIdx === idx ? 'rgba(0,188,212,0.3)' : 'rgba(255,255,255,0.07)'}`,
                opacity: !item.is_active ? 0.5 : 1,
              }}>
              <div className="flex items-start gap-3">
                {/* Drag handle */}
                <GripVertical size={16} className="text-slate-600 mt-1 flex-shrink-0 cursor-grab" />

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                  style={{ background: 'linear-gradient(135deg, #00BCD4, #00838F)' }}>
                  {item.name[0]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-white text-sm">{item.name}</p>
                    <span className="text-xs text-slate-400">{item.role}</span>
                    {item.company && <span className="text-xs text-slate-500">· {item.company}</span>}
                    {!item.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
                        مخفی
                      </span>
                    )}
                  </div>
                  <div className="flex mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} className="text-amber-400" fill="#f59e0b" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{item.text}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggleActive(item.id, item.is_active ?? true)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                    style={{ color: item.is_active ? '#22c55e' : 'rgba(255,255,255,0.3)' }}
                    title={item.is_active ? 'مخفی کردن' : 'نمایش دادن'}>
                    {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="p-1.5 rounded-lg text-teal-400/70 hover:text-teal-400 hover:bg-white/10 transition-colors">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-white/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <EditModal
            item={editItem}
            onClose={() => { setShowModal(false); setEditItem(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
