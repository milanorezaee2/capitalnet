// ─── Newsletter Section Component - Input Animations ───────────────────────────────────
// Premium newsletter with input animations, and stunning visuals

import { motion } from 'framer-motion';
import { Mail, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { Newsletter } from '../../types/enterprise';

import { t } from '@/i18n';


export interface NewsletterProps {
  newsletter: Newsletter;
}

export const NewsletterSection = ({ newsletter }: NewsletterProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-12">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-[40px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-2xl" />

        <div className="relative rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 overflow-hidden">
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.1) 50%, rgba(139,92,246,0.1) 100%)' }}
          />

          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
          </div>

          {/* Content */}
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-cyan-400" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
                  {newsletter.title}
                </p>
              </div>
              <motion.h2
                whileHover={{ x: 5 }}
                className="text-3xl md:text-4xl font-black text-white"
              >
                {newsletter.description}
              </motion.h2>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative flex-1">
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isFocused ? 1.1 : 1,
                    rotate: isFocused ? 360 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <Mail size={20} />
                </motion.div>

                {/* Input */}
                <motion.input
                  aria-label={t("ایمیل")}
                  placeholder={newsletter.placeholder}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  whileFocus={{ scale: 1.02 }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 pr-12 pl-4 py-4 text-white outline-none placeholder:text-slate-400 transition-all focus:border-cyan-400/50 focus:bg-white/10"
                  required
                />

                {/* Focus glow */}
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-0 transition-opacity"
                  animate={{
                    opacity: isFocused ? 1 : 0,
                    boxShadow: isFocused ? '0 0 20px rgba(34, 211, 238, 0.3)' : 'none',
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  }}
                />
              </div>

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-black text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40"
              >
                <div className="flex items-center gap-2">
                  <Send size={18} />
                  {newsletter.buttonLabel}
                </div>
              </motion.button>
            </motion.form>
          </div>

        </div>
      </motion.div>
    </section>
  );
};
