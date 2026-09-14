// ─── Team Section — Editorial Dark Style + Real Portrait Photos ──────────────
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github, Mail } from 'lucide-react';
import type { TeamMember } from '../../types/enterprise';

import { t } from '@/i18n';


export interface TeamProps {
  members: TeamMember[];
}

// Curated Unsplash professional portrait photos
const TEAM_PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop&face', // woman professional
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop&face', // man professional
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop&face', // woman tech
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop&face', // man tech
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop&face', // woman business
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop&face', // man business
];

const ACCENTS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1'];

const SOCIAL_ICONS = [
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Github, label: 'GitHub' },
  { icon: Mail, label: 'Email' },
];

const TeamCard = ({ member, index }: { member: TeamMember; index: number }) => {
  const photo = TEAM_PHOTOS[index % TEAM_PHOTOS.length];
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden transition-all hover:-translate-y-1 hover:border-white/15"
    >
      {/* portrait strip */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={photo}
          alt={member.name}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1829] via-[#0d1829]/40 to-transparent" />
        <div
          className="absolute inset-0 opacity-15 mix-blend-overlay"
          style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }}
        />

        {/* role badge */}
        <span
          className="absolute bottom-3 right-3 rounded-full px-3 py-1 text-[11px] font-black border"
          style={{ color: accent, borderColor: `${accent}40`, background: `${accent}15` }}
        >
          {member.role}
        </span>
      </div>

      {/* info */}
      <div className="p-6">
        <h3 className="text-lg font-black text-white mb-2">{member.name}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{member.bio}</p>

        {/* social links */}
        <div className="mt-5 flex gap-2">
          {SOCIAL_ICONS.map(({ icon: Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:border-white/20 hover:text-white"
            >
              <Icon size={15} />
            </a>
          ))}
        </div>

        <div
          className="mt-5 h-px"
          style={{ background: `linear-gradient(to left, ${accent}, transparent)` }}
        />
      </div>
    </motion.div>
  );
};

export const Team = ({ members }: TeamProps) => (
  <section id="team" className="py-24 md:py-32 bg-[#0d1829]">
    <div className="mx-auto max-w-7xl px-8">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-indigo-400"
      >
        {t("تیم ما")}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-4xl font-black text-white md:text-5xl"
      >
        {t("اعضای تیم")}
      </motion.h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {members.map((member, index) => (
          <TeamCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </div>
  </section>
);
