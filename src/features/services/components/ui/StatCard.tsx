// ─── Stat Card Component ────────────────────────────────────────────────────────────
// Display statistics with counter animation

import { Card } from './Card';

export interface StatCardProps {
  value: string;
  label: string;
  accent?: string;
}

export const StatCard = ({ value, label, accent = 'text-cyan-300' }: StatCardProps) => {
  return (
    <Card variant="glass" className="text-center">
      <p className={`text-4xl font-black ${accent}`}>{value}</p>
      <p className="mt-2 text-slate-400">{label}</p>
    </Card>
  );
};
