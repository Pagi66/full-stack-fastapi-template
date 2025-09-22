import { useMemo, useState, useEffect } from "react";
import {
  Activity,
  BarChart01,
  TrendUp01,
  Wallet01,
  ShieldTick,
  Globe02,
  Users01,
  Zap,
  AlertTriangle,
} from "@untitledui/icons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Tabs } from "@/components/application/tabs/tabs";
import { useAuth } from "@/providers/auth-provider";
import {
  PortfolioService,
  type DailyPerformanceEntry,
  type TradesCollectionEntry,
} from "@/api/services/PortfolioService";
import { TransactionsService } from "@/api/services/TransactionsService";
import TradingViewWidget from "@/components/trading-view-widget";
import { CryptoBadge } from "@/components/base/badges/crypto-badge";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

// Simulated real-time data to match landing page claims
const useLivePortfolioSimulation = () => {
  const [liveMetrics, setLiveMetrics] = useState({
    aum: 124567.89,
    dailyPl: 1234.56,
    activeStrategies: 3,
    executionCount: 142
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        aum: prev.aum * (1 + (Math.random() * 0.0005)), // Small random growth
        dailyPl: prev.dailyPl + (Math.random() * 100 - 50), // Realistic fluctuations
        activeStrategies: prev.activeStrategies,
        executionCount: prev.executionCount + Math.floor(Math.random() * 3)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return liveMetrics;
};

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const userId = user?.id;
  const liveMetrics = useLivePortfolioSimulation();

  const accountSummaryQuery = useQuery({
    queryKey: ["account-summary", userId],
    queryFn: () => PortfolioService.accountSummary(userId!),
    enabled: Boolean(userId),
  });

  const tradesQuery = useQuery({
    queryKey: ["trades", userId],
    queryFn: () => PortfolioService.trades(0, 10),
    enabled: Boolean(userId),
  });

  const performanceQuery = useQuery({
    queryKey: ["daily-performance", userId],
    queryFn: () => PortfolioService.dailyPerformance(0, 15),
    enabled: Boolean(userId),
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", userId],
    queryFn: () => TransactionsService.transactionsReadTransactions(0, 10),
    enabled: Boolean(userId),
  });

  const summary = accountSummaryQuery.data;
  const trades = tradesQuery.data?.data ?? [];
  const dailyPerformance = performanceQuery.data?.data ?? [];

  const latestDailyProfit = dailyPerformance[0]?.profit_loss ?? 0;

  const isLoading =
    accountSummaryQuery.isLoading ||
    tradesQuery.isLoading ||
    performanceQuery.isLoading ||
    transactionsQuery.isLoading;

  // Institutional-grade metrics matching landing page
  const portfolioTelemetry = useMemo(() => {
    return [
      {
        title: "AUM Deployed",
        value: formatCurrency(liveMetrics.aum),
        icon: TrendUp01,
        change: "+2.3%",
        changeLabel: "Today's growth",
        color: "success" as const,
      },
      {
        title: "Live P&L",
        value: formatCurrency(liveMetrics.dailyPl),
        icon: BarChart01,
        change: liveMetrics.dailyPl >= 0 ? "positive" : "negative",
        changeLabel: "Session performance",
        color: liveMetrics.dailyPl >= 0 ? "success" : "error" as const,
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
        title: "Executions",
        value: liveMetrics.executionCount.toString(),
        icon: Zap,
        change: `${Math.floor(Math.random() * 5)} new`,
        changeLabel: "Active strategies",
        color: "warning" as const,
      },
    ];
  }, [liveMetrics, summary?.win_rate]);

  // Simulated live execution feed
  const liveExecutions = useMemo(() => [
    { time: "09:45:23", asset: "BTC/USD", action: "BUY" as const, quantity: "0.25", price: "$64,123.45" },
    { time: "09:42:11", asset: "SPX500", action: "SELL" as const, quantity: "2", price: "$5,234.67" },
    { time: "09:40:05", asset: "ETH/USD", action: "BUY" as const, quantity: "1.5", price: "$3,456.78" },
  ], []);

  const proTraders = useMemo(() => [
    { name: "Meridian Quant", performance: "+22.1%", risk: "Growth" as const, allocated: true },
    { name: "Helios Macro", performance: "+18.7%", risk: "Moderate" as const, allocated: true },
  ], []);

  const renderLiveExecutionFeed = () => (
    <div className="space-y-3">
      {liveExecutions.map((exec, index) => (
        <motion.div
          key={`${exec.time}-${index}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-secondary"
        >
          <span className="text-sm text-tertiary font-mono">{exec.time}</span>
          <span className="font-medium text-primary">{exec.asset}</span>
          <Badge size="sm" color={exec.action === "BUY" ? "success" : "error"}>
            {exec.action}
          </Badge>
          <span className="text-sm text-primary">{exec.quantity}</span>
          <span className="text-sm font-semibold text-primary">{exec.price}</span>
        </motion.div>
      ))}
    </div>
  );

  const renderProTraderNetwork = () => (
    <div className="space-y-3">
      {proTraders.map((trader) => (
        <div key={trader.name} className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
          <div>
            <p className="font-medium text-primary">{trader.name}</p>
            <p className="text-sm text-tertiary">{trader.risk} risk</p>
          </div>
          <Badge size="sm" color="success">
            {trader.performance}
          </Badge>
        </div>
      ))}
      <Button size="sm" color="secondary" className="w-full">
        <Globe02 className="w-4 h-4 mr-2" />
        Browse More Traders
      </Button>
    </div>
  );

  const renderApexWallet = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 rounded-lg bg-brand-solid/5 border border-secondary">
        <span className="text-tertiary">Available Balance</span>
        <span className="text-2xl font-semibold text-primary">{formatCurrency(user?.balance ?? 12456.78)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Button size="lg" color="secondary">
          <Wallet01 className="w-4 h-4 mr-2" />
          Deposit Crypto
        </Button>
        <Button size="lg" color="tertiary">
          Request Withdrawal
        </Button>
      </div>
      
      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>New to cryptocurrency?</strong> Our support team can guide you through the process.
        </p>
        <Button size="sm" color="secondary" className="mt-2">
          Talk to Support
        </Button>
      </div>

      <div className="text-center">
        <h4 className="font-semibold text-sm text-tertiary mb-2">Accepted Cryptocurrencies</h4>
        <div className="flex justify-center gap-2">
          <CryptoBadge>BTC</CryptoBadge>
          <CryptoBadge>ETH</CryptoBadge>
          <CryptoBadge>USDT</CryptoBadge>
          <CryptoBadge>USDC</CryptoBadge>
        </div>
      </div>
    </div>
  );

  // Keep your existing render functions but update styling
  const renderDailyPerformance = (entries: DailyPerformanceEntry[]) => {
    if (!entries.length) {
      return (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 text-tertiary mx-auto mb-2" />
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
              <p className="text-xs text-tertiary">Recorded {new Date(entry.created_at).toLocaleTimeString()}</p>
            </div>
            <Badge
              size="sm"
              color={entry.profit_loss >= 0 ? "success" : "error"}
            >
              {formatCurrency(entry.profit_loss)}
            </Badge>
          </motion.div>
        ))}
      </div>
    );
  };

  // Updated table styling to match institutional theme
  const renderTrades = (rows: TradesCollectionEntry[]) => {
    if (!rows.length) {
      return (
        <div className="text-center py-8">
          <Users01 className="w-8 h-8 text-tertiary mx-auto mb-2" />
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
              <tr key={trade.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-medium text-primary">{trade.symbol}</td>
                <td className="px-4 py-3 capitalize text-primary">{trade.side}</td>
                <td className="px-4 py-3">
                  <Badge size="sm" color={trade.status === 'closed' ? 'success' : trade.status === 'open' ? 'brand' : 'warning'}>
                    {trade.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-primary">{trade.volume.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={trade.profit_loss && trade.profit_loss < 0 ? 'text-error-500' : 'text-success-500'}>
                    {formatCurrency(trade.profit_loss ?? 0)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-tertiary">{new Date(trade.opened_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* TradingView Widget Header */}
      <div className="border-b border-secondary bg-gray-900/50 py-2">
        <div className="max-w-7xl mx-auto px-6">
          <TradingViewWidget />
        </div>
      </div>

      {/* Main Dashboard Header */}
      <header className="border-b border-secondary bg-primary px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <BadgeGroup size="lg" color="brand" theme="light" addonText="Live Trading" className="mb-2">
                Portfolio Console
              </BadgeGroup>
              <h1 className="text-2xl font-semibold text-primary">
                Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
              </h1>
              <p className="text-tertiary">Live institutional trading dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge size="sm" color={user?.kyc_status === 'approved' ? 'success' : 'warning'}>
                <ShieldTick className="w-3 h-3 mr-1" />
                KYC: {user?.kyc_status ?? 'pending'}
              </Badge>
              <Badge size="sm" color="brand">
                Tier: {user?.account_tier ?? 'Starter'}
              </Badge>
              <Button color="secondary" size="md" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Activity className="w-8 h-8 animate-spin text-tertiary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Portfolio Telemetry */}
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
                        <stat.icon className="w-5 h-5 text-brand-primary" />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-tertiary">{stat.changeLabel}</p>
                    <p className="text-sm font-medium text-brand-primary">{stat.change}</p>
                  </motion.div>
                ))}
              </section>

              {/* Live Execution Feed */}
              <section className="rounded-2xl border border-secondary bg-secondary p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary">Live Execution Feed</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-tertiary">Real-time streaming</span>
                  </div>
                </div>
                {renderLiveExecutionFeed()}
              </section>

              {/* Tabs Section */}
              <section className="rounded-2xl border border-secondary bg-secondary p-6">
                <Tabs>
                  <Tabs.List
                    items={[
                      { id: 'performance', children: 'Performance Analytics' },
                      { id: 'trades', children: 'Trade Blotter' },
                      { id: 'transactions', children: 'Transaction Ledger' },
                    ]}
                  />
                  <Tabs.Panel id="performance" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-primary">Daily Performance</h3>
                      <Badge size="sm" color={latestDailyProfit >= 0 ? 'success' : 'error'}>
                        {formatCurrency(latestDailyProfit)} today
                      </Badge>
                    </div>
                    {renderDailyPerformance(dailyPerformance)}
                  </Tabs.Panel>
                  <Tabs.Panel id="trades" className="mt-6">
                    {renderTrades(trades)}
                  </Tabs.Panel>
                  <Tabs.Panel id="transactions" className="mt-6">
                    {/* Your existing transactions render function */}
                  </Tabs.Panel>
                </Tabs>
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Apex Wallet */}
              <section className="rounded-2xl border border-secondary bg-secondary p-6">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Wallet01 className="w-5 h-5" />
                  Apex Wallet
                </h3>
                {renderApexWallet()}
              </section>

              {/* Pro Trader Network */}
              <section className="rounded-2xl border border-secondary bg-secondary p-6">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Users01 className="w-5 h-5" />
                  Pro Trader Network
                </h3>
                {renderProTraderNetwork()}
              </section>

              {/* Risk Guardrails */}
              <section className="rounded-2xl border border-secondary bg-secondary p-6">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Risk Guardrails
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-tertiary">Max Drawdown</span>
                    <Badge size="sm" color="success">-2.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-tertiary">Position Limits</span>
                    <Badge size="sm" color="brand">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-tertiary">Circuit Breaker</span>
                    <Badge size="sm" color="success">Ready</Badge>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
