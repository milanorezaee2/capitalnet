/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Services CMS Admin - Services Management
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Copy,
  Archive,
  MoreVertical,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { servicesApi } from '@/lib/cmsApi';
import { Service, ServiceStatus } from '@/types/servicesCms';

interface ServicesTableProps {
  onEdit?: (service: Service) => void;
  onCreateNew?: () => void;
}

export function ServicesManagement({ onEdit, onCreateNew }: ServicesTableProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadServices();
  }, [page, search, statusFilter]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const result = await servicesApi.list(page, 10, search || undefined, statusFilter || undefined);
      setServices(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      await servicesApi.delete(id, 'current-user-id', 'مدیر');
      loadServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await servicesApi.duplicate(id, 'current-user-id', 'مدیر');
      loadServices();
    } catch (error) {
      console.error('Failed to duplicate service:', error);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedServices.size === 0) return;
    try {
      await servicesApi.bulkPublish(Array.from(selectedServices), 'current-user-id', 'مدیر');
      loadServices();
      setSelectedServices(new Set());
    } catch (error) {
      console.error('Failed to publish services:', error);
    }
  };

  const toggleService = (id: string) => {
    const newSet = new Set(selectedServices);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedServices(newSet);
  };

  const getStatusBadge = (status: ServiceStatus) => {
    const badges: Record<ServiceStatus, { bg: string; text: string; label: string }> = {
      draft: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'پیش‌نویس' },
      published: { bg: 'bg-green-100', text: 'text-green-700', label: 'منتشر شده' },
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'زمان‌بندی شده' },
      archived: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'بایگانی' },
    };
    const badge = badges[status];
    return <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="جستجوی خدمات..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">تمام وضعیت‌ها</option>
            <option value="draft">پیش‌نویس</option>
            <option value="published">منتشر شده</option>
            <option value="scheduled">زمان‌بندی شده</option>
            <option value="archived">بایگانی</option>
          </select>
        </div>

        <div className="flex gap-2">
          {selectedServices.size > 0 && (
            <button
              onClick={handleBulkPublish}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
            >
              منتشر کردن ({selectedServices.size})
            </button>
          )}
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> خدمت جدید
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-right">
                  <input
                    type="checkbox"
                    checked={selectedServices.size === services.length && services.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedServices(new Set(services.map((s) => s.id)));
                      } else {
                        setSelectedServices(new Set());
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">تصویر</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">عنوان</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">دسته‌بندی</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">وضعیت</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">بازدید</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">تاریخ</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-slate-700">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    درحال بارگذاری...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    خدمتی پیدا نشد
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedServices.has(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-3">
                      {service.thumbnail && (
                        <img
                          src={service.thumbnail}
                          alt={service.title}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-800">{service.title}</p>
                      <p className="text-xs text-slate-500">{service.slug}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{service.categoryId || '-'}</td>
                    <td className="px-6 py-3">{getStatusBadge(service.status)}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{service.views || 0}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {new Date(service.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit?.(service)}
                          className="p-1 hover:bg-slate-200 rounded transition"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(service.id)}
                          className="p-1 hover:bg-slate-200 rounded transition"
                          title="کپی"
                        >
                          <Copy className="w-4 h-4 text-amber-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1 hover:bg-slate-200 rounded transition"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            صفحه {page} از {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 hover:bg-slate-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 hover:bg-slate-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServicesManagement;
