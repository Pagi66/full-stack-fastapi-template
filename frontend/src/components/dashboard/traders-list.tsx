import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Avatar } from "@/components/base/avatar/avatar";
import { TraderService } from "@/api/services/TraderService";
import type { TraderProfilePublic } from "@/api/models/TraderProfilePublic";
import { Activity, Users03 } from "@untitledui/icons";

const formatDateTime = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'N/A';

const formatRiskLevel = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
  switch (risk) {
    case 'LOW':
      return { label: 'Low Risk', color: 'success' as const };
    case 'MEDIUM':
      return { label: 'Medium Risk', color: 'warning' as const };
    case 'HIGH':
      return { label: 'High Risk', color: 'error' as const };
    default:
      return { label: 'Unknown', color: 'gray' as const };
  }
};

const extractSpecialtyFromStrategy = (strategy?: string | null) => {
  if (!strategy) return 'General';
  
  // Strategy is in format "{specialty} trading specialist"
  const match = strategy.match(/^(\w+)\s+trading specialist$/);
  return match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : 'General';
};

const generateTraderCodeFromId = (id: string): string => {
  // Generate a consistent 6-8 character code from the trader ID
  const hash = id.replace(/-/g, '').slice(0, 8).toUpperCase();
  return hash.padEnd(6, 'X').slice(0, 8);
};

interface TradersListProps {
  className?: string;
}

export const TradersList = ({ className }: TradersListProps) => {
  const tradersQuery = useQuery({
    queryKey: ["admin-traders"],
    queryFn: () => TraderService.tradersReadTraders(0, 100),
  });

  const traders = tradersQuery.data?.data ?? [];

  const handleRefresh = () => {
    tradersQuery.refetch();
  };

  const handleEditTrader = (traderId: string) => {
    // TODO: Implement trader editing functionality
    console.log('Edit trader:', traderId);
  };

  const handleDeleteTrader = (traderId: string) => {
    // TODO: Implement trader deletion functionality
    if (window.confirm('Are you sure you want to delete this trader?')) {
      console.log('Delete trader:', traderId);
    }
  };

  return (
    <div className={`rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg-primary">Active Traders</h2>
          <p className="text-sm text-fg-tertiary">Manage trader profiles and their copy trading settings.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge type="color" size="sm" color="brand">
            {traders.length} traders
          </Badge>
          <ButtonUtility
            icon={Activity}
            tooltip="Refresh"
            onClick={handleRefresh}
          />
        </div>
      </div>

      {tradersQuery.isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Activity className="size-5 animate-spin text-fg-tertiary" />
        </div>
      ) : traders.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <Users03 className="size-12 text-fg-tertiary mb-3" />
          <p className="text-sm text-fg-tertiary">No traders have been created yet.</p>
          <p className="text-xs text-fg-tertiary mt-1">
            Use the Trader Manager to create trader profiles.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-secondary">
            <thead>
              <tr className="text-left text-xs uppercase text-fg-tertiary">
                <th className="px-3 py-2">Trader</th>
                <th className="px-3 py-2">Specialty</th>
                <th className="px-3 py-2">Risk Level</th>
                <th className="px-3 py-2">Trader Code</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-secondary text-sm text-fg-secondary">
              {traders.map((trader: TraderProfilePublic) => {
                const riskInfo = formatRiskLevel(trader.risk_tolerance);
                const specialty = extractSpecialtyFromStrategy(trader.trading_strategy);
                const traderCode = generateTraderCodeFromId(trader.id);
                
                return (
                  <tr key={trader.id}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar 
                          size="xs" 
                          initials={specialty.slice(0, 2).toUpperCase()} 
                        />
                        <div>
                          <p className="text-sm font-medium text-fg-primary">
                            Trader {traderCode}
                          </p>
                          <p className="text-xs text-fg-tertiary">
                            User ID: {trader.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge type="color" size="sm" color="brand">
                        {specialty}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge type="color" size="sm" color={riskInfo.color}>
                        {riskInfo.label}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-fg-primary">
                      {traderCode}
                    </td>
                    <td className="px-3 py-3">
                      <Badge 
                        type="color" 
                        size="sm" 
                        color={trader.is_public ? "success" : "gray"}
                      >
                        {trader.is_public ? "Public" : "Private"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-fg-tertiary">
                      {formatDateTime(trader.created_at)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          color="secondary" 
                          size="sm" 
                          onClick={() => handleEditTrader(trader.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          color="primary-destructive" 
                          size="sm" 
                          onClick={() => handleDeleteTrader(trader.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
