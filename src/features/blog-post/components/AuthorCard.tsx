/**
 * AuthorCard — full-featured card showing author details, bio,
 * expertise tags, social links, and article count.
 */
import { Twitter, Linkedin, Globe, Github, BookOpen } from 'lucide-react';
import type { BlogAuthorFull } from '../types';

import { t } from '@/i18n';


interface Props {
  author: BlogAuthorFull;
  /** compact variant for sidebar */
  compact?: boolean;
}

export default function AuthorCard({ author, compact = false }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${
        compact ? 'p-5' : 'p-7'
      }`}
      itemScope
      itemType="https://schema.org/Person"
    >
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            loading="lazy"
            decoding="async"
            className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 ring-2 ring-teal-500/30"
            itemProp="image"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            aria-label={t('آواتار {name}', { name: author.name })}
          >
            {author.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span
              className="font-bold text-white text-base"
              itemProp="name"
            >
              {author.name}
            </span>
            <span className="text-xs bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded-full">
              {t("نویسنده")}
            </span>
          </div>
          <p className="text-white/50 text-sm" itemProp="jobTitle">
            {author.role}
          </p>
          {author.articleCount !== undefined && (
            <p className="flex items-center gap-1 text-xs text-white/35 mt-1">
              <BookOpen size={11} aria-hidden="true" />
              {author.articleCount} {t("مقاله")}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {author.bio && !compact && (
        <p
          className="text-white/60 text-sm leading-relaxed mb-4"
          itemProp="description"
        >
          {author.bio}
        </p>
      )}

      {/* Expertise */}
      {author.expertise && author.expertise.length > 0 && !compact && (
        <div className="flex flex-wrap gap-2 mb-4">
          {author.expertise.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-white/5 text-white/50 border border-white/10 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Social links */}
      {author.socialLinks && (
        <div className="flex items-center gap-3">
          {author.socialLinks.twitter && (
            <a
              href={author.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center text-white/40 hover:text-sky-400 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              aria-label={t("توییتر")}
            >
              <Twitter size={15} aria-hidden="true" />
            </a>
          )}
          {author.socialLinks.linkedin && (
            <a
              href={author.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 flex items-center justify-center text-white/40 hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label={t("لینکدین")}
            >
              <Linkedin size={15} aria-hidden="true" />
            </a>
          )}
          {author.socialLinks.github && (
            <a
              href={author.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label={t("گیت‌هاب")}
            >
              <Github size={15} aria-hidden="true" />
            </a>
          )}
          {author.socialLinks.website && (
            <a
              href={author.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-teal-500/20 flex items-center justify-center text-white/40 hover:text-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              aria-label={t("وبسایت")}
            >
              <Globe size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
