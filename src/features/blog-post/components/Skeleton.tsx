
import { t } from '@/i18n';

/**
 * Skeleton loaders for the blog post page.
 * Used during data fetch to prevent layout shift.
 */
export function SkeletonLine({ w = '100%', h = '14px' }: { w?: string; h?: string }) {
  return (
    <div
      className="bp-skeleton rounded-lg"
      style={{ width: w, height: h }}
      aria-hidden="true"
    />
  );
}

export function SkeletonBlock({ h = '200px' }: { h?: string }) {
  return (
    <div
      className="bp-skeleton rounded-2xl"
      style={{ width: '100%', height: h }}
      aria-hidden="true"
    />
  );
}

/** Full post skeleton — shown while fetching the article */
export function SkeletonPost() {
  return (
    <div className="animate-pulse space-y-6" aria-label={t("در حال بارگذاری...")} role="status">
      {/* Hero */}
      <SkeletonBlock h="480px" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 space-y-8">
        {/* Breadcrumb */}
        <div className="flex gap-2 items-center">
          <SkeletonLine w="40px" h="12px" />
          <SkeletonLine w="8px"  h="12px" />
          <SkeletonLine w="50px" h="12px" />
          <SkeletonLine w="8px"  h="12px" />
          <SkeletonLine w="120px" h="12px" />
        </div>

        <div className="grid gap-10 lg:grid-cols-[56px_1fr_320px]">
          {/* Left micro sidebar */}
          <div className="hidden lg:flex flex-col gap-4 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} h="44px" />
            ))}
          </div>

          {/* Main */}
          <div className="space-y-6">
            <div className="space-y-3">
              <SkeletonLine w="80%" h="32px" />
              <SkeletonLine w="60%" h="20px" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonLine key={i} w={i % 3 === 2 ? '75%' : '100%'} />
              ))}
            </div>
            <SkeletonBlock h="240px" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonLine key={i} w={i % 4 === 3 ? '60%' : '100%'} />
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block space-y-5">
            <SkeletonBlock h="280px" />
            <SkeletonBlock h="200px" />
            <SkeletonBlock h="160px" />
          </div>
        </div>
      </div>
    </div>
  );
}
