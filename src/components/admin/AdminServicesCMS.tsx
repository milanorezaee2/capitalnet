/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Main Services CMS Admin Panel
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

// Import all admin components
import ServicesDashboard from './ServicesDashboard';
import ServicesManagement from './ServicesManagement';
import { CategoriesManager, PricingManager, FAQManager, TestimonialsManager } from './AdminCrudManagers';
import { PageSettingsManager, ActivityLogViewer, AdminStatistics } from './AdminAdvancedManagers';
import {
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
} from './ServicesExtendedManagers';
import { HeroSectionManager, SEOSettingsManager, MediaLibraryManager } from './ServicesSpecialManagers';

interface AdminServicesCMSProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function AdminServicesCMS({ onNavigate, currentPage }: AdminServicesCMSProps) {
  const [editingService, setEditingService] = useState(null);

  const renderPage = () => {
    if (currentPage === 'dashboard') {
      return <ServicesDashboard />;
    }

    if (currentPage === 'services-list') {
      return <ServicesManagement onEdit={setEditingService} onCreateNew={() => {}} />;
    }

    if (currentPage === 'hero') {
      return <HeroSectionManager />;
    }

    if (currentPage === 'categories') {
      return <CategoriesManager />;
    }

    if (currentPage === 'features') {
      return <div className="p-4 text-center text-slate-600">مدیریت ویژگی‌ها به زودی...</div>;
    }

    if (currentPage === 'benefits') {
      return <BenefitsManager />;
    }

    if (currentPage === 'process') {
      return <ProcessStepsManager />;
    }

    if (currentPage === 'deliverables') {
      return <DeliverablesManager />;
    }

    if (currentPage === 'technologies') {
      return <TechnologiesManager />;
    }

    if (currentPage === 'pricing') {
      return <PricingManager />;
    }

    if (currentPage === 'portfolio') {
      return <PortfolioManager />;
    }

    if (currentPage === 'case-studies') {
      return <CaseStudiesManager />;
    }

    if (currentPage === 'statistics') {
      return <StatisticsManager />;
    }

    if (currentPage === 'client-logos') {
      return <ClientLogosManager />;
    }

    if (currentPage === 'testimonials') {
      return <TestimonialsManager />;
    }

    if (currentPage === 'team') {
      return <TeamMembersManager />;
    }

    if (currentPage === 'faq') {
      return <FAQManager />;
    }

    if (currentPage === 'contact-form') {
      return <ContactFormManager />;
    }

    if (currentPage === 'newsletter') {
      return <NewsletterManager />;
    }

    if (currentPage === 'related-content') {
      return <RelatedContentManager />;
    }

    if (currentPage === 'cta') {
      return <CTAManager />;
    }

    if (currentPage === 'seo') {
      return <SEOSettingsManager />;
    }

    if (currentPage === 'media') {
      return <MediaLibraryManager />;
    }

    if (currentPage === 'page-settings') {
      return <PageSettingsManager />;
    }

    if (currentPage === 'activity-log') {
      return <ActivityLogViewer />;
    }

    if (currentPage === 'admin-settings') {
      return <AdminStatistics />;
    }

    // Features coming soon
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-slate-800">این بخش به زودی...</h2>
        <p className="text-slate-600 mt-2">ما در حال توسعه این قسمت هستیم</p>
      </div>
    );
  };

  return <div className="w-full">{renderPage()}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE ADMIN PAGE WITH LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export function AdminServicesPage({ onNavigate: parentOnNavigate }: { onNavigate: (page: string) => void }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NAV_ITEMS = [
    { id: 'dashboard', label: '📊 داشبورد خدمات', icon: '📊' },
    { id: 'services-list', label: '📄 مدیریت خدمات', icon: '📄' },
    { id: 'hero', label: '🎨 بخش معرفی (Hero)', icon: '🎨' },
    { id: 'categories', label: '🏷️ دسته‌بندی‌ها', icon: '🏷️' },
    { id: 'features', label: '⭐ ویژگی‌ها', icon: '⭐' },
    { id: 'benefits', label: '🎁 مزایا', icon: '🎁' },
    { id: 'process', label: '🔄 مراحل پروژه', icon: '🔄' },
    { id: 'deliverables', label: '📦 خروجی‌ها', icon: '📦' },
    { id: 'technologies', label: '🛠️ تکنولوژی‌ها', icon: '🛠️' },
    { id: 'pricing', label: '💰 پلن‌های قیمت', icon: '💰' },
    { id: 'portfolio', label: '🖼️ نمونه‌کارها', icon: '🖼️' },
    { id: 'case-studies', label: '📚 مطالعات موردی', icon: '📚' },
    { id: 'statistics', label: '📈 آمار', icon: '📈' },
    { id: 'client-logos', label: '🏢 لوگوی مشتریان', icon: '🏢' },
    { id: 'testimonials', label: '⭐ نظرات مشتریان', icon: '⭐' },
    { id: 'team', label: '👥 اعضای تیم', icon: '👥' },
    { id: 'faq', label: '❓ سوالات متداول', icon: '❓' },
    { id: 'contact-form', label: '📧 فرم تماس', icon: '📧' },
    { id: 'newsletter', label: '📮 خبرنامه', icon: '📮' },
    { id: 'related-content', label: '🔗 محتوای مرتبط', icon: '🔗' },
    { id: 'cta', label: '📢 فراخوان عمل', icon: '📢' },
    { id: 'seo', label: '🔍 تنظیمات SEO', icon: '🔍' },
    { id: 'media', label: '🖼️ کتابخانه رسانه‌ای', icon: '🖼️' },
    { id: 'page-settings', label: '⚙️ تنظیمات صفحه', icon: '⚙️' },
    { id: 'activity-log', label: '📋 گزارش فعالیت', icon: '📋' },
  ];

  const currentPageLabel = NAV_ITEMS.find((item) => item.id === currentPage)?.label || 'داشبورد';

  return (
    <div className="flex h-screen rtl">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg">🎯 Services CMS</h1>
              <p className="text-xs text-slate-400">نسخه 1.0</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700 rounded transition"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full text-right px-4 py-2 rounded-lg transition-all ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              {sidebarOpen ? (
                <span>{item.label}</span>
              ) : (
                <span className="text-lg" title={item.label}>
                  {item.icon}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex-shrink-0">
          <button
            onClick={() => parentOnNavigate('home')}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition flex items-center justify-center gap-2"
          >
            {sidebarOpen ? (
              <>
                <ArrowRight className="w-4 h-4" /> بازگشت
              </>
            ) : (
              '←'
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-800">{currentPageLabel}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>🕐 {new Date().toLocaleTimeString('fa-IR')}</span>
            <span>📅 {new Date().toLocaleDateString('fa-IR')}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <AdminServicesCMS onNavigate={setCurrentPage} currentPage={currentPage} />
        </div>
      </main>
    </div>
  );
}

export default AdminServicesPage;
