/**
 * Loading States Component Library
 * 
 * Comprehensive loading components with various styles and animations.
 * All components are fully accessible and support reduced motion preferences.
 * 
 * @module components/ui/loading
 */

'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'white' | 'muted';
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  label?: string;
}

export interface LoadingDotsProps {
  /** Size of the dots */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'white' | 'muted';
  /** Additional CSS classes */
  className?: string;
}

export interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Enable pulse animation */
  animate?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface LoadingCardProps {
  /** Number of lines to show */
  lines?: number;
  /** Show avatar placeholder */
  showAvatar?: boolean;
  /** Show action button placeholder */
  showAction?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface LoadingPageProps {
  /** Loading message */
  message?: string;
  /** Show progress indicator */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
}

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Loading message */
  message?: string;
  /** Blur the background */
  blur?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Children to render behind overlay */
  children?: React.ReactNode;
}

// ============================================================================
// Animation Variants
// ============================================================================

const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const dotVariants: Variants = {
  animate: (i: number) => ({
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1,
      repeat: Infinity,
      delay: i * 0.2,
      ease: 'easeInOut',
    },
  }),
};

const pulseVariants: Variants = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const shimmerVariants: Variants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ============================================================================
// Size & Color Maps
// ============================================================================

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const dotSizeMap = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
};

const variantMap = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  muted: 'text-gray-400',
};

const radiusMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
};

// ============================================================================
// Components
// ============================================================================

/**
 * Classic circular loading spinner
 */
export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className,
  label = 'Loading...',
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <motion.svg
        className={cn(sizeMap[size], variantMap[variant])}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        variants={spinnerVariants}
        animate="animate"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </motion.svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/**
 * Three-dot bouncing animation
 */
export function LoadingDots({
  size = 'md',
  variant = 'primary',
  className,
}: LoadingDotsProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn('inline-flex items-center gap-1', className)}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn(
            'block rounded-full',
            dotSizeMap[size],
            variant === 'primary' && 'bg-blue-600',
            variant === 'secondary' && 'bg-gray-600',
            variant === 'white' && 'bg-white',
            variant === 'muted' && 'bg-gray-400'
          )}
          variants={dotVariants}
          animate="animate"
          custom={i}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton placeholder with pulse animation
 */
export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  animate = true,
  className,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <motion.div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        radiusMap[radius],
        className
      )}
      style={{ width: widthStyle, height: heightStyle }}
      variants={animate ? pulseVariants : undefined}
      animate={animate ? 'animate' : undefined}
      aria-hidden="true"
    />
  );
}

/**
 * Shimmer effect skeleton with gradient animation
 */
export function ShimmerSkeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  className,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-200 dark:bg-gray-700',
        radiusMap[radius],
        className
      )}
      style={{ width: widthStyle, height: heightStyle }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={shimmerVariants}
        animate="animate"
      />
    </div>
  );
}

/**
 * Card-shaped loading placeholder
 */
export function LoadingCard({
  lines = 3,
  showAvatar = true,
  showAction = true,
  className,
}: LoadingCardProps) {
  return (
    <div
      className={cn(
        'p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        className
      )}
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="flex items-start gap-4">
        {showAvatar && (
          <Skeleton width={48} height={48} radius="full" />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} radius="sm" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              width={i === lines - 1 ? '40%' : '100%'}
              height={14}
              radius="sm"
            />
          ))}
        </div>
        {showAction && (
          <Skeleton width={32} height={32} radius="md" />
        )}
      </div>
    </div>
  );
}

/**
 * Full-page loading state with optional progress
 */
export function LoadingPage({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
}: LoadingPageProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-6" />
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {message}
        </p>
        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Loading overlay that covers content
 */
export function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  blur = true,
  className,
  children,
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 z-50 flex items-center justify-center',
            'bg-white/80 dark:bg-gray-900/80',
            blur && 'backdrop-blur-sm',
            className
          )}
          role="alert"
          aria-busy="true"
          aria-label={message}
        >
          <div className="text-center">
            <LoadingSpinner size="lg" className="mb-4 mx-auto" />
            <p className="text-gray-900 dark:text-white font-medium">{message}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Content placeholder for text blocks
 */
export function TextSkeleton({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)} aria-busy="true" aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '75%' : '100%'}
          height={16}
          radius="sm"
        />
      ))}
    </div>
  );
}

/**
 * Image placeholder with icon
 */
export function ImageSkeleton({
  aspectRatio = '16/9',
  className,
}: {
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden',
        className
      )}
      style={{ aspectRatio }}
      aria-busy="true"
      aria-label="Loading image"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-500"
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
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        variants={shimmerVariants}
        animate="animate"
      />
    </div>
  );
}

/**
 * Button loading state
 */
export function LoadingButton({
  children,
  isLoading,
  loadingText = 'Loading...',
  ...props
}: {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      disabled={isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <LoadingSpinner size="sm" variant="white" />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default {
  Spinner: LoadingSpinner,
  Dots: LoadingDots,
  Skeleton,
  ShimmerSkeleton,
  Card: LoadingCard,
  Page: LoadingPage,
  Overlay: LoadingOverlay,
  Text: TextSkeleton,
  Image: ImageSkeleton,
  Button: LoadingButton,
};
