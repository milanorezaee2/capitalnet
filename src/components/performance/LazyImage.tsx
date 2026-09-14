/**
 * Enterprise Lazy Image Component
 * Optimized image loading with blur-up and lazy loading
 */

import React, { useState } from 'react';
import { useLazyImage } from '../../hooks/usePerformance';
import { cn } from '../../lib/utils';

export interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  blurDataURL?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder,
  blurDataURL,
  threshold = 0.1,
  onLoad,
  onError,
}) => {
  const { imgRef, imageSrc, isLoading, error, handleLoad, handleError } = useLazyImage(src, {
    threshold,
  });

  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    handleLoad();
    onLoad?.();
  };

  const handleImageError = () => {
    handleError();
    onError?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {(isLoading || !imageLoaded) && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-800',
            blurDataURL ? 'bg-cover bg-center' : 'animate-pulse'
          )}
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : undefined,
            filter: blurDataURL ? 'blur(20px)' : undefined,
          }}
        >
          {placeholder && !blurDataURL && (
            <div className="flex items-center justify-center h-full text-gray-600">
              {placeholder}
            </div>
          )}
        </div>
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={imageSrc || undefined}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-500">
          <span className="text-sm">تصویر بارگذاری نشد</span>
        </div>
      )}
    </div>
  );
};
