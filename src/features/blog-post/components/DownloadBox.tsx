/**
 * DownloadBox
 * Styled download call-to-action for downloadable resources inside articles.
 * Usage in markdown: :::download filename.pdf | عنوان فایل | 2.3 MB
 */
import { Download, FileText, FileArchive, FileVideo, FileAudio } from 'lucide-react';

interface Props {
  filename: string;
  label: string;
  size?: string;
  href?: string;
}

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (['mp4', 'avi', 'mov', 'webm'].includes(ext)) return <FileVideo size={22} aria-hidden="true" />;
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext))  return <FileAudio size={22} aria-hidden="true" />;
  if (['zip', 'rar', '7z', 'tar'].includes(ext))   return <FileArchive size={22} aria-hidden="true" />;
  return <FileText size={22} aria-hidden="true" />;
}

export default function DownloadBox({ filename, label, size, href = '#' }: Props) {
  return (
    <a
      href={href}
      download={filename}
      className="bp-download no-underline group"
      aria-label={`دانلود ${label}`}
    >
      <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:bg-amber-500/25 transition-colors">
        <FileIcon filename={filename} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white truncate">{label}</p>
        <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1.5">
          <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded">
            {filename.split('.').pop()?.toUpperCase()}
          </span>
          {size && <span>{size}</span>}
        </p>
      </div>
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 flex items-center justify-center text-amber-400 transition-colors">
        <Download size={16} aria-hidden="true" />
      </div>
    </a>
  );
}
