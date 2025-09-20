import { useMemo } from "react";
import {
  Activity,
  BarChart01,
  CreditCard01,
  Star01,
  TrendUp01,
  TrendDown01,
  Wallet01,
} from "@untitledui/icons";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { Tabs } from "@/components/application/tabs/tabs";
import { useAuth } from "@/providers/auth-provider";
import {
  PortfolioService,
  type AccountSummary,
  type DailyPerformanceEntry,
  type TradesCollectionEntry,
} from "@/api/services/PortfolioService";
import { TransactionsService } from "@/api/services/TransactionsService";
import type { TransactionPublic } from "@/api/models/TransactionPublic";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatPercent = (value: number) => `${value.toFixed(2)}%`;

const emptyStateMessage = "No records available";

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const userId = user?.id;

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
  const transactions = transactionsQuery.data?.data ?? [];

  const latestDailyProfit = dailyPerformance[0]?.profit_loss ?? 0;

  const isLoading =
    accountSummaryQuery.isLoading ||
    tradesQuery.isLoading ||
    performanceQuery.isLoading ||
    transactionsQuery.isLoading;

  const stats = useMemo(() => {
    const base: AccountSummary | undefined = summary;
    return [
      {
        title: "Current Balance",
        value: formatCurrency(user?.balance ?? 0),
        icon: Wallet01,
        change: user?.account_tier ?? "Tier",
        changeLabel: "Account tier",
      },
      {
        title: "Total Deposits",
        value: formatCurrency(base?.total_deposits ?? 0),
        icon: TrendUp01,
        change: formatCurrency(base?.net_profit ?? 0),
        changeLabel: "Net profit",
      },
      {
        title: "Total Withdrawals",
        value: formatCurrency(base?.total_withdrawals ?? 0),
        icon: TrendDown01,
        change: `${base?.total_trades ?? 0}`,
        changeLabel: "Trades taken",
      },
      {
        title: "Latest Daily P&L",
        value: formatCurrency(latestDailyProfit),
        icon: BarChart01,
        change: formatPercent(base?.win_rate ?? 0),
        changeLabel: "Win rate",
      },
    ];
  }, [latestDailyProfit, summary, user?.account_tier, user?.balance]);

  const renderDailyPerformance = (entries: DailyPerformanceEntry[]) => {
    if (!entries.length) {
      return <p className="text-sm text-fg-tertiary">{emptyStateMessage}</p>;
    }

    return (
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between rounded-lg border border-border-secondary bg-bg-primary px-4 py-3">
            <div>
              <p className="font-medium text-fg-primary">{entry.performance_date}</p>
              <p className="text-xs text-fg-tertiary">Recorded {new Date(entry.created_at).toLocaleTimeString()}</p>
            </div>
            <Badge
              type="color"
              size="sm"
              color={entry.profit_loss >= 0 ? "success" : "error"}
            >
              {formatCurrency(entry.profit_loss)}
            </Badge>
          </li>
        ))}
      </ul>
    );
  };

  const renderTrades = (rows: TradesCollectionEntry[]) => {
    if (!rows.length) {
      return <p className="text-sm text-fg-tertiary">{emptyStateMessage}</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-secondary">
          <thead>
            <tr className="text-left text-xs uppercase text-fg-tertiary">
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Side</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Volume</th>
              <th className="px-3 py-2">P&L</th>
              <th className="px-3 py-2">Opened</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary text-sm text-fg-secondary">
            {rows.map((trade) => (
              <tr key={trade.id}>
                <td className="px-3 py-2 font-medium text-fg-primary">{trade.symbol}</td>
                <td className="px-3 py-2 capitalize">{trade.side}</td>
                <td className="px-3 py-2">
                  <Badge type="color" size="sm" color={trade.status === 'closed' ? 'success' : trade.status === 'open' ? 'brand' : 'warning'}>
                    {trade.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">{trade.volume.toLocaleString()}</td>
                <td className="px-3 py-2">
                  <span className={trade.profit_loss && trade.profit_loss < 0 ? 'text-error-500' : 'text-success-500'}>
                    {formatCurrency(trade.profit_loss ?? 0)}
                  </span>
                </td>
                <td className="px-3 py-2">{new Date(trade.opened_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTransactions = (rows: TransactionPublic[]) => {
    if (!rows.length) {
      return <p className="text-sm text-fg-tertiary">{emptyStateMessage}</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-secondary">
          <thead>
            <tr className="text-left text-xs uppercase text-fg-tertiary">
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Executed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary text-sm text-fg-secondary">
            {rows.map((tx) => (
              <tr key={tx.id}>
                <td className="px-3 py-2 capitalize">{tx.transaction_type}</td>
                <td className="px-3 py-2">{formatCurrency(tx.amount)}</td>
                <td className="px-3 py-2">
                  <Badge
                    type="color"
                    size="sm"
                    color={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'brand' : 'error'}
                  >
                    {tx.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">{new Date(tx.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{tx.executed_at ? new Date(tx.executed_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg-secondary">
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-display-xs font-semibold text-fg-primary">Welcome back{user?.full_name ? `, ${user.full_name}` : ''}</h1>
            <p className="text-md text-fg-tertiary">Track your trading performance and account activity in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge type="color" size="sm" color={user?.kyc_status === 'approved' ? 'success' : 'warning'}>
              KYC: {user?.kyc_status ?? 'pending'}
            </Badge>
            <Button color="secondary" size="md" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-8">
        {isLoading ? (
          <div className="flex h-60 items-center justify-center">
            <Activity className="size-6 animate-spin text-fg-tertiary" />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.title} className="rounded-lg border border-border-secondary bg-bg-primary p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-fg-tertiary">{stat.title}</p>
                      <p className="mt-2 text-lg font-semibold text-fg-primary">{stat.value}</p>
                    </div>
                    <div className="rounded-lg bg-bg-secondary p-2">
                      <stat.icon className="size-5 text-fg-secondary" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-fg-tertiary">{stat.changeLabel}</p>
                  <p className="text-sm font-medium text-fg-secondary">{stat.change}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-fg-primary">Daily Performance</h2>
                  <Badge type="color" size="sm" color={latestDailyProfit >= 0 ? 'success' : 'error'}>
                    {formatCurrency(latestDailyProfit)} today
                  </Badge>
                </div>
                <div className="mt-4 space-y-4">
                  {renderDailyPerformance(dailyPerformance)}
                </div>
              </div>

              <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
                <h2 className="text-lg font-semibold text-fg-primary">Account Overview</h2>
                <div className="mt-4 space-y-3 text-sm text-fg-secondary">
                  <div className="flex justify-between">
                    <span>Account tier</span>
                    <Badge type="color" size="sm" color="brand">
                      {user?.account_tier ?? 'basic'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total trades</span>
                    <span>{summary?.total_trades ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Winning trades</span>
                    <span>{summary?.winning_trades ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Losing trades</span>
                    <span>{summary?.losing_trades ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win rate</span>
                    <span>{formatPercent(summary?.win_rate ?? 0)}</span>
                  </div>
                  {user?.kyc_notes && (
                    <div className="rounded-md bg-warning-50 p-3 text-xs text-warning-600">
                      <p className="font-medium">KYC note</p>
                      <p>{user.kyc_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
              <Tabs>
                <Tabs.List
                  items={[
                    { id: 'trades', children: 'Trades' },
                    { id: 'transactions', children: 'Transactions' },
                  ]}
                />
                <Tabs.Panel id="trades" className="mt-6">
                  {renderTrades(trades)}
                </Tabs.Panel>
                <Tabs.Panel id="transactions" className="mt-6">
                  {renderTransactions(transactions)}
                </Tabs.Panel>
              </Tabs>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};
