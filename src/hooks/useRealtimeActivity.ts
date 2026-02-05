/**
 * useRealtimeActivity Hook
 * Real-time activity feed with WebSocket integration
 * @module hooks/useRealtimeActivity
 */

'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import {
  WebSocketServerEvent,
  ActivityUpdateEvent,
  WebSocketState,
  ActivityFeedFilters,
  ActivityFeedOptions,
  UseRealtimeActivityReturn,
} from '@/types/websocket';
import { ActivityType } from '@/types/quote';

// ============================================================================
// Default Options
// ============================================================================

const DEFAULT_OPTIONS: Required<ActivityFeedOptions> = {
  pageSize: 20,
  enableSound: false,
  enableAnimations: true,
  autoRefresh: true,
  refreshInterval: 30000,
};

// ============================================================================
// Sound Effect
// ============================================================================

const createNotificationSound = (): HTMLAudioElement | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    return {
      play: () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      },
    } as HTMLAudioElement;
  } catch {
    return null;
  }
};

// ============================================================================
// Mock Activities for Initial Data
// ============================================================================

const MOCK_ACTIVITIES: ActivityUpdateEvent['data'][] = [
  {
    id: '1',
    type: ActivityType.QUOTE_CREATED,
    quoteId: 'q1',
    quoteNumber: 'QT-001',
    customerId: 'c1',
    customerName: 'Acme Corporation',
    userId: 'u1',
    userName: 'John Smith',
    description: 'Created a new quote',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: ActivityType.QUOTE_SENT,
    quoteId: 'q2',
    quoteNumber: 'QT-002',
    customerId: 'c2',
    customerName: 'TechStart Inc',
    userId: 'u1',
    userName: 'John Smith',
    description: 'Sent quote to customer',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: ActivityType.QUOTE_ACCEPTED,
    quoteId: 'q3',
    quoteNumber: 'QT-003',
    customerId: 'c3',
    customerName: 'Global Solutions',
    userId: 'u2',
    userName: 'Jane Doe',
    description: 'Customer accepted the quote',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '4',
    type: ActivityType.CUSTOMER_ADDED,
    customerId: 'c4',
    customerName: 'New Ventures LLC',
    userId: 'u1',
    userName: 'John Smith',
    description: 'Added new customer',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '5',
    type: ActivityType.STATUS_CHANGED,
    quoteId: 'q4',
    quoteNumber: 'QT-004',
    customerId: 'c5',
    customerName: 'Smart Industries',
    userId: 'u2',
    userName: 'Jane Doe',
    description: 'Changed quote status to pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

// ============================================================================
// Hook
// ============================================================================

export function useRealtimeActivity(
  initialFilters: ActivityFeedFilters = {},
  options: ActivityFeedOptions = {}
): UseRealtimeActivityReturn {
  const mergedOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  
  const { 
    isConnected, 
    subscribe, 
    unsubscribe, 
    lastMessage, 
    state: connectionState 
  } = useWebSocket();
  
  const [activities, setActivities] = useState<ActivityUpdateEvent['data'][]>(MOCK_ACTIVITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState<ActivityFeedFilters>(initialFilters);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newActivityCount, setNewActivityCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const readActivityIdsRef = useRef<Set<string>>(new Set());
  const pageRef = useRef(1);
  const soundRef = useRef<HTMLAudioElement | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize sound
  useEffect(() => {
    if (mergedOptions.enableSound && typeof window !== 'undefined') {
      soundRef.current = createNotificationSound();
    }
  }, [mergedOptions.enableSound]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      if (filters.types?.length && !filters.types.includes(activity.type)) {
        return false;
      }
      if (filters.customerId && activity.customerId !== filters.customerId) {
        return false;
      }
      if (filters.quoteId && activity.quoteId !== filters.quoteId) {
        return false;
      }
      if (filters.dateFrom && new Date(activity.timestamp) < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && new Date(activity.timestamp) > filters.dateTo) {
        return false;
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchText = `${activity.customerName} ${activity.description} ${activity.quoteNumber}`.toLowerCase();
        if (!searchText.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activities, filters]);

  // Subscribe to activity updates
  useEffect(() => {
    if (isConnected) {
      subscribe('activities');
      setIsSubscribed(true);
      
      return () => {
        unsubscribe('activities');
        setIsSubscribed(false);
      };
    }
  }, [isConnected, subscribe, unsubscribe]);

  // Handle incoming messages
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === WebSocketServerEvent.ACTIVITY_UPDATE) {
      const activityMessage = lastMessage as ActivityUpdateEvent;
      const newActivity = activityMessage.data;
      
      setActivities((prev) => {
        // Check for duplicates
        if (prev.some((a) => a.id === newActivity.id)) {
          return prev;
        }
        
        // Add new activity at the beginning
        const updated = [newActivity, ...prev];
        
        // Limit total activities to prevent memory bloat
        if (updated.length > 500) {
          updated.pop();
        }
        
        return updated;
      });

      // Increment unread count
      if (!readActivityIdsRef.current.has(newActivity.id)) {
        setUnreadCount((prev) => prev + 1);
        setNewActivityCount((prev) => prev + 1);
      }

      // Play sound if enabled
      if (mergedOptions.enableSound && soundRef.current) {
        soundRef.current.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    }
  }, [lastMessage, mergedOptions.enableSound]);

  // Auto-refresh fallback when WebSocket is disconnected
  useEffect(() => {
    if (mergedOptions.autoRefresh && connectionState === WebSocketState.DISCONNECTED) {
      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, mergedOptions.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [mergedOptions.autoRefresh, mergedOptions.refreshInterval, connectionState]);

  // Load more activities (pagination)
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Generate more mock activities
      const newActivities: ActivityUpdateEvent['data'][] = Array.from({ length: mergedOptions.pageSize }, (_, i) => ({
        id: `mock-${pageRef.current}-${i}`,
        type: Object.values(ActivityType)[Math.floor(Math.random() * Object.values(ActivityType).length)],
        quoteId: `q-${pageRef.current}-${i}`,
        quoteNumber: `QT-${String(pageRef.current * 100 + i).padStart(3, '0')}`,
        customerId: `c-${i}`,
        customerName: `Customer ${pageRef.current * 10 + i}`,
        userId: 'u1',
        userName: 'System User',
        description: 'Historical activity entry',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * (pageRef.current + i)).toISOString(),
      }));

      setActivities((prev) => [...prev, ...newActivities]);
      pageRef.current += 1;
      
      // Limit mock pagination
      if (pageRef.current > 10) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load activities'));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, mergedOptions.pageSize]);

  // Refresh activities
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Reset to initial state with fresh data
      pageRef.current = 1;
      setActivities(MOCK_ACTIVITIES);
      setHasMore(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh activities'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update filters
  const setFilters = useCallback((newFilters: ActivityFeedFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    pageRef.current = 1;
    setHasMore(true);
  }, []);

  // Mark activity as read
  const markAsRead = useCallback((activityId: string) => {
    if (!readActivityIdsRef.current.has(activityId)) {
      readActivityIdsRef.current.add(activityId);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  // Mark all activities as read
  const markAllAsRead = useCallback(() => {
    filteredActivities.forEach((activity) => {
      readActivityIdsRef.current.add(activity.id);
    });
    setUnreadCount(0);
  }, [filteredActivities]);

  // Clear new activity count
  const clearNewActivityCount = useCallback(() => {
    setNewActivityCount(0);
  }, []);

  return {
    activities: filteredActivities,
    isLoading,
    isSubscribed,
    error,
    hasMore,
    loadMore,
    refresh,
    filters,
    setFilters,
    unreadCount,
    markAsRead,
    markAllAsRead,
    connectionState,
    newActivityCount,
    clearNewActivityCount,
  };
}

export default useRealtimeActivity;
