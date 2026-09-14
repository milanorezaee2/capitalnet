/**
 * TableOfContents
 * Sticky sidebar TOC extracted from article headings.
 * Active section is highlighted via IntersectionObserver.
 * Supports H2 / H3 / H4 nesting.
 */
import { useMemo } from 'react';
import { List } from 'lucide-react';
import { useTOCActiveSection } from '../hooks';
import type { TocItem } from '../types';

import { t } from '@/i18n';


interface Props {
  items: TocItem[];
}

export default function TableOfContents({ items }: Props) {
  const allIds = useMemo(() => items.flatMap(flattenIds), [items]);
  const active = useTOCActiveSection(allIds);

  if (!items.length) return null;

  return (
    <nav
      aria-label={t("فهرست مطالب")}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
        <List size={16} className="text-teal-400" aria-hidden="true" />
        {t("فهرست مطالب")}
      </h3>

      <ol className="space-y-0.5" role="list">
        {items.map((item) => (
          <TocEntry key={item.id} item={item} active={active} />
        ))}
      </ol>
    </nav>
  );
}

function TocEntry({ item, active }: { item: TocItem; active: string }) {
  const isActive = active === item.id;
  const indent = item.level === 2 ? '' : item.level === 3 ? 'pr-3' : 'pr-6';

  return (
    <li>
      <a
        href={`#${item.id}`}
        className={`block text-sm py-1.5 px-3 rounded-lg transition-all duration-150 leading-snug ${indent} ${
          isActive
            ? 'bg-teal-500/15 text-teal-300 font-semibold border-r-2 border-teal-400'
            : 'text-white/50 hover:text-white/90 hover:bg-white/5'
        }`}
        aria-current={isActive ? 'location' : undefined}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        {item.title}
      </a>

      {item.children && item.children.length > 0 && (
        <ol role="list">
          {item.children.map((child) => (
            <TocEntry key={child.id} item={child} active={active} />
          ))}
        </ol>
      )}
    </li>
  );
}

function flattenIds(item: TocItem): string[] {
  return [item.id, ...(item.children?.flatMap(flattenIds) ?? [])];
}
