/**
 * WebSocket API Route
 * Next.js API route for WebSocket status and info
 * @module api/ws/route
 */

import { NextResponse } from 'next/server';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

/**
 * GET /api/ws
 * Returns WebSocket server status and connection info
 */
export async function GET() {
  try {
    // Check WebSocket server health
    const healthUrl = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://');
    
    let isHealthy = false;
    let stats = null;
    
    try {
      const response = await fetch(`${healthUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        isHealthy = true;
        stats = await response.json();
      }
    } catch {
      // Server might not be running
      isHealthy = false;
    }

    return NextResponse.json({
      success: true,
      data: {
        url: WS_URL,
        isHealthy,
        stats,
        features: {
          realTimeUpdates: true,
          activityFeed: true,
          quoteNotifications: true,
          customerUpdates: true,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WS_STATUS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to get WebSocket status',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ws/broadcast
 * Broadcast a message to all connected clients (admin only)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { channel, event, data, token } = body;

    // Verify admin token
    if (!token || token !== process.env.WS_ADMIN_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or missing admin token',
          },
        },
        { status: 401 }
      );
    }

    // Forward to WebSocket server
    const healthUrl = WS_URL.replace('ws://', 'http://').replace('wss://', 'https://');
    
    const response = await fetch(`${healthUrl}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, event, data }),
    });

    if (!response.ok) {
      throw new Error('WebSocket server broadcast failed');
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Broadcast sent successfully',
        channel,
        event,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BROADCAST_ERROR',
          message: error instanceof Error ? error.message : 'Failed to broadcast message',
        },
      },
      { status: 500 }
    );
  }
}
