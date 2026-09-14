import { Construction } from 'lucide-react';

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center" dir="rtl">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(0,188,212,0.1)', border: '1px solid rgba(0,188,212,0.2)' }}>
        <Construction size={28} className="text-teal-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{description}</p>
      <div className="mt-6 px-4 py-2 rounded-full text-xs font-medium"
        style={{ background: 'rgba(0,188,212,0.1)', color: '#00BCD4', border: '1px solid rgba(0,188,212,0.2)' }}>
        فاز بعدی — به زودی
      </div>
    </div>
  );
}

export function AdminTestimonialsPage() {
  return (
    <ComingSoon
      title="مدیریت نظرات"
      description="افزودن، ویرایش و مرتب‌سازی Testimonials با Drag & Drop — در فاز ۴ پیاده‌سازی می‌شود."
    />
  );
}

export function AdminSettingsPage() {
  return (
    <ComingSoon
      title="تنظیمات سایت"
      description="ویرایش اطلاعات تماس، متن‌های Hero، اعضای تیم و Quick Replies چت‌بات — در فاز ۴ پیاده‌سازی می‌شود."
    />
  );
}

export function AdminAnalyticsPage() {
  return (
    <ComingSoon
      title="آنالیتیکس"
      description="داشبورد آماری بازدید صفحات، نرخ تبدیل لید و محبوب‌ترین پست‌های بلاگ — در فاز ۵ پیاده‌سازی می‌شود."
    />
  );
}
