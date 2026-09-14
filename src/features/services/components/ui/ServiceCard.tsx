// ─── Service Card Component ───────────────────────────────────────────────────────────
// Card for displaying service categories with icon and hover effects

import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { ArrowRight } from 'lucide-react';

export interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  href: string;
}

export const ServiceCard = ({ title, description, icon: Icon, accent, href }: ServiceCardProps) => {
  return (
    <motion.article whileHover={{ y: -6, scale: 1.01 }}>
      <Card variant="glass" hover className="h-full p-8">
        <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
          <Icon size={22} />
        </div>
        <h3 className="mt-6 text-2xl font-bold text-white">{title}</h3>
        <p className="mt-3 text-slate-300">{description}</p>
        <a
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-cyan-300 transition hover:text-cyan-200"
        >
          مشاهده بیشتر
          <ArrowRight size={16} />
        </a>
      </Card>
    </motion.article>
  );
};
