/**
 * Optimized Image Component
 * Wraps Next.js Image with additional optimizations
 * @module components/OptimizedImage
 */

'use client';

import Image from 'next/image';
import { useState, useCallback, memo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Types
// ============================================================================

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
}

// ============================================================================
// Blur Hash Generator (for placeholder)
// ============================================================================

/**
 * Generate a simple blur data URL based on color
 * In production, use blurhash library for better results
 */
export function generateBlurDataURL(color: string = '#e5e7eb'): string {
  // Create a 1x1 pixel SVG with the given color
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1">
    <rect width="1" height="1" fill="${color}"/\u003e
  </svg\u003e`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Default blur data URLs for common use cases
 */
export const blurPlaceholders = {
  gray: generateBlurDataURL('#f3f4f6'),
  blue: generateBlurDataURL('#dbeafe'),
  green: generateBlurDataURL('#d1fae5'),
  yellow: generateBlurDataURL('#fef3c7'),
  product: generateBlurDataURL('#e5e7eb'),
  avatar: generateBlurDataURL('#d1d5db'),
};

// ============================================================================
// Optimized Image Component
// ============================================================================

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  quality = 85,
  sizes = '(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'blur',
  blurDataURL,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  loading,
  decoding = 'async',
  fetchPriority,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Determine blur data URL
  const finalBlurDataURL = blurDataURL || blurPlaceholders.gray;

  // Error state
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 text-gray-400',
          fill ? 'absolute inset-0' : '',
          containerClassName
        )}
        style={!fill ? { width, height } : undefined}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        fill ? 'absolute inset-0' : '',
        containerClassName
      )}
      style={!fill ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={finalBlurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={{
          objectFit,
          objectPosition,
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        unoptimized={src?.startsWith('data:')}
      />
      
      {/* Skeleton loader while loading */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            fill ? '' : 'rounded-lg'
          )}
          style={!fill ? { width, height } : undefined}
        />
      )}
    </div>
  );
});

// ============================================================================
// Avatar Image Component
// ============================================================================

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export const AvatarImage = memo(function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
  fallback,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const pixelSize = avatarSizes[size];

  // Generate initials for fallback
  const initials = fallback || alt
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-semibold rounded-full',
          size === 'xs' && 'text-xs',
          size === 'sm' && 'text-sm',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-lg',
          size === 'xl' && 'text-xl',
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={pixelSize}
      height={pixelSize}
      className={cn('rounded-full object-cover', className)}
      containerClassName="rounded-full"
      blurDataURL={blurPlaceholders.avatar}
      onError={() => setHasError(true)}
    />
  );
});

// ============================================================================
// Product Image Component
// ============================================================================

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
}

const aspectRatioClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  auto: '',
};

export const ProductImage = memo(function ProductImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  aspectRatio = 'square',
}: ProductImageProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100 rounded-lg',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={cn('object-cover', className)}
          blurDataURL={blurPlaceholders.product}
          sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// Responsive Image Component
// ============================================================================

interface ResponsiveImageProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  aspectRatio: number;
  maxWidth?: number;
}

export const ResponsiveImage = memo(function ResponsiveImage({
  aspectRatio,
  maxWidth,
  containerClassName,
  ...props
}: ResponsiveImageProps) {
  return (
    <div
      className={cn('relative w-full', containerClassName)}
      style={{ maxWidth }}
    >
      <div style={{ paddingBottom: `${100 / aspectRatio}%` }} />
      <OptimizedImage
        {...props}
        fill
        className={cn('absolute inset-0', props.className)}
      />
    </div>
  );
});

export default {
  OptimizedImage,
  AvatarImage,
  ProductImage,
  ResponsiveImage,
  blurPlaceholders,
  generateBlurDataURL,
};
