/**
 * EvaluationSection - سکشن "هر معرفی، نتیجه یک ارزیابی تخصصی است"
 * 
 * این کامپوننت به صورت مستقل طراحی شده و می‌توانید در هر پروژه React/Next.js استفاده کنید.
 * 
 * Dependencies:
 * - React
 * - framer-motion
 * - lucide-react
 * - tailwindcss
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Layers, Search, Users, FileText, Star, Briefcase, Lock } from 'lucide-react';

import { t, useLanguage, deepTranslate } from '@/i18n';


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface EvaluationSectionData {
  journey_title: string;
  journey_subtitle: string;
  journey_image_url: string;
  journey_text_columns: Array<{
    text: string;
    text_fs: string;
    text_align: string;
    bold: boolean;
  }>;
  journey_info_cards: Array<{
    title: string;
    title_fs: string;
    title_align: string;
    text: string;
    text_fs: string;
    text_align: string;
    icon: string;
  }>;
  journey_metrics: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  journey_keywords: Array<{
    text: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Data
// ─────────────────────────────────────────────────────────────────────────────
const defaultData: EvaluationSectionData = {
  journey_title: 'هر معرفی، نتیجه یک ارزیابی تخصصی است',
  journey_subtitle: 'سرمایه‌گذار مناسب، با معرفی درست شروع می‌شود',
  journey_image_url: '/images/standards-investors.jpg',
  journey_text_columns: [
    { text: 'سرمایه‌گذار مناسب، با معرفی درست شروع می‌شود', text_fs: 'h3', text_align: 'right', bold: true },
    { text: 'از آماده‌سازی مدارک و ارائه حرفه‌ای تا معرفی هدفمند', text_fs: 'p', text_align: 'right', bold: false },
  ],
  journey_info_cards: [
    {
      title: 'بررسی اولیه و ارزیابی تخصصی',
      title_fs: 'h4',
      title_align: 'right',
      text: 'پیش از هر معرفی، بررسی دقیق انجام می‌شود. هیچ فرصت سرمایه‌گذاری بدون بررسی اولیه به شبکه سرمایه‌گذاران معرفی نمی‌شود. هدف ما این است که سرمایه‌گذاران با فرصت‌های جدی‌تر و مستند روبه‌رو شوند و متقاضیان جذب سرمایه نیز با آمادگی حرفه‌ای وارد مذاکره شوند.',
      text_fs: 'p',
      text_align: 'right',
      icon: '🔍',
    },
    {
      title: 'استانداردهای معرفی برای سرمایه‌گذاران',
      title_fs: 'h4',
      title_align: 'right',
      text: 'پیش از معرفی هر پروژه، مدارک مالی، مدل کسب‌وکار، بازار هدف، تیم، میزان سرمایه مورد نیاز، نحوه مصرف سرمایه و ریسک‌های اصلی آن توسط متخصصان باتجربه بررسی می‌شود. فقط فرصت‌هایی معرفی می‌شوند که از نظر مدارک، ساختار ارائه و قابلیت بررسی، حداقل استانداردهای لازم را داشته باشند.',
      text_fs: 'p',
      text_align: 'right',
      icon: '👥',
    },
    {
      title: 'الزامات مدارک برای متقاضیان',
      title_fs: 'h4',
      title_align: 'right',
      text: 'برای معرفی کسب‌وکار یا پروژه شما به سرمایه‌گذار، مدارکی مانند Pitch Deck، مدل مالی، بیزینس پلن، One-Pager، Investment Memo و اطلاعات تیم باید کامل، دقیق و قابل دفاع باشند.',
      text_fs: 'p',
      text_align: 'right',
      icon: '📄',
    },
    {
      title: 'اهمیت ارائه حرفه‌ای',
      title_fs: 'h4',
      title_align: 'right',
      text: 'حتی اگر یک پروژه ظرفیت خوبی داشته باشد، ارائه غیرحرفه‌ای می‌تواند در چند ثانیه نخست اعتماد و توجه سرمایه‌گذار را از بین ببرد.',
      text_fs: 'p',
      text_align: 'right',
      icon: '⭐',
    },
    {
      title: 'خدمات آماده‌سازی مدارک',
      title_fs: 'h4',
      title_align: 'right',
      text: 'اگر با نحوه تهیه این مدارک آشنا نیستید یا فایل‌های فعلی شما نیاز به اصلاح دارند، از بخش خدمات آماده‌سازی جذب سرمایه اقدام کنید تا متخصصان ما مدارک شما را بررسی، تکمیل و برای ارائه حرفه‌ای به سرمایه‌گذار آماده کنند.',
      text_fs: 'p',
      text_align: 'right',
      icon: '📁',
    },
    {
      title: 'تضمین محرمانگی اطلاعات',
      title_fs: 'h4',
      title_align: 'right',
      text: 'تمامی مدارک و اطلاعات دریافتی با رویکرد محرمانه بررسی می‌شوند و بدون هماهنگی و تأیید صاحب پروژه در اختیار اشخاص یا مجموعه‌های نامرتبط قرار نمی‌گیرند.',
      text_fs: 'p',
      text_align: 'right',
      icon: '🔒',
    },
  ],
  journey_metrics: [
    { label: 'پروژه‌های ارزیابی شده', value: 85, color: 'from-teal-400 to-cyan-400' },
    { label: 'استارتاپ‌های متصل', value: 72, color: 'from-amber-400 to-orange-400' },
    { label: 'سرمایه‌گذاران فعال', value: 68, color: 'from-purple-400 to-pink-400' },
    { label: 'موفقیت‌های ثبت شده', value: 91, color: 'from-green-400 to-emerald-400' },
  ],
  journey_keywords: [
    { text: 'سرمایه‌گذاری' },
    { text: 'استارتاپ' },
    { text: 'VC' },
    { text: 'جذب سرمایه' },
    { text: 'توسعه کسب‌وکار' },
    { text: 'شبکه سرمایه‌گذاران' },
    { text: 'معرفی پروژه' },
    { text: 'ارزیابی حرفه‌ای' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
interface EvaluationSectionProps {
  data?: Partial<EvaluationSectionData>;
  className?: string;
}

export default function EvaluationSection({ data = {}, className = '' }: EvaluationSectionProps) {
  //订阅 تغییر زبان تا محتوا دوباره رندر شود
  const { lang } = useLanguage();

  // محتوای پیش‌فرض این بخش به فارسی است؛ برای نسخهٔ انگلیسی ترجمهٔ عمیق اعمال می‌شود
  const settings = useMemo(
    () => deepTranslate({ ...defaultData, ...data }),
    [data, lang]
  );

  return (
    <section className={`relative overflow-hidden py-24 ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-0 start-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-500/5 to-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} 
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main Card */}
          <div
            className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-transparent backdrop-blur-xl p-4 md:p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
            dir="rtl"
          >
            {/* Glass Effect Border */}
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute inset-0 rounded-[40px] border border-white/5" />

            {/* Animated Glow */}
            <motion.div
              className="absolute -top-20 -end-20 w-40 h-40 bg-amber-400/20 rounded-full blur-[60px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute -bottom-20 -start-20 w-40 h-40 bg-teal-400/20 rounded-full blur-[60px]"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />

            <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              {/* Right Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative flex flex-col gap-6"
              >
                {/* Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl"
                >
                  <div className="w-full overflow-hidden rounded-[20px]">
                    <img
                      src={settings.journey_image_url}
                      alt="Evaluation"
                      className="h-full w-full object-contain"
                      loading="eager"
                      decoding="sync"
                      style={{
                        WebkitImageRendering: 'crisp-edges',
                        imageRendering: 'crisp-edges',
                      }}
                    />
                  </div>
                </motion.div>

                {/* Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-5"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30">
                      <TrendingUp size={16} className="text-amber-400" />
                    </div>
                    <p className="text-sm font-semibold text-white">{t("فعالیت‌های سایت")}</p>
                  </div>
                  <div className="space-y-3">
                    {(settings.journey_metrics || []).map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.08 }}
                        className="space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/70">{item.label}</span>
                          <span className="font-semibold text-white">{item.value}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.value}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.6 + index * 0.1, ease: "easeOut" }}
                            className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>


                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -end-4 h-8 w-8 rounded-full bg-amber-400/20 blur-xl"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -start-4 h-8 w-8 rounded-full bg-teal-400/20 blur-xl"
                  animate={{
                    y: [0, 10, 0],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                />
              </motion.div>

              {/* Left Content - Main Description */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col justify-center text-end"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-4"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-gradient-to-r from-amber-400/10 to-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 backdrop-blur-sm">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={14} />
                    </motion.span>
                    {settings.journey_title}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl leading-tight"
                >
                  <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                    {settings.journey_subtitle}
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="max-w-2xl space-y-5"
                >
                  <p className="text-base leading-8 text-white/70 md:text-lg">
                    {t("هیچ فرصت سرمایه‌گذاری بدون بررسی اولیه به شبکه سرمایه‌گذاران معرفی نمی‌شود. هدف ما اطمینان از کیفیت و حرفه‌ای بودن فرصت‌هاست.")}
                  </p>

                  {/* Structured Points */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/30">
                        <Search size={14} className="text-amber-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("بررسی اولیه و ارزیابی تخصصی")}</h4>
                        <p className="text-xs text-white/60 leading-6">{t("پیش از هر معرفی، بررسی دقیق انجام می‌شود.")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-600/10 border border-teal-400/30">
                        <Users size={14} className="text-teal-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("استانداردهای معرفی برای سرمایه‌گذاران")}</h4>
                        <p className="text-xs text-white/60 leading-6">{t("پیش از معرفی هر پروژه، مدارک مالی، مدل کسب‌وکار، بازار هدف، تیم، میزان سرمایه موردنیاز، نحوه مصرف سرمایه و ریسک‌های اصلی آن توسط متخصصان باتجربه بررسی می‌شود.")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 border border-cyan-400/30">
                        <FileText size={14} className="text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("الزامات مدارک برای متقاضیان")}</h4>
                        <p className="text-xs text-white/60 leading-6">{t("برای معرفی کسب‌وکار یا پروژه شما به سرمایه‌گذار، مدارکی مانند Pitch Deck، مدل مالی، بیزینس پلن، One-Pager، Investment Memo و اطلاعات تیم باید کامل، دقیق و قابل دفاع باشند.")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400/20 to-purple-600/10 border border-purple-400/30">
                        <Star size={14} className="text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("اهمیت ارائه حرفه‌ای")}</h4>
                        <p className="text-xs text-white/60 leading-6">{t("حتی اگر یک پروژه ظرفیت خوبی داشته باشد، ارائه غیرحرفه‌ای می‌تواند در چند ثانیه نخست اعتماد و توجه سرمایه‌گذار را از بین ببرد.")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-rose-400/20 to-rose-600/10 border border-rose-400/30">
                        <Briefcase size={14} className="text-rose-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("خدمات آماده‌سازی مدارک")}</h4>
                        <p className="text-xs text-white/60 leading-6">{t("اگر با نحوه تهیه این مدارک آشنا نیستید یا فایل‌های فعلی شما نیاز به اصلاح دارند، از بخش خدمات آماده‌سازی جذب سرمایه اقدام کنید.")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 border border-emerald-400/30">
                        <Lock size={14} className="text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-1">{t("تضمین محرمانگی اطلاعات")}</h4>
                        <p className="text-xs text-white/60 leading-6">{t("تمامی مدارک و اطلاعات دریافتی با رویکرد محرمانه بررسی می‌شوند و بدون هماهنگی و تأیید صاحب پروژه در اختیار اشخاص یا مجموعه‌های نامرتبط قرار نمی‌گیرند.")}</p>
                      </div>
                    </div>
                  </div>

                  {/* Text Columns - moved here below the info cards */}
                  {(settings.journey_text_columns || []).length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="relative overflow-hidden rounded-[24px] border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.06] to-white/[0.02] backdrop-blur-xl p-5"
                    >
                      <div className="space-y-3">
                        {(settings.journey_text_columns || []).map((column: any, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.75 + index * 0.1 }}
                            className={column.bold ? 'font-bold' : ''}
                          >
                            <p className="text-white">{column.text}</p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Market Link Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.75 }}
                    className="relative overflow-hidden rounded-[24px] border border-teal-400/20 bg-gradient-to-br from-teal-400/[0.08] to-cyan-400/[0.03] backdrop-blur-xl p-5"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-cyan-600/10 border border-teal-400/30">
                        <Briefcase size={14} className="text-teal-400" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">{t("بازار کپیتال نتورک")}</h4>
                    </div>
                    <p className="text-xs text-white/80 leading-7 text-justify mb-3">
                      {t("برای درخواست سرمایه و یا سرمایه‌گذاری کمتر از ۵ میلیارد تومان، لطفاً از طریق بازار کپیتال نتورک درخواست‌های خود را ثبت کنید.")}
                    </p>
                    <a
                      href="https://market.capitalnetwork.ir"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-teal-400/30 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 px-4 py-2.5 text-xs font-semibold text-teal-300 backdrop-blur-sm hover:border-teal-400/50 hover:bg-teal-400/25 transition-all cursor-pointer"
                    >
                      <span>market.capitalnetwork.ir</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
