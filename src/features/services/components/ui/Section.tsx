// ─── Section Component ───────────────────────────────────────────────────────────────
// Reusable section wrapper with consistent spacing and layout

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  id?: string;
  centered?: boolean;
  children: ReactNode;
}

export const Section = ({ title, description, id, centered = false, children, className, ...props }: SectionProps) => {
  return (
    <section id={id} className={cn('mx-auto max-w-7xl px-6 py-16 md:py-24', className)} {...props}>
      {(title || description) && (
        <div className={cn('mb-10', centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl')}>
          {title && (
            <h2 id={id ? `${id}-title` : undefined} className="text-3xl font-black text-white md:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-4 text-lg leading-8 text-slate-300">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
};
