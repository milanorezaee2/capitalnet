/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin - Generic CRUD Managers
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  X,
} from 'lucide-react';
import { categoriesApi, featuresApi, pricingApi, faqApi, testimonialApi } from '@/lib/cmsApi';
import {
  ServiceCategory,
  ServiceFeature,
  PricingPlan,
  FAQ,
  Testimonial,
} from '@/types/servicesCms';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function CategoriesManager() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceCategory>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ status: true, order: categories.length });
  };

  const handleEdit = (category: ServiceCategory) => {
    setEditingId(category.id);
    setEditForm(category);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await categoriesApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await categoriesApi.update(editingId, editForm, 'user-id');
      }
      loadCategories();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await categoriesApi.delete(id, 'user-id');
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index].order, newCategories[index - 1].order] = [
      newCategories[index - 1].order,
      newCategories[index].order,
    ];
    await categoriesApi.reorder(
      newCategories.map((c) => ({ id: c.id, order: c.order })),
      'user-id'
    );
    loadCategories();
  };

  const handleMoveDown = async (index: number) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index].order, newCategories[index + 1].order] = [
      newCategories[index + 1].order,
      newCategories[index].order,
    ];
    await categoriesApi.reorder(
      newCategories.map((c) => ({ id: c.id, order: c.order })),
      'user-id'
    );
    loadCategories();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> دسته‌بندی جدید
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {editingId && (
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="عنوان"
                value={editForm.title || ''}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <input
                type="text"
                placeholder="Slug"
                value={editForm.slug || ''}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <textarea
                placeholder="توضیح"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
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
                  className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> لغو
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-200">
          {categories.map((category, index) => (
            <div key={category.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-slate-800">{category.title}</p>
                <p className="text-xs text-slate-500">{category.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 hover:bg-slate-200 rounded disabled:opacity-50"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === categories.length - 1}
                  className="p-1 hover:bg-slate-200 rounded disabled:opacity-50"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(category)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-1 hover:bg-slate-200 rounded"
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
// PRICING PLANS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function PricingManager() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<PricingPlan>>({});

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await pricingApi.list();
      setPlans(data);
    } catch (error) {
      console.error('Failed to load pricing plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ featured: false, order: plans.length, currency: 'تومان' });
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setEditForm(plan);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await pricingApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await pricingApi.update(editingId, editForm, 'user-id');
      }
      loadPlans();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save pricing plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await pricingApi.delete(id, 'user-id');
      loadPlans();
    } catch (error) {
      console.error('Failed to delete pricing plan:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> پلن جدید
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6 relative">
            {plan.featured && (
              <div className="absolute top-4 right-4 bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded">
                محبوب‌ترین
              </div>
            )}
            <h3 className="text-lg font-bold text-slate-800 mb-2">{plan.title}</h3>
            <p className="text-3xl font-bold text-slate-900 mb-4">
              {plan.price}
              <span className="text-sm text-slate-600 mr-1">{plan.currency}</span>
            </p>
            <p className="text-sm text-slate-600 mb-4">{plan.description}</p>

            <div className="space-y-2 mb-4">
              {plan.features.slice(0, 3).map((feature, i) => (
                <p key={i} className="text-sm text-slate-700">
                  ✓ {feature}
                </p>
              ))}
              {plan.features.length > 3 && (
                <p className="text-sm text-slate-500">+ {plan.features.length - 3} مورد دیگر</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
              >
                <Edit2 className="w-4 h-4 inline mr-1" /> ویرایش
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
              >
                <Trash2 className="w-4 h-4 inline mr-1" /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'پلن جدید' : 'ویرایش پلن'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="عنوان پلن"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <input
              type="number"
              placeholder="قیمت"
              value={editForm.price || ''}
              onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <textarea
              placeholder="توضیح پلن"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 md:col-span-2"
              rows={3}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editForm.featured || false}
                onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">محبوب‌ترین پلن</span>
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
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
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
// FAQ MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function FAQManager() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FAQ>>({});

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      const data = await faqApi.list();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingId('new');
    setEditForm({ status: true, order: faqs.length });
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setEditForm(faq);
  };

  const handleSave = async () => {
    try {
      if (editingId === 'new') {
        await faqApi.create(editForm as any, 'user-id');
      } else if (editingId) {
        await faqApi.update(editingId, editForm, 'user-id');
      }
      loadFAQs();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Failed to save FAQ:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await faqApi.delete(id, 'user-id');
      loadFAQs();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleNew}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> سؤال جدید
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-slate-200">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-4 hover:bg-slate-50 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-slate-800">{faq.question}</h3>
                <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-1 hover:bg-slate-200 rounded"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">
            {editingId === 'new' ? 'سؤال جدید' : 'ویرایش سؤال'}
          </h2>
          <div className="space-y-4">
            <textarea
              placeholder="سؤال"
              value={editForm.question || ''}
              onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={2}
            />
            <textarea
              placeholder="پاسخ"
              value={editForm.answer || ''}
              onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
              rows={4}
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
                className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
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
// TESTIMONIALS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const data = await testimonialApi.list();
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => {}}
        className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> نظر جدید
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start gap-3 mb-3">
              {testimonial.image && (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1">
                <p className="font-medium text-slate-800">{testimonial.name}</p>
                <p className="text-sm text-slate-600">{testimonial.position}</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-3 italic">"{testimonial.content}"</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-yellow-500">★ {testimonial.rating}/5</span>
              <div className="flex gap-2">
                <button className="px-2 py-1 hover:bg-slate-100 rounded transition">ویرایش</button>
                <button className="px-2 py-1 hover:bg-slate-100 rounded transition text-red-600">حذف</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default { CategoriesManager, PricingManager, FAQManager, TestimonialsManager };
