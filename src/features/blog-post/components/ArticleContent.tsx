/**
 * ArticleContent v2 — Full block-level renderer
 * ─────────────────────────────────────────────────────────────────────────────
 * Supported block syntax (line-by-line parser):
 *
 * Headings       ## / ### / ####  (ATX)  +  **Bold** legacy
 * Paragraph      plain text
 * Code block     ``` lang ... ```
 * Blockquote     > text  or  > text -- Author
 * Table          | col | col |
 * Unordered list - / * / •
 * Ordered list   1. 2. 3.
 * Horizontal rule ---
 *
 * Special fenced blocks (:::type ... :::):
 *   :::info / :::warning / :::error / :::success / :::tip
 *   :::download filename | label | size
 *   :::video url | title
 *   :::gallery img1|alt1, img2|alt2
 *   :::audio url | title
 *
 * Inline: **bold** *italic* `code` [text](url) ![alt](img)
 *
 * Images: ![alt](url) on its own line → <figure> with lazy loading
 */
import { useState, useCallback } from 'react';
import {
  Check, Copy, Info, AlertTriangle, XCircle, CheckCircle2, Lightbulb, Quote
} from 'lucide-react';
import type { AlertVariant, FontSizeLevel } from '../types';
import DownloadBox   from './DownloadBox';
import VideoEmbed    from './VideoEmbed';
import GalleryGrid   from './GalleryGrid';

import { t } from '@/i18n';


// ─── Font size ────────────────────────────────────────────────────────────────
const FONT_SIZE_CLASS: Record<FontSizeLevel, string> = {
  sm: 'text-sm', base: 'text-[15px]', lg: 'text-lg', xl: 'text-xl',
};

// ─── Alert config ─────────────────────────────────────────────────────────────
const ALERT_CFG: Record<AlertVariant, { icon: React.ReactNode; label: string; cls: string }> = {
  info:    { icon: <Info size={16} />,           label: 'اطلاعات',  cls: 'bp-alert-info'    },
  warning: { icon: <AlertTriangle size={16} />,  label: 'هشدار',    cls: 'bp-alert-warning' },
  error:   { icon: <XCircle size={16} />,        label: 'خطا',      cls: 'bp-alert-error'   },
  success: { icon: <CheckCircle2 size={16} />,   label: 'موفقیت',   cls: 'bp-alert-success' },
  tip:     { icon: <Lightbulb size={16} />,      label: 'نکته',     cls: 'bp-alert-tip'     },
};

// ─── useCopy (local, no shared hook dependency) ───────────────────────────────
function useCopy(ms = 2000): [boolean, (t: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), ms);
    });
  }, [ms]);
  return [copied, copy];
}

// ─── Code Block ──────────────────────────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, copy] = useCopy();
  const lines = code.split('\n');

  return (
    <figure className="bp-code-block my-6">
      <div className="bp-code-header">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-400/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
          {lang && <span className="text-xs text-white/40 font-mono">{lang}</span>}
        </div>
        <button
          onClick={() => copy(code)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors px-2.5 py-1 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500/40"
          aria-label={copied ? t("کپی شد") : t("کپی کد")}
        >
          {copied
            ? <><Check size={12} className="text-emerald-400" aria-hidden="true" /> {t("کپی شد")}</>
            : <><Copy size={12} aria-hidden="true" /> {t("کپی")}</>}
        </button>
      </div>
      <div className="bp-code-body">
        <pre>
          {lines.map((line, i) => (
            <div key={i} className="bp-code-line">
              <span className="bp-code-num">{i + 1}</span>
              <span className="bp-code-text">{line || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </figure>
  );
}

// ─── Alert Box ────────────────────────────────────────────────────────────────
function AlertBox({ variant, children }: { variant: AlertVariant; children: React.ReactNode }) {
  const cfg = ALERT_CFG[variant];
  return (
    <div className={`bp-alert ${cfg.cls}`} role="note" aria-label={cfg.label}>
      <span className="flex-shrink-0 mt-0.5 text-white/60">{cfg.icon}</span>
      <div className="text-sm text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

// ─── Blockquote ───────────────────────────────────────────────────────────────
function BlockQuote({ text, author }: { text: string; author?: string }) {
  return (
    <blockquote className="bp-quote">
      <Quote size={32} className="absolute top-4 left-4 text-teal-400/15" aria-hidden="true" />
      <p className="text-base md:text-lg text-white/75 italic leading-relaxed">{renderInline(text)}</p>
      {author && (
        <footer className="mt-3 text-sm text-white/40 font-semibold">— {author}</footer>
      )}
    </blockquote>
  );
}

// ─── Data Table ───────────────────────────────────────────────────────────────
function DataTable({ rows }: { rows: string[][] }) {
  if (!rows.length) return null;
  const [header, ...body] = rows;
  return (
    <div className="bp-table-wrap">
      <table className="bp-table">
        <thead>
          <tr>
            {header.map((cell, i) => (
              <th key={i} scope="col">{cell.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}>{cell.trim()}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Standalone Image ─────────────────────────────────────────────────────────
function StandaloneImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-6">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full rounded-2xl object-cover max-h-[480px]"
      />
      {caption && (
        <figcaption className="text-center text-xs text-white/40 mt-2">{caption}</figcaption>
      )}
    </figure>
  );
}

// ─── Inline renderer ──────────────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
      return <em key={i} className="text-teal-300/90 italic">{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded text-[0.88em]">{part.slice(1, -1)}</code>;
    // Inline link [label](url)
    const linkMatch = part.match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch)
      return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-teal-400 underline underline-offset-2 hover:text-teal-300 transition-colors">{linkMatch[1]}</a>;
    return part;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  content: string;
  fontSize?: FontSizeLevel;
  readingMode?: boolean;
}

export default function ArticleContent({ content, fontSize = 'base', readingMode = false }: Props) {
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let hIdx = 0;
  const hId = (lvl: number, txt: string) =>
    `h${lvl}-${txt.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-${hIdx++}`;

  while (i < lines.length) {
    const raw  = lines[i];
    const line = raw.trimEnd();

    // ── Blank ─────────────────────────────────────────────────────────────────
    if (!line.trim()) { i++; continue; }

    // ── ATX Headings ──────────────────────────────────────────────────────────
    if (line.startsWith('#### ')) {
      const txt = line.slice(5).trim(); const id = hId(4, txt);
      nodes.push(<h4 key={id} id={id} className="text-[1.0625rem] font-semibold text-white/90 mt-7 mb-2.5 scroll-mt-20">{renderInline(txt)}</h4>);
      i++; continue;
    }
    if (line.startsWith('### ')) {
      const txt = line.slice(4).trim(); const id = hId(3, txt);
      nodes.push(<h3 key={id} id={id} className="text-[1.25rem] font-bold text-white mt-9 mb-3 scroll-mt-20">{renderInline(txt)}</h3>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      const txt = line.slice(3).trim(); const id = hId(2, txt);
      nodes.push(
        <h2 key={id} id={id} className="text-[1.5rem] font-extrabold text-white mt-12 mb-4 pb-2.5 border-b border-white/8 scroll-mt-20">
          {renderInline(txt)}
        </h2>
      );
      i++; continue;
    }
    // Legacy **Heading** (backwards compat)
    if (/^\*\*[^*].+\*\*$/.test(line.trim())) {
      const txt = line.replace(/\*\*/g, '').trim(); const id = hId(2, txt);
      nodes.push(
        <h2 key={id} id={id} className="text-[1.5rem] font-extrabold text-white mt-12 mb-4 pb-2.5 border-b border-white/8 scroll-mt-20">
          {txt}
        </h2>
      );
      i++; continue;
    }

    // ── Fenced blocks (:::type) ───────────────────────────────────────────────
    const fenceMatch = line.match(/^:::(info|warning|error|success|tip|download|video|gallery|audio)(.*)$/);
    if (fenceMatch) {
      const type  = fenceMatch[1];
      const param = fenceMatch[2].trim();

      // Inline-param blocks
      if (type === 'download') {
        const [filename = 'file', label = t("دانلود فایل"), size] = param.split('|').map((s) => s.trim());
        nodes.push(<DownloadBox key={`dl-${i}`} filename={filename} label={label} size={size} />);
        i++; continue;
      }
      if (type === 'video') {
        const [url = '', title] = param.split('|').map((s) => s.trim());
        nodes.push(<VideoEmbed key={`vid-${i}`} url={url} title={title} />);
        i++; continue;
      }
      if (type === 'gallery') {
        const items = param.split(',').map((chunk) => {
          const [src = '', alt = ''] = chunk.trim().split('|');
          return { src: src.trim(), alt: alt.trim() };
        }).filter((it) => it.src);
        nodes.push(<GalleryGrid key={`gal-${i}`} items={items} />);
        i++; continue;
      }
      if (type === 'audio') {
        const [src = '', title = t("صوت")] = param.split('|').map((s) => s.trim());
        nodes.push(
          <figure key={`audio-${i}`} className="my-6 rounded-2xl border border-white/10 p-4 bg-white/[0.02]">
            <figcaption className="text-sm text-white/60 mb-2">{title}</figcaption>
            <audio src={src} controls className="w-full" aria-label={title} />
          </figure>
        );
        i++; continue;
      }

      // Multi-line blocks (:::type ... :::)
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        contentLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(
        <AlertBox key={`alert-${i}`} variant={type as AlertVariant}>
          {contentLines.join('\n')}
        </AlertBox>
      );
      continue;
    }

    // ── Code block (```) ──────────────────────────────────────────────────────
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      i++;
      nodes.push(<CodeBlock key={`code-${i}`} code={codeLines.join('\n')} lang={lang} />);
      continue;
    }

    // ── Blockquote ────────────────────────────────────────────────────────────
    if (line.startsWith('> ')) {
      const inner = line.slice(2).trim();
      const m = inner.match(/^(.+)\s+--\s+(.+)$/);
      nodes.push(
        m
          ? <BlockQuote key={`bq-${i}`} text={m[1]} author={m[2]} />
          : <BlockQuote key={`bq-${i}`} text={inner} />
      );
      i++; continue;
    }

    // ── Standalone image ![alt](src) (optional ==caption==) ───────────────────
    const imgMatch = line.match(/^!\[(.+?)\]\((.+?)\)(?:\s+==(.+)==)?$/);
    if (imgMatch) {
      nodes.push(
        <StandaloneImage key={`img-${i}`} alt={imgMatch[1]} src={imgMatch[2]} caption={imgMatch[3]} />
      );
      i++; continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────────
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      nodes.push(<hr key={`hr-${i}`} className="my-8 border-t border-white/8" />);
      i++; continue;
    }

    // ── Table ─────────────────────────────────────────────────────────────────
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (!cells.every((c) => /^[-:\s]+$/.test(c))) rows.push(cells);
        i++;
      }
      nodes.push(<DataTable key={`table-${i}`} rows={rows} />);
      continue;
    }

    // ── Unordered list ────────────────────────────────────────────────────────
    if (/^[-*•]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s/.test(lines[i].trimEnd())) {
        items.push(lines[i].replace(/^[-*•]\s/, '').trim()); i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-4 space-y-2 list-none">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-white/70">
              <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-teal-400" aria-hidden="true" />
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trimEnd())) {
        items.push(lines[i].replace(/^\d+\.\s/, '').trim()); i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-4 space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-white/70">
              <span className="flex-shrink-0 font-bold text-teal-400 text-sm min-w-[20px]">{idx + 1}.</span>
              <span className="leading-relaxed">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Fallback: paragraph ───────────────────────────────────────────────────
    nodes.push(
      <p key={`p-${i}`} className="my-4 text-white/70 leading-loose text-justify">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div className={`bp-prose ${FONT_SIZE_CLASS[fontSize]} ${readingMode ? 'max-w-2xl mx-auto' : ''}`}>
      {nodes}
    </div>
  );
}
