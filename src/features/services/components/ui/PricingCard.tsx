// ─── Pricing Card Component ──────────────────────────────────────────────────────────
// Modern pricing card with features list and CTA

import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { CheckCircle2 } from 'lucide-react';

import { t } from '@/i18n';


export interface PricingCardProps {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  limitations: string[];
  featured?: boolean;
  ctaLabel: string;
}

export const PricingCard = ({ title, price, description, features, limitations, featured, ctaLabel }: PricingCardProps) => {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card
        variant={featured ? 'elevated' : 'glass'}
        className={featured ? 'border-cyan-400/30 bg-cyan-400/10' : ''}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          {featured && <span className="rounded-full bg-amber-400/20 px-3 py-1 text-sm font-semibold text-amber-300">{t("محبوب")}</span>}
        </div>
        <p className="mt-3 text-slate-300">{description}</p>
        <p className="mt-6 text-3xl font-black text-white">{price}</p>
        <ul className="mt-6 space-y-3 text-slate-300">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2">
              <CheckCircle2 size={16} className="mt-1 shrink-0 text-cyan-300" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="text-sm font-semibold text-slate-400">{t("محدودیت")}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <Button variant="primary" className="mt-8 w-full">
          {ctaLabel}
        </Button>
      </Card>
    </motion.div>
  );
};
