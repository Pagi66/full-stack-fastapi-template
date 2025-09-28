import React from 'react';
import { useExecutionFeed } from '@/providers/execution-feed-provider';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';

export const ExecutionFeed: React.FC = () => {
  const { events, isConnected, error, clearEvents } = useExecutionFeed();

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'TRADER_SIMULATION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FOLLOWER_PROFIT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MANUAL_ADJUSTMENT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAmount = (amount?: number) => {
    if (amount === undefined || amount === null) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="w-full rounded-2xl border border-secondary bg-secondary p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-primary">Live Execution Feed</h3>
          <p className="text-sm text-tertiary">
            Real-time trading and simulation events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-tertiary">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <Button color="secondary" size="sm" onClick={clearEvents}>
            Clear
          </Button>
        </div>
      </div>
      <div className="mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="h-80 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-tertiary">
              <p>No execution events yet</p>
              <p className="text-sm">Events will appear here as they occur</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 border border-secondary rounded-lg bg-primary hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                        {event.amount && (
                          <span
                            className={`text-sm font-medium ${
                              event.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {formatAmount(event.amount)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate text-primary">{event.description}</p>
                      {event.payload.symbol && (
                        <p className="text-xs text-tertiary">
                          Symbol: {event.payload.symbol}
                        </p>
                      )}
                      {event.payload.trader_display_name && (
                        <p className="text-xs text-tertiary">
                          Trader: {event.payload.trader_display_name}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-tertiary whitespace-nowrap">
                      {formatTimestamp(event.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
