/**
 * Virtual List Component
 * Efficiently renders large lists by only mounting visible items
 * @module components/VirtualList
 */

'use client';

import { useRef, useState, useEffect, useCallback, useMemo, memo, ReactNode } from 'react';
import { useIntersectionObserver } from '@/hooks/usePerformance';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// Types
// ============================================================================

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T, index: number) => string;
  itemHeight: number | ((item: T, index: number) => number);
  containerHeight: number | string;
  overscan?: number;
  className?: string;
  itemClassName?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyMessage?: string;
  loading?: boolean;
  LoadingComponent?: ReactNode;
}

interface VirtualItem {
  index: number;
  style: React.CSSProperties;
  key: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getItemHeight<T>(
  item: T,
  index: number,
  itemHeight: number | ((item: T, index: number) => number)
): number {
  return typeof itemHeight === 'function' ? itemHeight(item, index) : itemHeight;
}

// ============================================================================
// Virtual List Component
// ============================================================================

export function VirtualList<T>({
  items,
  renderItem,
  getItemKey,
  itemHeight,
  containerHeight,
  overscan = 5,
  className,
  itemClassName,
  onEndReached,
  endReachedThreshold = 200,
  emptyMessage = 'No items to display',
  loading = false,
  LoadingComponent,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightValue, setContainerHeightValue] = useState(0);

  // Calculate total height and item positions
  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let currentPosition = 0;

    items.forEach((item, index) => {
      positions.push(currentPosition);
      currentPosition += getItemHeight(item, index, itemHeight);
    });

    return { totalHeight: currentPosition, itemPositions: positions };
  }, [items, itemHeight]);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const containerH = typeof containerHeight === 'number' 
      ? containerHeight 
      : containerHeightValue;
    
    if (containerH === 0) return { startIndex: 0, endIndex: 0 };

    // Find start index (first visible item)
    let start = 0;
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i] + getItemHeight(items[i], i, itemHeight) > scrollTop) {
        start = i;
        break;
      }
    }

    // Find end index (last visible item)
    let end = items.length - 1;
    for (let i = start; i < itemPositions.length; i++) {
      if (itemPositions[i] > scrollTop + containerH) {
        end = i - 1;
        break;
      }
    }

    // Apply overscan
    start = Math.max(0, start - overscan);
    end = Math.min(items.length - 1, end + overscan);

    return { startIndex: start, endIndex: end };
  }, [items, itemPositions, scrollTop, containerHeight, containerHeightValue, overscan, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Check if we've reached the end
    if (onEndReached) {
      const containerH = typeof containerHeight === 'number' 
        ? containerHeight 
        : containerHeightValue;
      const scrollBottom = newScrollTop + containerH;
      const distanceFromBottom = totalHeight - scrollBottom;

      if (distanceFromBottom < endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold, totalHeight, containerHeight, containerHeightValue]);

  // Measure container height if using percentage/flex
  useEffect(() => {
    if (typeof containerHeight === 'string' && containerRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeightValue(entry.contentRect.height);
        }
      });

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [containerHeight]);

  // Generate visible items
  const visibleItems = useMemo(() => {
    const result: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        style: {
          position: 'absolute',
          top: itemPositions[i],
          left: 0,
          right: 0,
          height: getItemHeight(items[i], i, itemHeight),
        },
        key: getItemKey(items[i], i),
      });
    }
    return result;
  }, [startIndex, endIndex, itemPositions, items, getItemKey, itemHeight]);

  if (items.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto relative', className)}
      style={{
        height: typeof containerHeight === 'number' ? containerHeight : '100%',
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={virtualItem.style}
            className={cn('absolute inset-x-0', itemClassName)}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
      
      {loading && LoadingComponent}
    </div>
  );
}

// ============================================================================
// Window Virtual List (uses window scroll)
// ============================================================================

interface WindowVirtualListProps<T> extends Omit<VirtualListProps<T>, 'containerHeight'> {
  containerClassName?: string;
}

export function WindowVirtualList<T>({
  items,
  renderItem,
  getItemKey,
  itemHeight,
  overscan = 5,
  className,
  itemClassName,
  onEndReached,
  endReachedThreshold = 200,
  emptyMessage = 'No items to display',
  loading = false,
  LoadingComponent,
  containerClassName,
}: WindowVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerTop, setContainerTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  // Track window scroll and resize
  useEffect(() => {
    const updateMetrics = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerTop(rect.top + window.scrollY);
      }
      setWindowHeight(window.innerHeight);
      setScrollTop(window.scrollY);
    };

    updateMetrics();
    window.addEventListener('scroll', () => setScrollTop(window.scrollY), { passive: true });
    window.addEventListener('resize', updateMetrics);

    return () => {
      window.removeEventListener('scroll', () => setScrollTop(window.scrollY));
      window.removeEventListener('resize', updateMetrics);
    };
  }, []);

  // Calculate total height and item positions
  const { totalHeight, itemPositions } = useMemo(() => {
    const positions: number[] = [];
    let currentPosition = 0;

    items.forEach((item, index) => {
      positions.push(currentPosition);
      currentPosition += getItemHeight(item, index, itemHeight);
    });

    return { totalHeight: currentPosition, itemPositions: positions };
  }, [items, itemHeight]);

  // Calculate visible range
  const { startIndex, endIndex } = useMemo(() => {
    const relativeScrollTop = Math.max(0, scrollTop - containerTop);
    
    // Find start index
    let start = 0;
    for (let i = 0; i < itemPositions.length; i++) {
      if (itemPositions[i] + getItemHeight(items[i], i, itemHeight) > relativeScrollTop) {
        start = i;
        break;
      }
    }

    // Find end index
    let end = items.length - 1;
    for (let i = start; i < itemPositions.length; i++) {
      if (itemPositions[i] > relativeScrollTop + windowHeight) {
        end = i - 1;
        break;
      }
    }

    // Apply overscan
    start = Math.max(0, start - overscan);
    end = Math.min(items.length - 1, end + overscan);

    return { startIndex: start, endIndex: end };
  }, [items, itemPositions, scrollTop, containerTop, windowHeight, overscan, itemHeight]);

  // Check for end reached
  useEffect(() => {
    if (onEndReached) {
      const relativeScrollTop = Math.max(0, scrollTop - containerTop);
      const scrollBottom = relativeScrollTop + windowHeight;
      const distanceFromBottom = totalHeight - scrollBottom;

      if (distanceFromBottom < endReachedThreshold) {
        onEndReached();
      }
    }
  }, [scrollTop, containerTop, windowHeight, totalHeight, endReachedThreshold, onEndReached]);

  // Generate visible items
  const visibleItems = useMemo(() => {
    const result: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({
        index: i,
        style: {
          position: 'absolute',
          top: itemPositions[i],
          left: 0,
          right: 0,
          height: getItemHeight(items[i], i, itemHeight),
        },
        key: getItemKey(items[i], i),
      });
    }
    return result;
  }, [startIndex, endIndex, itemPositions, items, getItemKey, itemHeight]);

  if (items.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', containerClassName)}
      style={{ height: totalHeight }}
    >
      {visibleItems.map((virtualItem) => (
        <div
          key={virtualItem.key}
          style={virtualItem.style}
          className={cn('absolute inset-x-0', itemClassName)}
        >
          {renderItem(items[virtualItem.index], virtualItem.index)}
        </div>
      ))}
      {loading && LoadingComponent}
    </div>
  );
}

// ============================================================================
// Optimized Quote List (specific implementation for QuoteGen)
// ============================================================================

import { Quote } from '@/types/quote';

interface OptimizedQuoteListProps {
  quotes: Quote[];
  onQuoteClick?: (quote: Quote) => void;
  onEndReached?: () => void;
  loading?: boolean;
  containerHeight?: number | string;
}

const QuoteListItem = memo(function QuoteListItem({
  quote,
  onClick,
}: {
  quote: Quote;
  onClick?: (quote: Quote) => void;
}) {
  return (
    <div
      onClick={() => onClick?.(quote)}
      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{quote.title}</h4>
          <p className="text-sm text-gray-500">{quote.customer?.companyName || quote.customerId}</p>
        </div>
        <span
          className={cn(
            'px-2 py-1 text-xs rounded-full',
            quote.status === 'accepted' && 'bg-green-100 text-green-800',
            quote.status === 'pending' && 'bg-yellow-100 text-yellow-800',
            quote.status === 'sent' && 'bg-blue-100 text-blue-800',
            quote.status === 'rejected' && 'bg-red-100 text-red-800'
          )}
        >
          {quote.status}
        </span>
      </div>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {new Date(quote.createdAt).toLocaleDateString()}
        </span>
        <span className="font-semibold text-gray-900">
          ${quote.total?.toLocaleString() || '0'}
        </span>
      </div>
    </div>
  );
});

export function OptimizedQuoteList({
  quotes,
  onQuoteClick,
  onEndReached,
  loading,
  containerHeight = 600,
}: OptimizedQuoteListProps) {
  return (
    <VirtualList
      items={quotes}
      itemHeight={100} // Fixed height for quote items
      containerHeight={containerHeight}
      getItemKey={(quote) => quote.id}
      renderItem={(quote) => (
        <QuoteListItem quote={quote} onClick={onQuoteClick} />
      )}
      onEndReached={onEndReached}
      loading={loading}
      LoadingComponent={
        <div className="p-4 text-center">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
      className="border rounded-lg"
    />
  );
}

export default {
  VirtualList,
  WindowVirtualList,
  OptimizedQuoteList,
};
