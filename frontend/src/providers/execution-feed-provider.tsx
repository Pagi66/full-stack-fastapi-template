import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-provider';

interface ExecutionEvent {
  id: string;
  event_type: string;
  description: string;
  amount?: number;
  user_id?: string;
  trader_profile_id?: string;
  payload: Record<string, any>;
  created_at: string;
}

interface ExecutionFeedContextType {
  events: ExecutionEvent[];
  isConnected: boolean;
  error: string | null;
  clearEvents: () => void;
}

const ExecutionFeedContext = createContext<ExecutionFeedContextType | undefined>(undefined);

interface ExecutionFeedProviderProps {
  children: ReactNode;
}

export const ExecutionFeedProvider: React.FC<ExecutionFeedProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setWs] = useState<WebSocket | null>(null);

  const clearEvents = () => {
    setEvents([]);
  };

  useEffect(() => {
    if (!user?.id) {
      console.log('ExecutionFeedProvider: No user ID, skipping initialization');
      return;
    }

    console.log('ExecutionFeedProvider: Initializing for user', user.id);

    // Load recent events on mount
    const loadRecentEvents = async () => {
      try {
        console.log('ExecutionFeedProvider: Loading recent events');
        const response = await fetch(`/api/v1/execution-events/recent/${user.id}?limit=50`);
        if (response.ok) {
          const recentEvents = await response.json();
          console.log('ExecutionFeedProvider: Loaded', recentEvents.length, 'events');
          setEvents(recentEvents);
        } else {
          console.error('ExecutionFeedProvider: Failed to load events, status:', response.status);
        }
      } catch (err) {
        console.error('ExecutionFeedProvider: Failed to load recent execution events:', err);
      }
    };

    loadRecentEvents();

    // Set up WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/v1/execution-events/ws/${user.id}`;
    
    console.log('ExecutionFeedProvider: Connecting to WebSocket', wsUrl);
    const websocket = new WebSocket(wsUrl);
    setWs(websocket);

    websocket.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('ExecutionFeedProvider: WebSocket connected');
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'execution_event') {
          const newEvent = message.data;
          console.log('ExecutionFeedProvider: Received new event', newEvent.id);
          setEvents(prev => [newEvent, ...prev.slice(0, 99)]); // Keep last 100 events
        }
      } catch (err) {
        console.error('ExecutionFeedProvider: Failed to parse WebSocket message:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('ExecutionFeedProvider: WebSocket error:', error);
      setError('Connection error');
    };

    websocket.onclose = () => {
      setIsConnected(false);
      console.log('ExecutionFeedProvider: WebSocket disconnected');
    };

    return () => {
      console.log('ExecutionFeedProvider: Cleaning up WebSocket');
      websocket.close();
    };
  }, [user?.id]);

  const value: ExecutionFeedContextType = {
    events,
    isConnected,
    error,
    clearEvents,
  };

  return (
    <ExecutionFeedContext.Provider value={value}>
      {children}
    </ExecutionFeedContext.Provider>
  );
};

export const useExecutionFeed = (): ExecutionFeedContextType => {
  const context = useContext(ExecutionFeedContext);
  if (context === undefined) {
    throw new Error('useExecutionFeed must be used within an ExecutionFeedProvider');
  }
  return context;
};
