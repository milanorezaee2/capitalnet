// ─── Contact & CTA Section Component - Validation & Success Animation ───────────────
// Premium contact form with real-time validation, success animation, and stunning visuals

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Send, Sparkles, Phone } from 'lucide-react';
import type { CTASection, ContactForm as ContactFormType } from '../../types/enterprise';
import { useState } from 'react';

import { t } from '@/i18n';


export interface ContactProps {
  cta: CTASection;
  contact: ContactFormType;
}

export const Contact = ({ cta, contact }: ContactProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return t("نام الزامی است");
        if (value.trim().length < 2) return t("نام باید حداقل 2 کاراکتر باشد");
        return '';
      case 'email':
        if (!value.trim()) return t("ایمیل الزامی است");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return t("ایمیل معتبر نیست");
        return '';
      case 'phone':
        if (value && !/^[0-9]{10,11}$/.test(value.replace(/\D/g, ''))) {
          return t("شماره موبایل معتبر نیست");
        }
        return '';
      case 'message':
        if (!value.trim()) return t("پیام الزامی است");
        if (value.trim().length < 10) return t("پیام باید حداقل 10 کاراکتر باشد");
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSuccess(true);

    // Reset form after success
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 5000);
  };

  return (
    <section id="contact" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Main card */}
        <div className="relative rounded-[40px] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-white/5 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 rounded-[40px]" />
          
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          </div>

          <div className="relative grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            {/* CTA Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-cyan-300" />
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  {cta.type}
                </span>
              </div>
              
              <h2 className="text-4xl font-black text-white md:text-5xl">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                  {cta.title}
                </span>
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
                {cta.description}
              </p>

              {/* Decorative elements */}
              <div className="mt-8 flex gap-4">
                <div className="h-2 w-20 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
                <div className="h-2 w-8 rounded-full bg-white/20" />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-hidden">
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />

                <div className="relative">
                  <h3 className="text-2xl font-black text-white mb-2">{contact.title}</h3>
                  {contact.description && (
                    <p className="text-sm text-slate-400">{contact.description}</p>
                  )}
                  
                  <AnimatePresence mode="wait">
                    {!isSuccess ? (
                      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* Name field */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            {t("نام")}
                          </label>
                          <motion.input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            whileFocus={{ scale: 1.02 }}
                            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 transition-all ${
                              errors.name 
                                ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:bg-red-500/10' 
                                : 'border-white/10 bg-white/5 focus:border-cyan-400/50 focus:bg-white/10'
                            }`}
                            placeholder={t("نام شما")}
                          />
                          <AnimatePresence>
                            {errors.name && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-400"
                              >
                                {errors.name}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Email field */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            {t("ایمیل")}
                          </label>
                          <motion.input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            whileFocus={{ scale: 1.02 }}
                            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 transition-all ${
                              errors.email 
                                ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:bg-red-500/10' 
                                : 'border-white/10 bg-white/5 focus:border-cyan-400/50 focus:bg-white/10'
                            }`}
                            placeholder={t("ایمیل شما")}
                          />
                          <AnimatePresence>
                            {errors.email && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-400"
                              >
                                {errors.email}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Phone field */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            {t("موبایل (اختیاری)")}
                          </label>
                          <motion.input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            whileFocus={{ scale: 1.02 }}
                            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 transition-all ${
                              errors.phone 
                                ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:bg-red-500/10' 
                                : 'border-white/10 bg-white/5 focus:border-cyan-400/50 focus:bg-white/10'
                            }`}
                            placeholder={t("شماره موبایل")}
                          />
                          <AnimatePresence>
                            {errors.phone && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-400"
                              >
                                {errors.phone}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Message field */}
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-white">
                            {t("پیام")}
                          </label>
                          <motion.textarea
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            whileFocus={{ scale: 1.02 }}
                            rows={4}
                            className={`w-full rounded-2xl border px-4 py-3 text-white outline-none placeholder:text-slate-400 transition-all resize-none ${
                              errors.message 
                                ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:bg-red-500/10' 
                                : 'border-white/10 bg-white/5 focus:border-cyan-400/50 focus:bg-white/10'
                            }`}
                            placeholder={t("پیام شما")}
                          />
                          <AnimatePresence>
                            {errors.message && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-1 text-xs text-red-400"
                              >
                                {errors.message}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Submit button */}
                        <motion.button
                          type="submit"
                          disabled={isSubmitting}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="relative w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 py-4 font-black text-white shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              {t("در حال ارسال...")}
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              {cta.primaryButton.label}
                              <ArrowRight size={18} />
                            </span>
                          )}
                        </motion.button>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-12 text-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', duration: 0.5 }}
                          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg"
                        >
                          <CheckCircle2 size={40} className="text-white" />
                        </motion.div>
                        <h4 className="text-2xl font-black text-white mb-2">
                          {t("پیام شما با موفقیت ارسال شد!")}
                        </h4>
                        <p className="text-slate-300">
                          {t("به زودی با شما تماس خواهیم گرفت.")}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mt-12 flex justify-end items-center gap-6"
      >
        {/* Contact Us Button */}
        <motion.a
          href="#contact"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-4 font-black text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/40"
        >
          <Phone size={20} />
          {t("تماس با ما")}
        </motion.a>
      </motion.div>
    </section>
  );
};
