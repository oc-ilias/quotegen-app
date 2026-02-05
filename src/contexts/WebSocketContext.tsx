/**
 * WebSocket Context
 * Provides WebSocket connection management with auto-reconnect
 * @module contexts/WebSocketContext
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WebSocketState,
  WebSocketClientMessage,
  WebSocketServerMessage,
  WebSocketClientEvent,
  WebSocketServerEvent,
  WebSocketContextValue,
  WebSocketConfig,
  DEFAULT_WEBSOCKET_CONFIG,
  PongEvent,
} from '@/types/websocket';
import { cn } from '@/lib/utils';

// ============================================================================
// Context
// ============================================================================

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// ============================================================================
// Hook
// ============================================================================

export function useWebSocket(): WebSocketContextValue {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}

export function useWebSocketState(): { isConnected: boolean; state: WebSocketState } {
  const context = useContext(WebSocketContext);
  if (!context) {
    return { isConnected: false, state: WebSocketState.DISCONNECTED };
  }
  return { isConnected: context.isConnected, state: context.state };
}

// ============================================================================
// Provider Props
// ============================================================================

interface WebSocketProviderProps {
  children: React.ReactNode;
  config?: Partial<WebSocketConfig>;
  autoConnect?: boolean;
  authToken?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: WebSocketServerMessage) => void;
}

// ============================================================================
// Connection Status Indicator Component
// ============================================================================

interface ConnectionStatusProps {
  state: WebSocketState;
  latency?: number | null;
  className?: string;
  showLabel?: boolean;
}

export function ConnectionStatus({
  state,
  latency,
  className,
  showLabel = true,
}: ConnectionStatusProps) {
  const statusConfig = useMemo(() => {
    switch (state) {
      case WebSocketState.CONNECTED:
        return {
          color: 'bg-emerald-500',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/20',
          textColor: 'text-emerald-400',
          label: 'Connected',
          pulse: false,
        };
      case WebSocketState.CONNECTING:
        return {
          color: 'bg-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          textColor: 'text-amber-400',
          label: 'Connecting...',
          pulse: true,
        };
      case WebSocketState.RECONNECTING:
        return {
          color: 'bg-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          textColor: 'text-blue-400',
          label: 'Reconnecting...',
          pulse: true,
        };
      case WebSocketState.ERROR:
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          textColor: 'text-red-400',
          label: 'Connection Error',
          pulse: false,
        };
      default:
        return {
          color: 'bg-slate-500',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20',
          textColor: 'text-slate-400',
          label: 'Disconnected',
          pulse: false,
        };
    }
  }, [state]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium',
        statusConfig.bgColor,
        statusConfig.borderColor,
        statusConfig.textColor,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {statusConfig.pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              statusConfig.color
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            statusConfig.color,
            state === WebSocketState.DISCONNECTED && 'opacity-50'
          )}
        />
      </span>
      
      {showLabel && (
        <span className="flex items-center gap-1.5">
          {statusConfig.label}
          {latency !== null && latency !== undefined && state === WebSocketState.CONNECTED && (
            <span className="text-slate-500">({latency}ms)</span>
          )}
        </span>
      )}
    </motion.div>
  );
}

// ============================================================================
// Provider Component
// ============================================================================

export function WebSocketProvider({
  children,
  config: userConfig,
  autoConnect = true,
  authToken,
  onConnect,
  onDisconnect,
  onError,
  onMessage,
}: WebSocketProviderProps) {
  const config = useMemo(() => ({ ...DEFAULT_WEBSOCKET_CONFIG, ...userConfig }), [userConfig]);
  
  const [state, setState] = useState<WebSocketState>(WebSocketState.DISCONNECTED);
  const [error, setError] = useState<Error | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketServerMessage | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pongTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<WebSocketClientMessage[]>([]);
  const subscribedChannelsRef = useRef<Set<string>>(new Set());
  const lastPingTimeRef = useRef<number>(0);
  const isConnectingRef = useRef(false);

  const isConnected = state === WebSocketState.CONNECTED;
  const isReconnecting = state === WebSocketState.RECONNECTING;

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      config.reconnectInterval! * Math.pow(config.reconnectDecay!, connectionAttempts),
      config.maxReconnectInterval!
    );
    return delay;
  }, [config, connectionAttempts]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (isConnectingRef.current || socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnectingRef.current = true;
    setState(WebSocketState.CONNECTING);
    setError(null);

    try {
      const ws = new WebSocket(config.url);
      socketRef.current = ws;

      ws.onopen = () => {
        isConnectingRef.current = false;
        setState(WebSocketState.CONNECTED);
        setConnectionAttempts(0);
        setError(null);

        // Authenticate if token provided
        if (authToken) {
          sendMessage({
            type: WebSocketClientEvent.AUTHENTICATE,
            token: authToken,
          });
        }

        // Resubscribe to channels
        subscribedChannelsRef.current.forEach((channel) => {
          sendMessage({
            type: WebSocketClientEvent.SUBSCRIBE,
            channel,
          });
        });

        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          if (message) {
            sendMessage(message);
          }
        }

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            lastPingTimeRef.current = Date.now();
            sendMessage({
              type: WebSocketClientEvent.PING,
              timestamp: lastPingTimeRef.current,
            });

            // Set pong timeout
            pongTimeoutRef.current = setTimeout(() => {
              ws.close();
              setError(new Error('Pong timeout - connection may be stale'));
            }, config.pongTimeout);
          }
        }, config.pingInterval);

        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketServerMessage = JSON.parse(event.data);
          setLastMessage(message);

          // Handle pong
          if (message.type === WebSocketServerEvent.PONG) {
            const pongMessage = message as PongEvent;
            const roundTripTime = Date.now() - pongMessage.timestamp;
            setLatency(roundTripTime);

            // Clear pong timeout
            if (pongTimeoutRef.current) {
              clearTimeout(pongTimeoutRef.current);
              pongTimeoutRef.current = null;
            }
          }

          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        isConnectingRef.current = false;
        socketRef.current = null;
        clearTimers();
        setState(WebSocketState.DISCONNECTED);
        setLatency(null);
        onDisconnect?.();

        // Attempt reconnection if not closed cleanly and within max attempts
        if (!event.wasClean && connectionAttempts < config.maxReconnectAttempts!) {
          setState(WebSocketState.RECONNECTING);
          const delay = getReconnectDelay();
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts((prev) => prev + 1);
            connect();
          }, delay);
        }
      };

      ws.onerror = (event) => {
        isConnectingRef.current = false;
        const err = new Error('WebSocket connection error');
        setError(err);
        setState(WebSocketState.ERROR);
        onError?.(err);
      };
    } catch (err) {
      isConnectingRef.current = false;
      const error = err instanceof Error ? err : new Error('Failed to create WebSocket connection');
      setError(error);
      setState(WebSocketState.ERROR);
      onError?.(error);
    }
  }, [config, authToken, connectionAttempts, getReconnectDelay, onConnect, onDisconnect, onError, onMessage, clearTimers]);

  // Send message
  const sendMessage = useCallback((message: WebSocketClientMessage): boolean => {
    const ws = socketRef.current;
    
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('Failed to send WebSocket message:', err);
        return false;
      }
    }

    // Queue message if offline queue is enabled
    if (config.enableOfflineQueue && messageQueueRef.current.length < config.messageQueueSize!) {
      messageQueueRef.current.push(message);
    }

    return false;
  }, [config]);

  // Subscribe to channel
  const subscribe = useCallback((channel: string) => {
    subscribedChannelsRef.current.add(channel);
    
    if (isConnected) {
      sendMessage({
        type: WebSocketClientEvent.SUBSCRIBE,
        channel,
      });
    }
  }, [isConnected, sendMessage]);

  // Unsubscribe from channel
  const unsubscribe = useCallback((channel: string) => {
    subscribedChannelsRef.current.delete(channel);
    
    if (isConnected) {
      sendMessage({
        type: WebSocketClientEvent.UNSUBSCRIBE,
        channel,
      });
    }
  }, [isConnected, sendMessage]);

  // Reconnect manually
  const reconnect = useCallback(() => {
    clearTimers();
    socketRef.current?.close();
    setConnectionAttempts(0);
    connect();
  }, [clearTimers, connect]);

  // Disconnect manually
  const disconnect = useCallback(() => {
    clearTimers();
    socketRef.current?.close(1000, 'Manual disconnect');
    socketRef.current = null;
    setState(WebSocketState.DISCONNECTED);
    setConnectionAttempts(0);
  }, [clearTimers]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      clearTimers();
      socketRef.current?.close(1000, 'Component unmounted');
    };
  }, [autoConnect, connect, clearTimers]);

  // Context value
  const value = useMemo(
    () => ({
      state,
      isConnected,
      isReconnecting,
      error,
      lastMessage,
      sendMessage,
      subscribe,
      unsubscribe,
      reconnect,
      disconnect,
      connectionAttempts,
      latency,
    }),
    [state, isConnected, isReconnecting, error, lastMessage, sendMessage, subscribe, unsubscribe, reconnect, disconnect, connectionAttempts, latency]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketProvider;
