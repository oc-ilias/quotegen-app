/**
 * Comprehensive Loading Components
 * Multiple variants for different loading scenarios
 * @module components/ui/Loading
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type LoadingVariant = 
  | 'spinner' 
  | 'dots' 
  | 'bars' 
  | 'pulse' 
  | 'skeleton' 
  | 'shimmer'
  | 'progress';

export type LoadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export interface SkeletonProps {
  className?: string;
  count?: number;
  circle?: boolean;
  width?: string | number;
  height?: string | number;
}

// ============================================================================
// Size Configurations
// ============================================================================

const sizeConfig: Record<LoadingSize, { spinner: string; dot: string; bar: string }> = {
  xs: { spinner: 'w-3 h-3', dot: 'w-1 h-1', bar: 'w-4 h-1' },
  sm: { spinner: 'w-4 h-4', dot: 'w-1.5 h-1.5', bar: 'w-6 h-1.5' },
  md: { spinner: 'w-6 h-6', dot: 'w-2 h-2', bar: 'w-8 h-2' },
  lg: { spinner: 'w-8 h-8', dot: 'w-2.5 h-2.5', bar: 'w-10 h-2.5' },
  xl: { spinner: 'w-12 h-12', dot: 'w-3 h-3', bar: 'w-12 h-3' },
};

// ============================================================================
// Spinner Component
// ============================================================================

export function Spinner({ 
  size = 'md', 
  className 
}: { size?: LoadingSize; className?: string }) {
  const sizeClass = sizeConfig[size].spinner;

  return (
    <motion.div
      className={cn(
        'relative inline-flex items-center justify-center',
        sizeClass,
        className
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <motion.path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );
}

// ============================================================================
// Dots Component
// ============================================================================

export function Dots({ 
  size = 'md', 
  className 
}: { size?: LoadingSize; className?: string }) {
  const dotSize = sizeConfig[size].dot;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full bg-current',
            dotSize
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Bars Component
// ============================================================================

export function Bars({ 
  size = 'md', 
  className 
}: { size?: LoadingSize; className?: string }) {
  const barSize = sizeConfig[size].bar;

  return (
    <div className={cn('flex items-end gap-0.5', className)}>
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-sm bg-current',
            barSize
          )}
          animate={{
            height: ['20%', '100%', '20%'],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Pulse Component
// ============================================================================

export function Pulse({ 
  size = 'md', 
  className 
}: { size?: LoadingSize; className?: string }) {
  const sizeClass = sizeConfig[size].spinner;

  return (
    <motion.div
      className={cn(
        'rounded-full bg-current',
        sizeClass,
        className
      )}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// ============================================================================
// Skeleton Component
// ============================================================================

export function Skeleton({
  className,
  count = 1,
  circle = false,
  width,
  height,
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-slate-800 animate-pulse',
    circle ? 'rounded-full' : 'rounded-md',
    className
  );

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={baseClasses}
          style={style}
        />
      ))}
    </div>
  );
}

// ============================================================================
// Shimmer Skeleton Component
// ============================================================================

export function ShimmerSkeleton({
  className,
  count = 1,
  circle = false,
  width,
  height,
}: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'relative overflow-hidden bg-slate-800',
            circle ? 'rounded-full' : 'rounded-md',
            className
          )}
          style={{ width, height }}
        >
          <motion.div
            className="absolute inset-0 -translate-x-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
            }}
            animate={{ x: ['100%', '200%'] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.5,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Card Skeleton Component
// ============================================================================

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-800 p-6"
        >
          <div className="flex items-start gap-4">
            <ShimmerSkeleton circle width={48} height={48} />
            <div className="flex-1 space-y-3">
              <ShimmerSkeleton width="60%" height={20} />
              <ShimmerSkeleton width="40%" height={16} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <ShimmerSkeleton width="100%" height={12} />
            <ShimmerSkeleton width="80%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Table Skeleton Component
// ============================================================================

export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-slate-900/50 rounded-lg">
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerSkeleton 
            key={`header-${i}`}
            className="flex-1" 
            height={20} 
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 p-4">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <ShimmerSkeleton 
              key={`cell-${rowIdx}-${colIdx}`}
              className="flex-1" 
              height={16} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Full Screen Loader Component
// ============================================================================

export function FullScreenLoader({ 
  text = 'Loading...',
  className 
}: { 
  text?: string; 
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-slate-950/90 backdrop-blur-sm',
        className
      )}
    >
      <Spinner size="xl" className="text-indigo-500" />
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-slate-400 font-medium"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}

// ============================================================================
// Overlay Loader Component
// ============================================================================

export function OverlayLoader({ 
  text,
  className 
}: { 
  text?: string; 
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'absolute inset-0 z-40 flex flex-col items-center justify-center',
        'bg-slate-950/60 backdrop-blur-sm rounded-lg',
        className
      )}
    >
      <Spinner size="lg" className="text-indigo-500" />
      {text && (
        <p className="mt-3 text-sm text-slate-400">{text}</p>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Loading Component
// ============================================================================

export function Loading({
  variant = 'spinner',
  size = 'md',
  className,
  text,
  fullScreen = false,
  overlay = false,
}: LoadingProps) {
  if (fullScreen) {
    return <FullScreenLoader text={text} className={className} />;
  }

  if (overlay) {
    return <OverlayLoader text={text} className={className} />;
  }

  const Component = {
    spinner: Spinner,
    dots: Dots,
    bars: Bars,
    pulse: Pulse,
    skeleton: Skeleton,
    shimmer: ShimmerSkeleton,
    progress: Spinner, // fallback to spinner for progress
  }[variant];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <Component size={size} />
      {text && <span className="text-sm text-slate-400">{text}</span>}
    </div>
  );
}

export default Loading;
