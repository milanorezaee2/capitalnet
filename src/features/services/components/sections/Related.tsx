// ─── Related Content Section Component - Card Hover Effects ───────────────────────────
// Premium related content with card hover effects, animations, and stunning visuals

import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, FileText, Sparkles } from 'lucide-react';
import type { RelatedService, RelatedBlogPost } from '../../types/enterprise';

import { t } from '@/i18n';


export interface RelatedProps {
  services: RelatedService[];
  blogPosts: RelatedBlogPost[];
}

const RelatedServiceCard = ({ 
  service, 
  index 
}: { 
  service: RelatedService;
  index: number;
}) => {
  const gradientColors = [
    'from-cyan-500 to-sky-500',
    'from-violet-500 to-fuchsia-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
  ];

  const accentGradient = gradientColors[index % gradientColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${accentGradient})`,
        }}
      />

      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 overflow-hidden">
        {/* Animated gradient background on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${accentGradient})`,
          }}
        />

        {/* Content */}
        <div className="relative">
          {/* Image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative mb-3 h-24 overflow-hidden rounded-xl"
          >
            <div
              className="h-full w-full bg-gradient-to-br opacity-80"
              style={{ background: `linear-gradient(135deg, ${accentGradient})` }}
            >
              <div className="flex h-full items-center justify-center">
                <Briefcase size={32} className="text-white/80" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>

          <motion.p
            whileHover={{ x: 5 }}
            className="font-black text-white text-lg mb-2"
          >
            {service.title}
          </motion.p>
          <p className="text-sm text-slate-300 mb-3">{service.description}</p>
          <motion.a
            href={`#${service.slug}`}
            whileHover={{ x: 5 }}
            className="inline-flex items-center gap-2 text-sm font-black text-cyan-300 transition-colors hover:text-cyan-200"
          >
            {t("مشاهده")}
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: 'spring' }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </motion.a>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
          className="mt-3 h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accentGradient})`,
          }}
        />
      </div>
    </motion.div>
  );
};

const RelatedBlogCard = ({ 
  post, 
  index 
}: { 
  post: RelatedBlogPost;
  index: number;
}) => {
  const gradientColors = [
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-purple-500',
    'from-lime-500 to-green-500',
    'from-orange-500 to-red-500',
  ];

  const accentGradient = gradientColors[index % gradientColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
      whileHover={{ scale: 1.02, x: 5 }}
      className="relative group"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `linear-gradient(135deg, ${accentGradient})`,
        }}
      />

      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 overflow-hidden">
        {/* Animated gradient background on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${accentGradient})`,
          }}
        />

        {/* Content */}
        <div className="relative">
          {/* Image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative mb-3 h-24 overflow-hidden rounded-xl"
          >
            <div
              className="h-full w-full bg-gradient-to-br opacity-80"
              style={{ background: `linear-gradient(135deg, ${accentGradient})` }}
            >
              <div className="flex h-full items-center justify-center">
                <FileText size={32} className="text-white/80" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>

          <motion.p
            whileHover={{ x: 5 }}
            className="font-black text-white text-lg mb-2"
          >
            {post.title}
          </motion.p>
          <p className="text-sm text-slate-300 mb-3">{post.description}</p>
          <motion.a
            href={`/blog/${post.slug}`}
            whileHover={{ x: 5 }}
            className="inline-flex items-center gap-2 text-sm font-black text-rose-300 transition-colors hover:text-rose-200"
          >
            {t("خواندن")}
            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: 'spring' }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </motion.a>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
          className="mt-3 h-1 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accentGradient})`,
          }}
        />
      </div>
    </motion.div>
  );
};

export const Related = ({ services, blogPosts }: RelatedProps) => {
  return (
    <section id="related" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-500/5 to-transparent pointer-events-none" />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mb-12"
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100px' }}
          viewport={{ once: true }}
          className="h-1 rounded-full bg-gradient-to-r from-slate-500 to-zinc-500 mb-6"
        />
        <h2 className="text-4xl font-black text-white md:text-5xl">
          <span className="bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent">
            {t("محتوای مرتبط")}
          </span>
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-300">
          {t("پیشنهادهای مرتبط برای ادامه کار.")}
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Related Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative group"
        >
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            }}
          />

          <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-hidden">
            {/* Animated gradient background on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              }}
            />

            {/* Decorative pattern */}
            <div className="absolute top-0 end-0 w-32 h-32 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            </div>

            {/* Content */}
            <div className="relative">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 mb-6"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white"
                >
                  <Briefcase size={24} />
                </motion.div>
                <h3 className="text-2xl font-black text-white">{t("خدمات مرتبط")}</h3>
              </motion.div>

              <ul className="space-y-4">
                {services.map((service, index) => (
                  <RelatedServiceCard
                    key={service.id}
                    service={service}
                    index={index}
                  />
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Related Blog Posts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative group"
        >
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
            }}
          />

          <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 overflow-hidden">
            {/* Animated gradient background on hover */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(135deg, #f43f5e, #ec4899)',
              }}
            />

            {/* Decorative pattern */}
            <div className="absolute top-0 end-0 w-32 h-32 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full" />
            </div>

            {/* Content */}
            <div className="relative">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center justify-between gap-3 mb-6"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white"
                  >
                    <FileText size={24} />
                  </motion.div>
                  <h3 className="text-2xl font-black text-white">{t("مقالات مرتبط")}</h3>
                </div>
                <a
                  href="/blog"
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  {t("همه مقالات")}
                  <ArrowRight size={12} />
                </a>
              </motion.div>

              <ul className="space-y-4">
                {blogPosts.map((post, index) => (
                  <RelatedBlogCard
                    key={post.id}
                    post={post}
                    index={index}
                  />
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
};
