/**
 * WebSocket Types
 * Shared types for WebSocket communication
 * @module types/websocket
 */

import { ActivityType } from './quote';

// ============================================================================
// WebSocket Connection State
// ============================================================================

export enum WebSocketState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

// ============================================================================
// WebSocket Events (Client → Server)
// ============================================================================

export enum WebSocketClientEvent {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  PING = 'ping',
  AUTHENTICATE = 'authenticate',
}

export interface SubscribeEvent {
  type: WebSocketClientEvent.SUBSCRIBE;
  channel: string;
}

export interface UnsubscribeEvent {
  type: WebSocketClientEvent.UNSUBSCRIBE;
  channel: string;
}

export interface PingEvent {
  type: WebSocketClientEvent.PING;
  timestamp: number;
}

export interface AuthenticateEvent {
  type: WebSocketClientEvent.AUTHENTICATE;
  token: string;
}

export type WebSocketClientMessage =
  | SubscribeEvent
  | UnsubscribeEvent
  | PingEvent
  | AuthenticateEvent;

// ============================================================================
// WebSocket Events (Server → Client)
// ============================================================================

export enum WebSocketServerEvent {
  ACTIVITY_UPDATE = 'activity_update',
  QUOTE_STATUS_CHANGE = 'quote_status_change',
  NEW_QUOTE = 'new_quote',
  CUSTOMER_UPDATE = 'customer_update',
  PONG = 'pong',
  AUTH_SUCCESS = 'auth_success',
  AUTH_ERROR = 'auth_error',
  ERROR = 'error',
}

export interface ActivityUpdateEvent {
  type: WebSocketServerEvent.ACTIVITY_UPDATE;
  data: {
    id: string;
    type: ActivityType;
    quoteId?: string;
    quoteNumber?: string;
    customerId?: string;
    customerName?: string;
    userId?: string;
    userName?: string;
    description: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
  };
}

export interface QuoteStatusChangeEvent {
  type: WebSocketServerEvent.QUOTE_STATUS_CHANGE;
  data: {
    quoteId: string;
    quoteNumber: string;
    previousStatus: string;
    newStatus: string;
    customerName: string;
    changedBy?: string;
    timestamp: string;
  };
}

export interface NewQuoteEvent {
  type: WebSocketServerEvent.NEW_QUOTE;
  data: {
    quoteId: string;
    quoteNumber: string;
    customerName: string;
    total: number;
    createdBy: string;
    timestamp: string;
  };
}

export interface CustomerUpdateEvent {
  type: WebSocketServerEvent.CUSTOMER_UPDATE;
  data: {
    customerId: string;
    customerName: string;
    updateType: 'created' | 'updated' | 'deleted';
    changes?: Record<string, unknown>;
    timestamp: string;
  };
}

export interface PongEvent {
  type: WebSocketServerEvent.PONG;
  timestamp: number;
  serverTime: string;
}

export interface AuthSuccessEvent {
  type: WebSocketServerEvent.AUTH_SUCCESS;
  message: string;
  userId: string;
}

export interface AuthErrorEvent {
  type: WebSocketServerEvent.AUTH_ERROR;
  error: string;
  code: string;
}

export interface ErrorEvent {
  type: WebSocketServerEvent.ERROR;
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export type WebSocketServerMessage =
  | ActivityUpdateEvent
  | QuoteStatusChangeEvent
  | NewQuoteEvent
  | CustomerUpdateEvent
  | PongEvent
  | AuthSuccessEvent
  | AuthErrorEvent
  | ErrorEvent;

// ============================================================================
// WebSocket Context Types
// ============================================================================

export interface WebSocketContextValue {
  state: WebSocketState;
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  lastMessage: WebSocketServerMessage | null;
  sendMessage: (message: WebSocketClientMessage) => boolean;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  reconnect: () => void;
  disconnect: () => void;
  connectionAttempts: number;
  latency: number | null;
}

// ============================================================================
// WebSocket Configuration
// ============================================================================

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  reconnectDecay?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
  pongTimeout?: number;
  messageQueueSize?: number;
  enableOfflineQueue?: boolean;
}

export const DEFAULT_WEBSOCKET_CONFIG: WebSocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnectInterval: 1000,
  maxReconnectInterval: 30000,
  reconnectDecay: 1.5,
  maxReconnectAttempts: 10,
  pingInterval: 30000,
  pongTimeout: 10000,
  messageQueueSize: 100,
  enableOfflineQueue: true,
};

// ============================================================================
// Activity Feed Types
// ============================================================================

export interface ActivityFeedFilters {
  types?: ActivityType[];
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  quoteId?: string;
  searchQuery?: string;
}

export interface ActivityFeedOptions {
  pageSize?: number;
  enableSound?: boolean;
  enableAnimations?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseRealtimeActivityReturn {
  activities: ActivityUpdateEvent['data'][];
  isLoading: boolean;
  isSubscribed: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  filters: ActivityFeedFilters;
  setFilters: (filters: ActivityFeedFilters) => void;
  unreadCount: number;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  connectionState: WebSocketState;
  newActivityCount: number;
  clearNewActivityCount: () => void;
}

// ============================================================================
// Server Types
// ============================================================================

import type { WebSocket as WSWebSocket } from 'ws';

export interface WebSocketClient {
  id: string;
  socket: WSWebSocket;
  userId?: string;
  isAuthenticated: boolean;
  subscribedChannels: Set<string>;
  connectedAt: Date;
  lastPingAt: Date;
}

export interface WebSocketServerStats {
  totalConnections: number;
  authenticatedConnections: number;
  channels: Record<string, number>;
  messagesPerSecond: number;
  uptime: number;
}
