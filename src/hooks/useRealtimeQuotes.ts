/**
 * Real-time Quote Updates Hook
 * WebSocket integration for live quote status updates
 * @module hooks/useRealtimeQuotes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Quote, QuoteStatus } from '@/types/quote';

interface QuoteUpdate {
  type: 'status_change' | 'viewed' | 'comment' | 'activity';
  quoteId: string;
  data: Partial<Quote> | { message: string; user?: string };
  timestamp: Date;
}

interface UseRealtimeQuotesOptions {
  quoteId?: string;
  onUpdate?: (update: QuoteUpdate) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

interface UseRealtimeQuotesReturn {
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate: QuoteUpdate | null;
  error: Error | null;
  reconnect: () => void;
  sendUpdate: (update: Partial<QuoteUpdate>) => void;
}

export function useRealtimeQuotes(options: UseRealtimeQuotesOptions = {}): UseRealtimeQuotesReturn {
  const { quoteId, onUpdate, onConnect, onDisconnect, onError } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<QuoteUpdate | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Don't connect if already connecting or connected
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `wss://${window.location.host}/api/ws`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        
        // Subscribe to specific quote if provided
        if (quoteId) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            channel: `quote:${quoteId}`,
          }));
        }
        
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const update: QuoteUpdate = JSON.parse(event.data);
          setLastUpdate(update);
          onUpdate?.(update);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY * reconnectAttemptsRef.current);
        }
      };

      ws.onerror = (err) => {
        const error = new Error('WebSocket connection error');
        setError(error);
        setIsConnecting(false);
        onError?.(error);
      };

      wsRef.current = ws;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      setError(error);
      setIsConnecting(false);
      onError?.(error);
    }
  }, [quoteId, isConnecting, isConnected, onConnect, onDisconnect, onError, onUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect, disconnect]);

  const sendUpdate = useCallback((update: Partial<QuoteUpdate>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(update));
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    lastUpdate,
    error,
    reconnect,
    sendUpdate,
  };
}

/**
 * Hook for tracking quote view events
 */
export function useQuoteViewTracking(quoteId: string) {
  const [viewCount, setViewCount] = useState(0);
  const [lastViewedAt, setLastViewedAt] = useState<Date | null>(null);
  const [viewers, setViewers] = useState<Array<{ ip: string; userAgent: string; timestamp: Date }>>([]);

  const { isConnected, sendUpdate } = useRealtimeQuotes({
    quoteId,
    onUpdate: (update) => {
      if (update.type === 'viewed') {
        setViewCount(prev => prev + 1);
        setLastViewedAt(new Date());
        
        if (update.data && typeof update.data === 'object' && 'ip' in update.data) {
          setViewers(prev => [...prev, {
            ip: update.data.ip as string,
            userAgent: update.data.userAgent as string,
            timestamp: new Date(),
          }]);
        }
      }
    },
  });

  const trackView = useCallback((metadata?: { ip?: string; userAgent?: string }) => {
    sendUpdate({
      type: 'viewed',
      quoteId,
      data: {
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    });
  }, [quoteId, sendUpdate]);

  return {
    viewCount,
    lastViewedAt,
    viewers,
    isConnected,
    trackView,
  };
}

/**
 * Hook for quote collaboration (multiple users editing)
 */
export function useQuoteCollaboration(quoteId: string) {
  const [activeEditors, setActiveEditors] = useState<Array<{ id: string; name: string; avatar?: string; since: Date }>>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<{ id: string; name: string } | null>(null);

  const { isConnected, sendUpdate } = useRealtimeQuotes({
    quoteId,
    onUpdate: (update) => {
      switch (update.type) {
        case 'activity':
          if (update.data && typeof update.data === 'object') {
            const data = update.data as { userId?: string; userName?: string; action?: string };
            
            if (data.action === 'join') {
              setActiveEditors(prev => {
                if (prev.some(e => e.id === data.userId)) return prev;
                return [...prev, {
                  id: data.userId || '',
                  name: data.userName || 'Unknown',
                  since: new Date(),
                }];
              });
            } else if (data.action === 'leave') {
              setActiveEditors(prev => prev.filter(e => e.id !== data.userId));
            } else if (data.action === 'lock') {
              setIsLocked(true);
              setLockedBy({ id: data.userId || '', name: data.userName || 'Unknown' });
            } else if (data.action === 'unlock') {
              setIsLocked(false);
              setLockedBy(null);
            }
          }
          break;
      }
    },
  });

  const joinEditing = useCallback((userId: string, userName: string) => {
    sendUpdate({
      type: 'activity',
      quoteId,
      data: {
        action: 'join',
        userId,
        userName,
        timestamp: new Date().toISOString(),
      },
    });
  }, [quoteId, sendUpdate]);

  const leaveEditing = useCallback((userId: string, userName: string) => {
    sendUpdate({
      type: 'activity',
      quoteId,
      data: {
        action: 'leave',
        userId,
        userName,
        timestamp: new Date().toISOString(),
      },
    });
  }, [quoteId, sendUpdate]);

  const lockQuote = useCallback((userId: string, userName: string) => {
    sendUpdate({
      type: 'activity',
      quoteId,
      data: {
        action: 'lock',
        userId,
        userName,
        timestamp: new Date().toISOString(),
      },
    });
  }, [quoteId, sendUpdate]);

  const unlockQuote = useCallback((userId: string, userName: string) => {
    sendUpdate({
      type: 'activity',
      quoteId,
      data: {
        action: 'unlock',
        userId,
        userName,
        timestamp: new Date().toISOString(),
      },
    });
  }, [quoteId, sendUpdate]);

  return {
    activeEditors,
    isLocked,
    lockedBy,
    isConnected,
    joinEditing,
    leaveEditing,
    lockQuote,
    unlockQuote,
  };
}

export default useRealtimeQuotes;
