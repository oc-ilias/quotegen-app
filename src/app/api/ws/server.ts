/**
 * WebSocket Server Implementation
 * Standalone WebSocket server for Next.js
 * @module api/ws/server
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';
import {
  WebSocketClient,
  WebSocketClientEvent,
  WebSocketServerEvent,
  WebSocketClientMessage,
  WebSocketServerMessage,
  ActivityUpdateEvent,
  QuoteStatusChangeEvent,
  NewQuoteEvent,
  CustomerUpdateEvent,
  PongEvent,
  AuthSuccessEvent,
  AuthErrorEvent,
  ErrorEvent,
  WebSocketServerStats,
} from '@/types/websocket';
import { ActivityType } from '@/types/quote';

// ============================================================================
// Server Configuration
// ============================================================================

const PORT = parseInt(process.env.WS_PORT || '3001', 10);
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const HEARTBEAT_TIMEOUT = 60000; // 60 seconds

// ============================================================================
// Client Store
// ============================================================================

class WebSocketClientStore {
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private messageCount = 0;
  private startTime = Date.now();

  addClient(client: WebSocketClient): void {
    this.clients.set(client.id, client);
    console.log(`[WS] Client connected: ${client.id}. Total: ${this.clients.size}`);
  }

  removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove from all channels
      client.subscribedChannels.forEach((channel) => {
        this.unsubscribeFromChannel(clientId, channel);
      });
      this.clients.delete(clientId);
      console.log(`[WS] Client disconnected: ${clientId}. Total: ${this.clients.size}`);
    }
  }

  getClient(clientId: string): WebSocketClient | undefined {
    return this.clients.get(clientId);
  }

  subscribeToChannel(clientId: string, channel: string): void {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
    
    const client = this.clients.get(clientId);
    if (client) {
      client.subscribedChannels.add(channel);
    }
    
    console.log(`[WS] Client ${clientId} subscribed to ${channel}`);
  }

  unsubscribeFromChannel(clientId: string, channel: string): void {
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }
    
    const client = this.clients.get(clientId);
    if (client) {
      client.subscribedChannels.delete(channel);
    }
  }

  broadcastToChannel(channel: string, message: WebSocketServerMessage): void {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    const messageStr = JSON.stringify(message);
    
    channelClients.forEach((clientId) => {
      const client = this.clients.get(clientId);
      if (client && client.socket.readyState === WebSocket.OPEN) {
        try {
          client.socket.send(messageStr);
          this.messageCount++;
        } catch (err) {
          console.error(`[WS] Failed to send message to ${clientId}:`, err);
        }
      }
    });
  }

  broadcastToAll(message: WebSocketServerMessage): void {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client) => {
      if (client.socket.readyState === WebSocket.OPEN) {
        try {
          client.socket.send(messageStr);
          this.messageCount++;
        } catch (err) {
          console.error(`[WS] Failed to send message to ${client.id}:`, err);
        }
      }
    });
  }

  getStats(): WebSocketServerStats {
    const channelStats: Record<string, number> = {};
    this.channels.forEach((clients, channel) => {
      channelStats[channel] = clients.size;
    });

    return {
      totalConnections: this.clients.size,
      authenticatedConnections: Array.from(this.clients.values()).filter((c) => c.isAuthenticated).length,
      channels: channelStats,
      messagesPerSecond: this.messageCount / ((Date.now() - this.startTime) / 1000),
      uptime: Date.now() - this.startTime,
    };
  }

  getAllClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }
}

// ============================================================================
// Authentication
// ============================================================================

async function authenticateClient(token: string): Promise<{ userId: string; userName: string } | null> {
  // TODO: Implement actual JWT verification
  // For now, accept any token format
  if (!token || token.length < 10) {
    return null;
  }

  // Mock authentication - extract user info from token
  try {
    // In production, verify JWT and extract claims
    return {
      userId: `user_${token.slice(0, 8)}`,
      userName: 'Authenticated User',
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Message Handlers
// ============================================================================

function handleMessage(
  client: WebSocketClient,
  message: WebSocketClientMessage,
  clientStore: WebSocketClientStore
): void {
  switch (message.type) {
    case WebSocketClientEvent.PING:
      handlePing(client, message.timestamp);
      break;

    case WebSocketClientEvent.AUTHENTICATE:
      handleAuthenticate(client, message.token, clientStore);
      break;

    case WebSocketClientEvent.SUBSCRIBE:
      handleSubscribe(client, message.channel, clientStore);
      break;

    case WebSocketClientEvent.UNSUBSCRIBE:
      handleUnsubscribe(client, message.channel, clientStore);
      break;

    default:
      sendError(client, 'UNKNOWN_MESSAGE_TYPE', 'Unknown message type');
  }
}

function handlePing(client: WebSocketClient, timestamp: number): void {
  const pongMessage: PongEvent = {
    type: WebSocketServerEvent.PONG,
    timestamp,
    serverTime: new Date().toISOString(),
  };
  
  client.socket.send(JSON.stringify(pongMessage));
  client.lastPingAt = new Date();
}

async function handleAuthenticate(
  client: WebSocketClient,
  token: string,
  clientStore: WebSocketClientStore
): Promise<void> {
  const auth = await authenticateClient(token);
  
  if (auth) {
    client.isAuthenticated = true;
    client.userId = auth.userId;
    
    const successMessage: AuthSuccessEvent = {
      type: WebSocketServerEvent.AUTH_SUCCESS,
      message: 'Authentication successful',
      userId: auth.userId,
    };
    
    client.socket.send(JSON.stringify(successMessage));
    console.log(`[WS] Client ${client.id} authenticated as ${auth.userId}`);
  } else {
    const errorMessage: AuthErrorEvent = {
      type: WebSocketServerEvent.AUTH_ERROR,
      error: 'Invalid authentication token',
      code: 'AUTH_FAILED',
    };
    
    client.socket.send(JSON.stringify(errorMessage));
  }
}

function handleSubscribe(
  client: WebSocketClient,
  channel: string,
  clientStore: WebSocketClientStore
): void {
  clientStore.subscribeToChannel(client.id, channel);
}

function handleUnsubscribe(
  client: WebSocketClient,
  channel: string,
  clientStore: WebSocketClientStore
): void {
  clientStore.unsubscribeFromChannel(client.id, channel);
}

function sendError(client: WebSocketClient, code: string, error: string): void {
  const errorMessage: ErrorEvent = {
    type: WebSocketServerEvent.ERROR,
    error,
    code,
  };
  
  if (client.socket.readyState === WebSocket.OPEN) {
    client.socket.send(JSON.stringify(errorMessage));
  }
}

// ============================================================================
// Server Factory
// ============================================================================

export function createWebSocketServer(): {
  server: ReturnType<typeof createServer>;
  wss: WebSocketServer;
  clientStore: WebSocketClientStore;
  broadcastActivity: (activity: ActivityUpdateEvent['data']) => void;
  broadcastQuoteStatusChange: (data: QuoteStatusChangeEvent['data']) => void;
  broadcastNewQuote: (data: NewQuoteEvent['data']) => void;
  broadcastCustomerUpdate: (data: CustomerUpdateEvent['data']) => void;
} {
  const clientStore = new WebSocketClientStore();
  const server = createServer();
  const wss = new WebSocketServer({ server });

  // Handle new connections
  wss.on('connection', (socket, req) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const client: WebSocketClient = {
      id: clientId,
      socket,
      isAuthenticated: false,
      subscribedChannels: new Set(),
      connectedAt: new Date(),
      lastPingAt: new Date(),
    };

    clientStore.addClient(client);

    // Handle messages
    socket.on('message', (data) => {
      try {
        const message: WebSocketClientMessage = JSON.parse(data.toString());
        handleMessage(client, message, clientStore);
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
        sendError(client, 'PARSE_ERROR', 'Failed to parse message');
      }
    });

    // Handle close
    socket.on('close', () => {
      clientStore.removeClient(clientId);
    });

    // Handle errors
    socket.on('error', (err) => {
      console.error(`[WS] Client ${clientId} error:`, err);
      clientStore.removeClient(clientId);
    });

    // Send welcome message
    const welcomeMessage: PongEvent = {
      type: WebSocketServerEvent.PONG,
      timestamp: Date.now(),
      serverTime: new Date().toISOString(),
    };
    socket.send(JSON.stringify(welcomeMessage));
  });

  // Heartbeat check
  const heartbeatInterval = setInterval(() => {
    const now = Date.now();
    const clients = clientStore.getAllClients();
    
    clients.forEach((client) => {
      if (now - client.lastPingAt.getTime() > HEARTBEAT_TIMEOUT) {
        console.log(`[WS] Client ${client.id} timed out`);
        client.socket.terminate();
        clientStore.removeClient(client.id);
      }
    });
  }, HEARTBEAT_INTERVAL);

  // Broadcast functions
  const broadcastActivity = (activity: ActivityUpdateEvent['data']) => {
    const message: ActivityUpdateEvent = {
      type: WebSocketServerEvent.ACTIVITY_UPDATE,
      data: activity,
    };
    clientStore.broadcastToChannel('activities', message);
  };

  const broadcastQuoteStatusChange = (data: QuoteStatusChangeEvent['data']) => {
    const message: QuoteStatusChangeEvent = {
      type: WebSocketServerEvent.QUOTE_STATUS_CHANGE,
      data,
    };
    clientStore.broadcastToChannel('quotes', message);
    clientStore.broadcastToChannel('activities', {
      type: WebSocketServerEvent.ACTIVITY_UPDATE,
      data: {
        id: `activity_${Date.now()}`,
        type: ActivityType.STATUS_CHANGED,
        quoteId: data.quoteId,
        quoteNumber: data.quoteNumber,
        customerName: data.customerName,
        description: `Quote status changed from ${data.previousStatus} to ${data.newStatus}`,
        timestamp: data.timestamp,
      },
    });
  };

  const broadcastNewQuote = (data: NewQuoteEvent['data']) => {
    const message: NewQuoteEvent = {
      type: WebSocketServerEvent.NEW_QUOTE,
      data,
    };
    clientStore.broadcastToChannel('quotes', message);
    clientStore.broadcastToChannel('activities', {
      type: WebSocketServerEvent.ACTIVITY_UPDATE,
      data: {
        id: `activity_${Date.now()}`,
        type: ActivityType.QUOTE_CREATED,
        quoteId: data.quoteId,
        quoteNumber: data.quoteNumber,
        customerName: data.customerName,
        description: `New quote created for ${data.customerName}`,
        timestamp: data.timestamp,
      },
    });
  };

  const broadcastCustomerUpdate = (data: CustomerUpdateEvent['data']) => {
    const message: CustomerUpdateEvent = {
      type: WebSocketServerEvent.CUSTOMER_UPDATE,
      data,
    };
    clientStore.broadcastToChannel('customers', message);
  };

  return {
    server,
    wss,
    clientStore,
    broadcastActivity,
    broadcastQuoteStatusChange,
    broadcastNewQuote,
    broadcastCustomerUpdate,
  };
}

// ============================================================================
// Standalone Server Runner
// ============================================================================

if (require.main === module) {
  const { server, clientStore } = createWebSocketServer();

  // Health check endpoint
  server.on('request', (req, res) => {
    const { pathname } = parse(req.url || '', true);
    
    if (pathname === '/health') {
      const stats = clientStore.getStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        ...stats,
      }));
    } else if (pathname === '/stats') {
      const stats = clientStore.getStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    console.log(`[WS] WebSocket server running on port ${PORT}`);
    console.log(`[WS] Health check: http://localhost:${PORT}/health`);
    console.log(`[WS] Stats: http://localhost:${PORT}/stats`);
  });
}

export default createWebSocketServer;
