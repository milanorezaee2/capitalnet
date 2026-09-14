/**
 * AIBox — AI Summary / Key Takeaways
 * Shown at the top of the article body.
 * Parses "نکات کلیدی:" or "Key Takeaways:" sections from content
 * OR accepts explicit items array.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';

interface Props {
  items?: string[];
  summary?: string;
  /** Collapsed by default on mobile */
  defaultOpen?: boolean;
}

/** Parse key-takeaway lines from raw content string */
export function parseTakeaways(content: string): string[] {
  const lines = content.split('\n');
  const items: string[] = [];
  let inside = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (/^(نکات کلیدی|Key Takeaways|Takeaways|خلاصه نکات):?$/i.test(line)) {
      inside = true;
      continue;
    }
    if (inside && line.startsWith('##')) break;
    if (inside && /^[-✓•✅]\s/.test(line)) {
      items.push(line.replace(/^[-✓•✅]\s/, '').trim());
    }
  }

  return items;
}

export default function AIBox({ items = [], summary, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (!items.length && !summary) return null;

  return (
    <div className="bp-ai-box mb-8 bp-no-print" role="complementary" aria-label="خلاصه هوشمند">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full gap-3 focus:outline-none focus:ring-2 focus:ring-teal-500/40 rounded-xl"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500/30 to-violet-500/30 flex items-center justify-center">
            <Sparkles size={14} className="text-teal-300" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-white">نکات کلیدی مقاله</span>
          <span className="text-xs bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded-full font-semibold">AI</span>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="text-white/40"
          aria-hidden="true"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {summary && (
              <p className="mt-4 text-sm text-white/65 leading-relaxed">{summary}</p>
            )}

            {items.length > 0 && (
              <ul className="mt-4 space-y-2.5" role="list">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={15}
                      className="flex-shrink-0 mt-0.5 text-teal-400"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-white/70 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
