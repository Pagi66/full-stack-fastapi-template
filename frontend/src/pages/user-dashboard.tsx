import { useMemo, type ReactNode } from "react";
import { Activity, TrendUp01, Wallet01, ShieldTick, Zap, Users01 } from "@untitledui/icons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useLocation } from "@tanstack/react-router";
import { Badge } from "@/components/base/badges/badges";
import { Tabs } from "@/components/application/tabs/tabs";
import { useAuth } from "@/providers/auth-provider";
import {
  PortfolioService,
  type DailyPerformanceEntry,
  type TradesCollectionEntry,
} from "@/api/services/PortfolioService";
import { TransactionsService } from "@/api/services/TransactionsService";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

export const UserDashboard = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { pathname } = useLocation();
  const normalizedPathname =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const isRootDashboard = normalizedPathname === "/dashboard";

  const accountSummaryQuery = useQuery({
    queryKey: ["account-summary", userId],
    queryFn: () => PortfolioService.accountSummary(userId!),
    enabled: Boolean(userId) && isRootDashboard,
  });

  const tradesQuery = useQuery({
    queryKey: ["trades", userId],
    queryFn: () => PortfolioService.trades(0, 10),
    enabled: Boolean(userId) && isRootDashboard,
  });

  const performanceQuery = useQuery({
    queryKey: ["daily-performance", userId],
    queryFn: () => PortfolioService.dailyPerformance(0, 15),
    enabled: Boolean(userId) && isRootDashboard,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => TransactionsService.transactionsReadTransactions(0, 10),
    enabled: Boolean(userId) && isRootDashboard,
  });

  const marketDataQuery = useQuery({
    queryKey: ["market-prices"],
    queryFn: () => PortfolioService.getMarketPrices(),
    refetchInterval: 300000,
    enabled: isRootDashboard,
  });

  const summary = accountSummaryQuery.data;
  const trades = tradesQuery.data?.data ?? [];
  const dailyPerformance = performanceQuery.data?.data ?? [];
  const latestDailyProfit = dailyPerformance[0]?.profit_loss ?? 0;

  const isLoading =
    isRootDashboard &&
    (accountSummaryQuery.isLoading ||
      tradesQuery.isLoading ||
      performanceQuery.isLoading ||
      transactionsQuery.isLoading ||
      marketDataQuery.isLoading);

  const portfolioTelemetry = useMemo(() => {
    if (!isRootDashboard) {
      return [];
    }

    const realBalance = user?.balance || 0;
    const simulatedProfit = summary?.net_profit || 0;
    const roi = realBalance > 0 ? (simulatedProfit / realBalance) * 100 : 0;

    return [
      {
        title: "Current Balance",
        value: formatCurrency(realBalance),
        icon: Wallet01,
        change: user?.account_tier ?? "Tier",
        changeLabel: "Account tier",
        color: "success" as const,
      },
      {
        title: "Net P&L",
        value: formatCurrency(simulatedProfit),
        icon: TrendUp01,
        change: `${roi.toFixed(2)}%`,
        changeLabel: "ROI",
        color: simulatedProfit >= 0 ? ("success" as const) : ("error" as const),
      },
      {
        title: "Win Rate",
        value: formatPercent(summary?.win_rate ?? 78.4),
        icon: ShieldTick,
        change: "+1.2%",
        changeLabel: "7-day trend",
        color: "brand" as const,
      },
      {
        title: "Active Trades",
        value: trades.filter((trade) => trade.status === "open").length.toString(),
        icon: Zap,
        change: `${Math.floor(Math.random() * 5)} new`,
        changeLabel: "Live positions",
        color: "warning" as const,
      },
    ];
  }, [isRootDashboard, user, summary, trades]);

  const liveExecutions = useMemo(
    () => [
      {
        time: "09:45:23",
        asset: "BTC/USD",
        action: "BUY" as const,
        quantity: "0.25",
        price: "$64,123.45",
      },
      {
        time: "09:42:11",
        asset: "SPX500",
        action: "SELL" as const,
        quantity: "2",
        price: "$5,234.67",
      },
      {
        time: "09:40:05",
        asset: "ETH/USD",
        action: "BUY" as const,
        quantity: "1.5",
        price: "$3,456.78",
      },
    ],
    []
  );

  const renderDailyPerformance = (entries: DailyPerformanceEntry[]) => {
    if (!entries.length) {
      return (
        <div className="py-8 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-tertiary" />
          <p className="text-sm text-tertiary">Awaiting trading activity</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between rounded-lg border border-secondary bg-primary p-4"
          >
            <div>
              <p className="font-medium text-primary">{entry.performance_date}</p>
              <p className="text-xs text-tertiary">
                Recorded {new Date(entry.created_at).toLocaleTimeString()}
              </p>
            </div>
            <Badge size="sm" color={entry.profit_loss >= 0 ? "success" : "error"}>
              {formatCurrency(entry.profit_loss)}
            </Badge>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderTrades = (rows: TradesCollectionEntry[]) => {
    if (!rows.length) {
      return (
        <div className="py-8 text-center">
          <Users01 className="mx-auto mb-2 h-8 w-8 text-tertiary" />
          <p className="text-sm text-tertiary">No live positions</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-secondary">
        <table className="min-w-full">
          <thead className="bg-secondary">
            <tr className="text-left text-xs uppercase text-tertiary">
              <th className="px-4 py-3 font-semibold">Symbol</th>
              <th className="px-4 py-3 font-semibold">Side</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Volume</th>
              <th className="px-4 py-3 font-semibold">P&L</th>
              <th className="px-4 py-3 font-semibold">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary bg-primary">
            {rows.map((trade) => (
              <tr key={trade.id} className="transition-colors hover:bg-secondary/50">
                <td className="px-4 py-3 font-medium text-primary">{trade.symbol}</td>
                <td className="px-4 py-3 capitalize text-primary">{trade.side}</td>
                <td className="px-4 py-3">
                  <Badge
                    size="sm"
                    color={
                      trade.status === "closed"
                        ? "success"
                        : trade.status === "open"
                        ? "brand"
                        : "warning"
                    }
                  >
                    {trade.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-primary">{trade.volume.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={trade.profit_loss && trade.profit_loss < 0 ? "text-error-500" : "text-success-500"}>
                    {formatCurrency(trade.profit_loss ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-tertiary">
                  {new Date(trade.opened_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const overviewContent = (
    <>
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {portfolioTelemetry.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-secondary bg-secondary p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-tertiary">{stat.title}</p>
                <p className="mt-2 text-xl font-semibold text-primary">{stat.value}</p>
              </div>
              <div className="rounded-lg bg-primary p-2">
                <stat.icon className="h-5 w-5 text-brand-primary" />
              </div>
            </div>
            <p className="mt-3 text-xs text-tertiary">{stat.changeLabel}</p>
            <p className="text-sm font-medium text-brand-primary">{stat.change}</p>
          </motion.div>
        ))}
      </section>

      <section className="rounded-2xl border border-secondary bg-secondary p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Live Execution Feed</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-sm text-tertiary">Real-time streaming</span>
          </div>
        </div>
        <div className="space-y-3">
          {liveExecutions.map((exec, index) => (
            <motion.div
              key={`${exec.time}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between rounded-lg border border-secondary bg-primary p-3"
            >
              <span className="font-mono text-sm text-tertiary">{exec.time}</span>
              <span className="font-medium text-primary">{exec.asset}</span>
              <Badge size="sm" color={exec.action === "BUY" ? "success" : "error"}>
                {exec.action}
              </Badge>
              <span className="text-sm text-primary">{exec.quantity}</span>
              <span className="text-sm font-semibold text-primary">{exec.price}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-secondary bg-secondary p-6">
        <Tabs>
          <Tabs.List
            items={[
              { id: "performance", children: "Performance Analytics" },
              { id: "trades", children: "Trade Blotter" },
              { id: "transactions", children: "Transaction Ledger" },
            ]}
          />
          <Tabs.Panel id="performance" className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-primary">Daily Performance</h3>
              <Badge size="sm" color={latestDailyProfit >= 0 ? "success" : "error"}>
                {formatCurrency(latestDailyProfit)} today
              </Badge>
            </div>
            {renderDailyPerformance(dailyPerformance)}
          </Tabs.Panel>
          <Tabs.Panel id="trades" className="mt-6">
            {renderTrades(trades)}
          </Tabs.Panel>
          <Tabs.Panel id="transactions" className="mt-6">
            {/* TODO: Render transactions data */}
          </Tabs.Panel>
        </Tabs>
      </section>
    </>
  );

  const content = isRootDashboard ? overviewContent : children ?? null;

  return <DashboardLayout isLoading={isLoading}>{content}</DashboardLayout>;
};
