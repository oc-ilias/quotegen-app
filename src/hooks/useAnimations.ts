/**
 * Animation Hooks and Utilities
 * Scroll animations, page transitions, and motion effects
 * @module hooks/useAnimations
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView, type UseInViewOptions } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface ScrollAnimationOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export interface StaggerOptions {
  staggerChildren?: number;
  delayChildren?: number;
}

export type AnimationDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

// ============================================================================
// Scroll Animation Hook
// ============================================================================

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '-50px' } = options;
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
    margin: rootMargin,
  });

  return { ref, isInView };
}

// ============================================================================
// Stagger Animation Hook
// ============================================================================

export function useStaggerAnimation(itemCount: number, baseDelay: number = 0.1) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const getItemDelay = useCallback(
    (index: number) => ({
      initial: { opacity: 0, y: 20 },
      animate: isInView
        ? {
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.5,
              delay: baseDelay * index,
              ease: [0.25, 0.46, 0.45, 0.94],
            },
          }
        : { opacity: 0, y: 20 },
    }),
    [isInView, baseDelay]
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: baseDelay,
        delayChildren: 0.1,
      },
    },
  };

  return { containerRef, isInView, getItemDelay, containerVariants };
}

// ============================================================================
// Animated Counter Hook
// ============================================================================

export function useAnimatedCounter(
  end: number,
  duration: number = 2,
  startOnMount: boolean = true
) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number>();

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);
      
      setCount(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, [end, duration]);

  useEffect(() => {
    if (startOnMount) {
      startAnimation();
    }
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [startOnMount, startAnimation]);

  return { count, isAnimating, startAnimation };
}

// ============================================================================
// Page Transition Hook
// ============================================================================

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return {
    isTransitioning,
    startTransition,
    endTransition,
    pageVariants,
  };
}

// ============================================================================
// Parallax Hook
// ============================================================================

export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = scrolled * speed;
      
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

// ============================================================================
// Hover Animation Hook
// ============================================================================

export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  const scaleVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  };

  const liftVariants = {
    initial: { y: 0 },
    hover: { y: -4 },
  };

  const glowVariants = {
    initial: { boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
    hover: { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
  };

  return {
    isHovered,
    hoverProps,
    scaleVariants,
    liftVariants,
    glowVariants,
  };
}

// ============================================================================
// Slide In Animation Variants
// ============================================================================

export function getSlideInVariants(direction: AnimationDirection = 'up') {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    fade: { y: 0, x: 0 },
    scale: { y: 0, x: 0, scale: 0.9 },
  };

  const initial = directions[direction];

  return {
    hidden: {
      opacity: 0,
      ...initial,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };
}

// ============================================================================
// Stagger Container Variants
// ============================================================================

export function getStaggerContainer(options: StaggerOptions = {}) {
  const { staggerChildren = 0.1, delayChildren = 0 } = options;

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

// ============================================================================
// Card Hover Variants
// ============================================================================

export const cardHoverVariants = {
  initial: { 
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  hover: { 
    y: -4,
    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// Fade In Variants
// ============================================================================

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// Scale In Variants
// ============================================================================

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// Spring Configs
// ============================================================================

export const springConfigs = {
  gentle: { type: 'spring', stiffness: 100, damping: 15 },
  bouncy: { type: 'spring', stiffness: 300, damping: 20 },
  stiff: { type: 'spring', stiffness: 400, damping: 25 },
  slow: { type: 'spring', stiffness: 50, damping: 15 },
  wobbly: { type: 'spring', stiffness: 200, damping: 10 },
} as const;

// ============================================================================
// Easing Functions
// ============================================================================

export const easings = {
  easeOut: [0.25, 0.46, 0.45, 0.94],
  easeIn: [0.55, 0.085, 0.68, 0.53],
  easeInOut: [0.645, 0.045, 0.355, 1],
  smooth: [0.43, 0.13, 0.23, 0.96],
  bounce: [0.68, -0.55, 0.265, 1.55],
} as const;

export default {
  useScrollAnimation,
  useStaggerAnimation,
  useAnimatedCounter,
  usePageTransition,
  useParallax,
  useHoverAnimation,
  getSlideInVariants,
  getStaggerContainer,
  cardHoverVariants,
  fadeInVariants,
  scaleInVariants,
  springConfigs,
  easings,
};
