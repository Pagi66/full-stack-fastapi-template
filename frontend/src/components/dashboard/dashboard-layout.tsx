import { type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Activity,
  BarChart01,
  Globe02,
  Settings01,
  ShieldTick,
  Users01,
  Wallet01,
  Zap,
} from "@untitledui/icons";

import TradingViewWidget from "@/components/trading-view-widget";
import { Badge } from "@/components/base/badges/badges";
import { BadgeGroup } from "@/components/base/badges/badge-groups";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/providers/auth-provider";

const navigationItems = [
  { icon: BarChart01, label: "Portfolio Overview", to: "/dashboard" },
  { icon: Wallet01, label: "Apex Wallet", to: "/dashboard/wallet" },
  { icon: Users01, label: "Pro Trader Network", to: "/dashboard/copy-trading" },
  { icon: Globe02, label: "Market Analysis", to: "/dashboard/markets" },
  { icon: Zap, label: "Live Executions", to: "/dashboard/executions" },
  { icon: Activity, label: "Trade History", to: "/dashboard/history" },
  { icon: ShieldTick, label: "Risk Management", to: "/dashboard/risk" },
  { icon: Settings01, label: "Account Settings", to: "/settings" },
  { icon: ShieldTick, label: "KYC Verification", to: "/kyc" },
];

interface DashboardLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
}

export const DashboardLayout = ({ children, isLoading = false }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  const normalizedPathname =
    pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;

  return (
    <div className="min-h-screen bg-primary">
      <div className="border-b border-secondary bg-gray-900/50 py-3">
        <div className="mx-auto max-w-7xl px-6">
          <TradingViewWidget compact />
        </div>
      </div>

      <header className="border-b border-secondary bg-primary px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <BadgeGroup
                size="lg"
                color="brand"
                theme="light"
                addonText="Live Trading"
                className="mb-2"
              >
                Portfolio Console
              </BadgeGroup>
              <h1 className="text-2xl font-semibold text-primary">
                Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
              </h1>
              <p className="text-tertiary">Live institutional trading dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge size="sm" color={user?.kyc_status === "APPROVED" ? "success" : "warning"}>
                <ShieldTick className="mr-1 h-3 w-3" />
                KYC: {user?.kyc_status ?? "pending"}
              </Badge>
              <Badge size="sm" color="brand">
                Tier: {user?.account_tier ?? "Starter"}
              </Badge>
              <Button color="secondary" size="md" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Activity className="h-8 w-8 animate-spin text-tertiary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">{children}</div>
            <div className="lg:col-span-4">
              <div className="w-full rounded-2xl border border-border-secondary bg-secondary p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-primary">Apex Console</h2>
                  <p className="text-sm text-tertiary">Institutional Trading</p>
                </div>
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive =
                      normalizedPathname === item.to ||
                      (item.to !== "/dashboard" && normalizedPathname.startsWith(`${item.to}/`));

                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={`flex items-center gap-3 rounded-lg p-3 text-sm transition-colors ${
                          isActive
                            ? "border border-brand-solid/20 bg-brand-solid/10 text-brand-solid"
                            : "text-tertiary hover:bg-primary hover:text-primary"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
