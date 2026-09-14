/**
 * PostMetaBar
 * Compact info bar below the hero:
 * publish date, last updated, reading time, views, likes, comments, word count, version.
 */
import { Calendar, RefreshCw, Clock, Eye, ThumbsUp, MessageCircle, FileText, Tag } from 'lucide-react';

interface Props {
  publishedAt:  string;
  updatedAt?:   string;
  readTime:     string;
  views?:       number;
  likes?:       number;
  commentCount: number;
  wordCount?:   number;
  version?:     string;
  category:     string;
}

function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/50 text-xs">
      <span className="text-teal-400/70" aria-hidden="true">{icon}</span>
      {label}
    </div>
  );
}

export default function PostMetaBar({
  publishedAt, updatedAt, readTime, views, likes, commentCount, wordCount, version, category
}: Props) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2.5 px-5 py-3 rounded-2xl border border-white/8 bg-white/[0.02] mb-6"
      aria-label="اطلاعات مقاله"
    >
      <MetaItem icon={<Calendar size={13} />}       label={publishedAt} />
      {updatedAt && (
        <MetaItem icon={<RefreshCw size={13} />}     label={`بروزرسانی: ${updatedAt}`} />
      )}
      <MetaItem icon={<Clock size={13} />}           label={readTime} />
      {(views ?? 0) > 0 && (
        <MetaItem icon={<Eye size={13} />}           label={`${(views ?? 0).toLocaleString('fa-IR')} بازدید`} />
      )}
      {(likes ?? 0) > 0 && (
        <MetaItem icon={<ThumbsUp size={13} />}      label={`${(likes ?? 0).toLocaleString('fa-IR')} پسند`} />
      )}
      <MetaItem icon={<MessageCircle size={13} />}   label={`${commentCount} نظر`} />
      {(wordCount ?? 0) > 0 && (
        <MetaItem icon={<FileText size={13} />}      label={`${(wordCount ?? 0).toLocaleString('fa-IR')} کلمه`} />
      )}
      <MetaItem icon={<Tag size={13} />}             label={category} />
      {version && (
        <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-full font-mono">
          v{version}
        </span>
      )}
    </div>
  );
}
