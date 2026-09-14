/**
 * VideoEmbed
 * Supports YouTube, Vimeo, and self-hosted MP4.
 * Lazy-loads (no embed until user interacts on mobile).
 */
import { useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  url: string;
  title?: string;
  poster?: string;
  /** Aspect ratio: '16/9' | '4/3' | '1/1' */
  ratio?: string;
}

function getEmbedInfo(url: string): { kind: 'youtube' | 'vimeo' | 'mp4' | 'unknown'; embedUrl: string } {
  // YouTube
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return { kind: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return { kind: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0` };
  }

  // MP4 / self-hosted
  if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')) {
    return { kind: 'mp4', embedUrl: url };
  }

  return { kind: 'unknown', embedUrl: url };
}

export default function VideoEmbed({ url, title = 'ویدئو', poster, ratio = '16/9' }: Props) {
  const { kind, embedUrl } = getEmbedInfo(url);
  const [active, setActive] = useState(false);

  const paddingTop = ratio === '4/3' ? '75%' : ratio === '1/1' ? '100%' : '56.25%';

  if (kind === 'mp4') {
    return (
      <figure className="my-6 rounded-2xl overflow-hidden border border-white/10">
        <video
          src={url}
          poster={poster}
          controls
          preload="metadata"
          className="w-full"
          aria-label={title}
        />
        {title && (
          <figcaption className="text-center text-xs text-white/40 py-2 border-t border-white/8 bg-white/[0.02]">
            {title}
          </figcaption>
        )}
      </figure>
    );
  }

  if (kind === 'unknown') {
    return (
      <div className="my-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/40 text-center">
        ویدئو قابل نمایش نیست.
      </div>
    );
  }

  return (
    <figure className="my-6 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
      <div className="relative w-full" style={{ paddingTop }}>
        {!active ? (
          /* Thumbnail / play button */
          <button
            onClick={() => setActive(true)}
            className="absolute inset-0 w-full h-full group flex items-center justify-center bg-black focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            aria-label={`پخش ویدئو: ${title}`}
          >
            {poster && (
              <img
                src={poster}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="relative z-10 w-16 h-16 rounded-full bg-teal-500/90 flex items-center justify-center shadow-2xl group-hover:bg-teal-400/90 group-hover:scale-110 transition-all duration-200">
              <Play size={28} className="text-white mr-1" fill="currentColor" aria-hidden="true" />
            </div>
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" aria-hidden="true" />
          </button>
        ) : (
          <iframe
            src={`${embedUrl}&autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        )}
      </div>
      {title && (
        <figcaption className="text-center text-xs text-white/40 py-2.5 border-t border-white/8 bg-white/[0.02]">
          {title}
        </figcaption>
      )}
    </figure>
  );
}
