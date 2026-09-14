// ─── Testimonial Card Component ──────────────────────────────────────────────────────
// Customer testimonial with avatar, rating, and quote

import { Card } from './Card';
import { Star } from 'lucide-react';

export interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  avatar: string;
}

export const TestimonialCard = ({ name, role, company, quote, rating, avatar }: TestimonialCardProps) => {
  return (
    <Card variant="glass">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-black text-cyan-300">
          {avatar}
        </div>
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-sm text-slate-400">
            {role} • {company}
          </p>
        </div>
      </div>
      <p className="mt-5 text-slate-300">"{quote}"</p>
      <div className="mt-4 flex gap-1 text-amber-300">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} size={16} fill="currentColor" />
        ))}
      </div>
    </Card>
  );
};
