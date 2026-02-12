import React, { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Priority levels for screen reader announcements
 */
export type AnnouncePriority = 'polite' | 'assertive';

/**
 * Announcement message structure
 */
interface Announcement {
  id: string;
  message: string;
  priority: AnnouncePriority;
}

/**
 * Props for the LiveAnnouncer component
 */
export interface LiveAnnouncerProps {
  /** Child elements */
  children: React.ReactNode;
  /** Additional CSS class names for the announcer container */
  className?: string;
}

/**
 * Props for the useAnnouncer hook
 */
export interface UseAnnouncerReturn {
  /** Function to announce a message */
  announce: (message: string, priority?: AnnouncePriority) => void;
  /** Function to clear all announcements */
  clearAnnouncements: () => void;
}

// Global announcement queue (shared across instances)
let announcementQueue: Announcement[] = [];
let queueListeners: ((queue: Announcement[]) => void)[] = [];

/**
 * Add announcement to global queue
 */
const addToQueue = (announcement: Announcement): void => {
  announcementQueue = [...announcementQueue, announcement];
  queueListeners.forEach((listener) => listener(announcementQueue));
};

/**
 * Remove announcement from global queue
 */
const removeFromQueue = (id: string): void => {
  announcementQueue = announcementQueue.filter((a) => a.id !== id);
  queueListeners.forEach((listener) => listener(announcementQueue));
};

/**
 * Clear all announcements
 */
const clearQueue = (): void => {
  announcementQueue = [];
  queueListeners.forEach((listener) => listener(announcementQueue));
};

/**
 * Subscribe to queue changes
 */
const subscribeToQueue = (
  listener: (queue: Announcement[]) => void
): (() => void) => {
  queueListeners = [...queueListeners, listener];
  
  return () => {
    queueListeners = queueListeners.filter((l) => l !== listener);
  };
};

/**
 * Generate unique ID for announcements
 */
const generateId = (): string => {
  return `announce-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * LiveAnnouncer Component
 * 
 * Provides ARIA live regions for screen reader announcements.
 * Manages polite and assertive announcement queues.
 * 
 * Features:
 * - Dual live regions (polite and assertive)
 * - Queue management for sequential announcements
 * - Duplicate message handling (adds pause for repeated messages)
 * - Contextual hook for easy access
 * 
 * WCAG 2.1 AA Compliance:
 * - 4.1.3 Status Messages (Level AA)
 * 
 * @example
 * ```tsx
 * // Wrap your app with LiveAnnouncer
 * function App() {
 *   return (
 *     <LiveAnnouncer>
 *       <YourApp />
 *     </LiveAnnouncer>
 *   );
 * }
 * 
 * // Use the hook in components
 * function MyComponent() {
 *   const { announce } = useAnnouncer();
 *   
 *   const handleClick = () => {
 *     announce('Item added to cart', 'polite');
 *   };
 *   
 *   return <button onClick={handleClick}>Add to Cart</button>;
 * }
 * ```
 */
export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({
  children,
  className = '',
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<{ message: string; priority: AnnouncePriority } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to global queue
  useEffect(() => {
    const unsubscribe = subscribeToQueue((queue) => {
      setAnnouncements([...queue]);
    });
    
    return unsubscribe;
  }, []);

  /**
   * Process announcement queue
   */
  useEffect(() => {
    const processQueue = () => {
      const current = announcements[0];
      
      if (!current) {
        return;
      }

      const targetRef = current.priority === 'assertive' ? assertiveRef : politeRef;
      const element = targetRef.current;

      if (!element) {
        return;
      }

      // Handle duplicate messages by adding a pause
      let messageToAnnounce = current.message;
      if (
        lastMessageRef.current &&
        lastMessageRef.current.message === current.message &&
        lastMessageRef.current.priority === current.priority
      ) {
        messageToAnnounce = `\u00A0${current.message}`;
      }

      // Set the announcement
      element.textContent = messageToAnnounce;
      lastMessageRef.current = { message: current.message, priority: current.priority };

      // Remove from queue after announcement
      timeoutRef.current = setTimeout(() => {
        removeFromQueue(current.id);
        
        // Clear the live region
        if (element) {
          element.textContent = '';
        }
      }, 1000);
    };

    processQueue();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [announcements]);

  return (
    <>
      {/* Hidden live region containers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`live-announcer live-announcer--polite ${className}`.trim()}
        ref={politeRef}
        role="status"
        data-testid="live-announcer-polite"
      />
      <div
        aria-live="assertive"
        aria-atomic="true"
        className={`live-announcer live-announcer--assertive ${className}`.trim()}
        ref={assertiveRef}
        role="alert"
        data-testid="live-announcer-assertive"
      />
      {children}
    </>
  );
};

/**
 * Hook to access the announcer functionality
 * Must be used within a LiveAnnouncer component
 * 
 * @returns Object with announce and clearAnnouncements functions
 * @example
 * ```tsx
 * function SaveButton() {
 *   const { announce } = useAnnouncer();
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       announce('Changes saved successfully', 'polite');
 *     } catch (error) {
 *       announce('Failed to save changes', 'assertive');
 *     }
 *   };
 *   
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export const useAnnouncer = (): UseAnnouncerReturn => {
  const announce = useCallback((message: string, priority: AnnouncePriority = 'polite') => {
    const announcement: Announcement = {
      id: generateId(),
      message,
      priority,
    };
    addToQueue(announcement);
  }, []);

  const clearAnnouncements = useCallback(() => {
    clearQueue();
  }, []);

  return { announce, clearAnnouncements };
};

/**
 * Default export for convenient importing
 */
export default LiveAnnouncer;
