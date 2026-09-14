// ─── Timeline Component ───────────────────────────────────────────────────────────────
// Vertical timeline for process steps

import { Card } from './Card';

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
}

export interface TimelineProps {
  steps: TimelineStep[];
}

export const Timeline = ({ steps }: TimelineProps) => {
  return (
    <div className="relative rounded-[32px] border border-white/10 bg-slate-950/50 p-6 md:p-8">
      <div className="absolute end-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-cyan-400/50 to-amber-400/50" aria-hidden="true" />
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex gap-4">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-lg font-black text-cyan-300">
              {index + 1}
            </div>
            <Card variant="glass" className="flex-1 p-5">
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-slate-300">{step.description}</p>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
