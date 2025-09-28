import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { useExecutionFeed } from "@/providers/execution-feed-provider";
import type { ExecutionFeedEvent, ExecutionEventType } from "@/api/services/CopyTradingService";

const typeLabels: Record<ExecutionEventType, string> = {
  TRADER_SIMULATION: "Trader Simulation",
  FOLLOWER_PROFIT: "Follower Profit",
  MANUAL_ADJUSTMENT: "Manual Adjustment",
};

const typeColors: Record<ExecutionEventType, "brand" | "success" | "warning"> = {
  TRADER_SIMULATION: "brand",
  FOLLOWER_PROFIT: "success",
  MANUAL_ADJUSTMENT: "warning",
};

const statusIndicatorClasses: Record<string, string> = {
  connecting: "bg-brand-primary",
  live: "bg-success-500",
  polling: "bg-warning-500",
  error: "bg-error-500",
};

const formatTimestamp = (value: string): string => new Date(value).toLocaleString();

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const computeImpact = (event: ExecutionFeedEvent): string => {
  if (event.amount === 0) {
    return "—";
  }
  const percentage = (event.amount / 1000) * 100;
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(2)}%`;
};

export const ExecutionFeedPage = () => {
  const {
    events,
    status,
    isLive,
    latestCursor,
    lastUpdated,
    error,
    refresh,
  } = useExecutionFeed();
  const [filter, setFilter] = useState<ExecutionEventType | "ALL">("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredEvents = useMemo(() => {
    if (filter === "ALL") {
      return events;
    }
    return events.filter((event) => event.eventType === filter);
  }, [events, filter]);

  const recentEvents = useMemo(() => filteredEvents.slice(0, 60), [filteredEvents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary">Execution Activity</h1>
          <p className="text-sm text-tertiary">
            Live copy-trading executions streamed in real time. Data refreshes automatically when connected.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-tertiary">
            <span
              className={`h-2 w-2 rounded-full ${statusIndicatorClasses[status] ?? "bg-brand-primary"} ${
                isLive ? "animate-pulse" : ""
              }`}
            />
            <span className="capitalize">{status}</span>
            {latestCursor ? <span>| Cursor {latestCursor}</span> : null}
            {lastUpdated ? <span>| Updated {lastUpdated.toLocaleTimeString()}</span> : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error ? (
            <Badge size="sm" color="error">
              {error}
            </Badge>
          ) : null}
          <Button size="sm" color="secondary" onClick={handleRefresh} isLoading={isRefreshing}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-tertiary">Filter:</span>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "TRADER_SIMULATION", "FOLLOWER_PROFIT", "MANUAL_ADJUSTMENT"] as const).map((value) => {
            const label = value === "ALL" ? "All events" : typeLabels[value];
            const isActive = filter === value;
            return (
              <Button
                key={value}
                size="sm"
                color={isActive ? "primary" : "secondary"}
                onClick={() => setFilter(value)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-secondary bg-secondary">
        <div className="grid grid-cols-12 gap-4 border-b border-secondary px-6 py-3 text-xs font-semibold uppercase text-tertiary">
          <span className="col-span-2">Timestamp</span>
          <span className="col-span-3">Trader</span>
          <span className="col-span-2">Type</span>
          <span className="col-span-2">Symbol</span>
          <span className="col-span-2 text-right">Amount</span>
          <span className="col-span-1 text-right">Impact</span>
        </div>
        <div className="divide-y divide-secondary">
          {recentEvents.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-tertiary">
              No execution events available yet.
            </div>
          ) : (
            recentEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-12 items-center gap-4 px-6 py-3"
              >
                <span className="col-span-2 font-mono text-xs text-tertiary">
                  {formatTimestamp(event.createdAt)}
                </span>
                <span className="col-span-3 text-sm text-primary">
                  {event.traderDisplayName ?? event.traderCode ?? "Trader"}
                </span>
                <span className="col-span-2 text-sm">
                  <Badge size="sm" color={typeColors[event.eventType]}>
                    {typeLabels[event.eventType]}
                  </Badge>
                </span>
                <span className="col-span-2 text-sm text-tertiary">{event.symbol ?? "—"}</span>
                <span
                  className={`col-span-2 text-right text-sm font-semibold ${
                    event.amount >= 0 ? "text-success-600" : "text-error-600"
                  }`}
                >
                  {formatCurrency(event.amount)}
                </span>
                <span className="col-span-1 text-right text-xs text-tertiary">{computeImpact(event)}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
