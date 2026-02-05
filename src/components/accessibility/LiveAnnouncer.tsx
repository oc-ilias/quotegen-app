/**
 * Live Announcer Component
 * Screen reader announcement system using aria-live regions
 * @module components/accessibility/LiveAnnouncer
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';

export type AnnouncerMessage = {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
};

type AnnouncerAction =
  | { type: 'ADD_MESSAGE'; payload: AnnouncerMessage }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'CLEAR_MESSAGES' };

const messageReducer = (state: AnnouncerMessage[], action: AnnouncerAction): AnnouncerMessage[] => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.payload];
    case 'REMOVE_MESSAGE':
      return state.filter((m) => m.id !== action.payload);
    case 'CLEAR_MESSAGES':
      return [];
    default:
      return state;
  }
};

// ============================================================================
// Context
// ============================================================================

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  clearAnnouncements: () => void;
}

const LiveAnnouncerContext = React.createContext<LiveAnnouncerContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

export const LiveAnnouncerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [politeMessages, dispatchPolite] = React.useReducer(messageReducer, []);
  const [assertiveMessages, dispatchAssertive] = React.useReducer(messageReducer, []);
  const messageIdRef = useRef(0);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `announce-${++messageIdRef.current}`;
    const dispatch = priority === 'polite' ? dispatchPolite : dispatchAssertive;

    dispatch({ type: 'ADD_MESSAGE', payload: { id, message, priority } });

    // Remove message after screen reader has had time to announce it
    setTimeout(() => {
      dispatch({ type: 'REMOVE_MESSAGE', payload: id });
    }, 1000);
  }, []);

  const clearAnnouncements = useCallback(() => {
    dispatchPolite({ type: 'CLEAR_MESSAGES' });
    dispatchAssertive({ type: 'CLEAR_MESSAGES' });
  }, []);

  return (
    <LiveAnnouncerContext.Provider value={{ announce, clearAnnouncements }}>
      {children}
      <LiveRegion messages={politeMessages} priority="polite" />
      <LiveRegion messages={assertiveMessages} priority="assertive" />
    </LiveAnnouncerContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export function useLiveAnnouncer(): LiveAnnouncerContextType {
  const context = React.useContext(LiveAnnouncerContext);
  if (!context) {
    throw new Error('useLiveAnnouncer must be used within a LiveAnnouncerProvider');
  }
  return context;
}

// ============================================================================
// Live Region Component
// ============================================================================

interface LiveRegionProps {
  messages: AnnouncerMessage[];
  priority: 'polite' | 'assertive';
}

function LiveRegion({ messages, priority }: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  // Ensure the region is empty after each announcement
  useEffect(() => {
    if (regionRef.current && messages.length === 0) {
      regionRef.current.textContent = '';
    }
  }, [messages]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {messages.map((message) => (
        <div key={message.id}>{message.message}</div>
      ))}
    㰭iv>
  );
}

export default LiveAnnouncerProvider;