/**
 * OptimizedImage Component
 * Next.js Image wrapper with lazy loading and fallback support
 * @module components/ui/OptimizedImage
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';
import { useIntersectionObserver } from '@/hooks/usePerformance';

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
  loading?: 'eager' | 'lazy';
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  sizes?: string;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazyBoundary?: string;
  lazyRoot?: React.RefObject<HTMLElement> | null;
  useIntersectionLazy?: boolean;
  rootMargin?: string;
  threshold?: number;
}

// ============================================================================
// Default Fallback Components
// ============================================================================

const DefaultSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton
    variant="rectangular"
    className={cn('w-full h-full', className)}
    animation="pulse"
  />
);

const DefaultErrorFallback: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'flex items-center justify-center bg-slate-800 text-slate-500 w-full h-full',
      className
    )}
  >
    <svg
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

// ============================================================================
// Main Component
// ============================================================================

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  loading: loadingProp,
  placeholder = 'skeleton',
  blurDataURL,
  fallback,
  errorFallback,
  sizes,
  quality = 80,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  lazyBoundary = '200px',
  lazyRoot,
  useIntersectionLazy = false,
  rootMargin = '200px',
  threshold = 0.01,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Intersection observer for custom lazy loading
  const { ref: intersectionRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    triggerOnce: true,
    rootMargin,
    threshold,
  });

  // Determine if we should use intersection-based lazy loading
  const shouldUseIntersectionLazy = useIntersectionLazy && !priority;

  // Determine effective loading strategy
  const effectiveLoading = useMemo(() => {
    if (priority) return 'eager';
    if (shouldUseIntersectionLazy) return 'lazy';
    return loadingProp || 'lazy';
  }, [priority, shouldUseIntersectionLazy, loadingProp]);

  // Determine if image should actually render
  const shouldRender = useMemo(() => {
    if (!shouldUseIntersectionLazy) return true;
    return isIntersecting;
  }, [shouldUseIntersectionLazy, isIntersecting]);

  // Handle successful load
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // Handle error
  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Determine placeholder behavior
  const nextPlaceholder = useMemo(() => {
    if (placeholder === 'blur' && blurDataURL) return 'blur';
    return 'empty';
  }, [placeholder, blurDataURL]);

  // Render loading state
  const renderLoadingState = () => {
    if (fallback) return fallback;
    if (placeholder === 'skeleton') return <DefaultSkeleton className={className} />;
    return null;
  };

  // Render error state
  const renderErrorState = () => {
    if (errorFallback) return errorFallback;
    return <DefaultErrorFallback className={className} />;
  };

  // Generate blur data URL if not provided (simple gray placeholder)
  const generatedBlurDataURL = useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') {
      // Generate a simple SVG blur placeholder
      return `data:image/svg+xml;base64,${btoa(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width || 100}" height="${height || 100}">
          <rect width="100%" height="100%" fill="#1e293b"/>
        </svg>
        `
      )}`;
    }
    return undefined;
  }, [blurDataURL, placeholder, width, height]);

  return (
    <div
      ref={shouldUseIntersectionLazy ? intersectionRef : undefined}
      className={cn(
        'relative overflow-hidden',
        fill && 'absolute inset-0',
        !fill && width && height && '',
        containerClassName
      )}
      style={
        !fill && width && height
          ? { width, height, aspectRatio: width / height }
          : undefined
      }
    >
      {/* Loading State */}
      {!isLoaded && !hasError && renderLoadingState()}

      {/* Error State */}
      {hasError && renderErrorState()}

      {/* Actual Image */}
      {shouldRender && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          loading={effectiveLoading}
          placeholder={nextPlaceholder}
          blurDataURL={generatedBlurDataURL}
          sizes={sizes}
          quality={quality}
          className={cn(
            'transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          style={{
            objectPosition,
          }}
          onLoad={handleLoad}
          onError={handleError}
          lazyBoundary={lazyBoundary}
          lazyRoot={lazyRoot}
        />
      )}
    </div>
  );
};

// ============================================================================
// Avatar Image Component
// ============================================================================

interface OptimizedAvatarProps extends Omit<OptimizedImageProps, 'width' | 'height'> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  fallbackName?: string;
  showFallback?: boolean;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  size = 'md',
  fallbackName,
  showFallback = true,
  className,
  containerClassName,
  ...props
}) => {
  const dimension = typeof size === 'number' ? size : sizeMap[size];

  const avatarFallback = useMemo(() => {
    if (!showFallback) return null;
    const initials = fallbackName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium rounded-full',
          className
        )}
        style={{ width: dimension, height: dimension, fontSize: dimension * 0.35 }}
      >
        {initials}
      </div>
    );
  }, [fallbackName, showFallback, dimension, className]);

  return (
    <OptimizedImage
      {...props}
      width={dimension}
      height={dimension}
      className={cn('rounded-full', className)}
      containerClassName={cn('rounded-full', containerClassName)}
      fallback={avatarFallback}
      errorFallback={avatarFallback}
    />
  );
};

// ============================================================================
// Background Image Component
// ============================================================================

interface OptimizedBackgroundProps {
  src: string;
  alt: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
  useParallax?: boolean;
  parallaxSpeed?: number;
  lazyBoundary?: string;
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  src,
  alt,
  children,
  className,
  overlayClassName,
  priority = false,
  useParallax = false,
  parallaxSpeed = 0.5,
  lazyBoundary = '400px',
}) => {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        lazyBoundary={lazyBoundary}
        className={cn(
          useParallax && 'scale-110',
          'transition-transform duration-700'
        )}
        objectFit="cover"
      />
      {overlayClassName && (
        <div className={cn('absolute inset-0', overlayClassName)} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// ============================================================================
// Gallery Image Component
// ============================================================================

interface OptimizedGalleryImageProps extends Omit<OptimizedImageProps, 'fill'> {
  aspectRatio?: string;
  hoverEffect?: 'zoom' | 'fade' | 'none';
}

export const OptimizedGalleryImage: React.FC<OptimizedGalleryImageProps> = ({
  aspectRatio = '16/9',
  hoverEffect = 'zoom',
  className,
  containerClassName,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden group cursor-pointer',
        containerClassName
      )}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        {...props}
        fill
        className={cn(
          hoverEffect === 'zoom' && 'transition-transform duration-500 group-hover:scale-110',
          hoverEffect === 'fade' && 'transition-opacity duration-300 group-hover:opacity-80',
          className
        )}
        objectFit="cover"
      />
    </div>
  );
};

export default OptimizedImage;
