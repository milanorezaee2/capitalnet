// ─── Tracked Link Components ──────────────────────────────────────────────────

import { ReactNode, MouseEvent, useMemo } from 'react';
import { generateLinkId } from '../lib/linkTracking';

interface TrackedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  linkId?: string;
  external?: boolean;
  [key: string]: any;
}

/**
 * Component برای لینک‌های tracked
 * خودکار link_id را اضافه می‌کند
 */
export function TrackedLink({
  href,
  children,
  className,
  onClick,
  linkId: customLinkId,
  external = false,
  ...props
}: TrackedLinkProps) {
  const linkId = useMemo(() => customLinkId || generateLinkId(), [customLinkId]);

  // اگر external است، link_id را اضافه نکن
  if (external || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={className} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  // اضافه کردن شناسه حرفه‌ای به path
  const separator = href.includes('?') ? '&' : '?';
  const trackedHref = `${href}${separator}v=${linkId}`;

  return (
    <a href={trackedHref} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

interface TrackedButtonProps {
  onClick: (linkId: string) => void;
  children: ReactNode;
  className?: string;
  linkId?: string;
  [key: string]: any;
}

/**
 * Component برای دکمه‌های tracked
 */
export function TrackedButton({
  onClick,
  children,
  className,
  linkId: customLinkId,
  ...props
}: TrackedButtonProps) {
  const linkId = useMemo(() => customLinkId || generateLinkId(), [customLinkId]);

  const handleClick = () => {
    onClick(linkId);
  };

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}

/**
 * Helper برای ایجاد tracked URL
 */
export function createTrackedUrl(baseUrl: string, linkId?: string): string {
  const id = linkId || generateLinkId();
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}v=${id}`;
}

/**
 * Component برای نمایش tracking badge
 */
interface TrackingBadgeProps {
  linkId?: string;
  className?: string;
}

export function TrackingBadge({ linkId, className }: TrackingBadgeProps) {
  if (!linkId) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono text-white/40 ${className || ''}`}>
      <span className="w-2 h-2 rounded-full bg-teal-500/50" />
      ID: {linkId.substring(0, 8)}...
    </span>
  );
}

/**
 * Component برای نمایش tracking info در admin
 */
interface TrackingInfoDisplayProps {
  linkId?: string;
  path: string;
  clickCount?: number;
}

export function TrackingInfoDisplay({ linkId, path, clickCount }: TrackingInfoDisplayProps) {
  if (!linkId) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white/70">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-white/50 text-xs">Link ID</div>
          <div className="font-mono text-teal-400 text-xs">{linkId}</div>
        </div>
        <div>
          <div className="text-white/50 text-xs">Path</div>
          <div className="font-mono text-white/70 text-xs truncate">{path}</div>
        </div>
        {clickCount !== undefined && (
          <div className="col-span-2">
            <div className="text-white/50 text-xs">Clicks</div>
            <div className="text-amber-400 font-semibold">{clickCount}</div>
          </div>
        )}
      </div>
    </div>
  );
}
