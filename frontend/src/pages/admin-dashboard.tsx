import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Badge,
} from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Avatar } from "@/components/base/avatar/avatar";
import { TradersList } from "@/components/dashboard/traders-list";
import { AdminService } from "@/api/services/AdminService";
import { TransactionsService } from "@/api/services/TransactionsService";
import {
  UsersService,
} from "@/api/services/UsersService";
import type { UserPublic } from "@/api/models/UserPublic";
import { useAuth } from "@/providers/auth-provider";
import {
  Activity,
  CheckVerified01,
  LogOut01,
  UserCheck02,
  Users03,
} from "@untitledui/icons";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatDateTime = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'N/A';

const formatLabel = (value?: string | null) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '—';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => AdminService.adminGetDashboard(),
  });

  const dashboard = dashboardQuery.data;
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UsersService.usersReadUsers(0, 100),
  });

  const users = usersQuery.data?.data ?? [];
  const onlineUsers = dashboard?.online_users ?? [];
  const pendingKycQueue = dashboard?.pending_kyc ?? [];
  const pendingDeposits = dashboard?.pending_deposits ?? [];

  const onlineUserIds = useMemo(() => new Set(onlineUsers.map((entry) => entry.id)), [onlineUsers]);

  const approveKyc = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string | null }) =>
      UsersService.usersKycDecision(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const updateBalance = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      UsersService.usersUpdateUserBalance(id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role, account_tier }: { id: string; role?: 'admin' | 'user'; account_tier?: string }) =>
      UsersService.usersUpdateRole(id, { role, account_tier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const updateTransactionStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'completed' | 'failed' }) =>
      TransactionsService.transactionsUpdateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const submitKycDecision = (id: string, status: 'approved' | 'rejected', notes?: string | null) => {
    approveKyc.mutate({ id, status, notes });
  };

  const handleKycDecision = (target: UserPublic, status: 'approved' | 'rejected') => {
    submitKycDecision(
      target.id,
      status,
      status === 'rejected' ? 'Rejected via admin dashboard' : undefined,
    );
  };

  const handleKycReviewApprove = (id: string) => submitKycDecision(id, 'approved');

  const handleKycReviewReject = (id: string) => {
    const note = window.prompt('Add rejection note', 'Documents incomplete');
    submitKycDecision(id, 'rejected', note ?? 'Rejected via admin dashboard');
  };

  const handleDepositApproval = (id: string) =>
    updateTransactionStatus.mutate({ id, status: 'completed' });

  const handleDepositFailure = (id: string) =>
    updateTransactionStatus.mutate({ id, status: 'failed' });

  const isApprovingKyc = approveKyc.isPending;
  const isUpdatingTransaction = updateTransactionStatus.isPending;

  const stats = useMemo(() => {
    const totals = dashboard?.totals;
    return [
      {
        label: 'Total users',
        value: (totals?.total_users ?? users.length).toLocaleString(),
        icon: Users03,
      },
      {
        label: 'Total deposits',
        value: formatCurrency(totals?.total_deposits ?? 0),
        icon: Activity,
      },
      {
        label: 'Total withdrawals',
        value: formatCurrency(totals?.total_withdrawals ?? 0),
        icon: CheckVerified01,
      },
      {
        label: 'Online now',
        value: onlineUsers.length.toString(),
        icon: UserCheck02,
      },
    ];
  }, [dashboard, onlineUsers.length, users.length]);

  const handleBalanceAdjust = (target: UserPublic) => {
    const input = window.prompt(`Set new balance for ${target.email}`, String(target.balance ?? 0));
    if (input === null) {
      return;
    }
    const parsed = Number(input);
    if (Number.isNaN(parsed)) {
      window.alert('Please enter a numeric value.');
      return;
    }
    updateBalance.mutate({ id: target.id, amount: parsed });
  };

  const handleRoleToggle = (target: UserPublic) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    updateRole.mutate({ id: target.id, role: nextRole });
  };

  const handleTierUpdate = (target: UserPublic) => {
    const input = window.prompt('Enter new account tier (basic, standard, premium, vip)', target.account_tier);
    if (!input) {
      return;
    }
    updateRole.mutate({ id: target.id, account_tier: input.toLowerCase() });
  };


  return (
    <div className="min-h-screen bg-bg-secondary">
      <header className="border-b border-border-secondary bg-bg-primary px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-display-xs font-semibold text-fg-primary">Admin control center</h1>
            <p className="text-md text-fg-tertiary">Manage users, review KYC statuses, and keep portfolios up to date.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge type="color" size="sm" color="brand">
              {user?.email ?? 'admin'}
            </Badge>
            <Button
              color="primary-destructive"
              size="sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  logout();
                }
              }}
              className="flex items-center gap-2"
            >
              <LogOut01 className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="space-y-8 px-6 py-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border-secondary bg-bg-primary p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-fg-tertiary">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-fg-primary">{stat.value}</p>
                </div>
                <div className="rounded-lg bg-bg-secondary p-2">
                  <stat.icon className="size-5 text-fg-secondary" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Admin Navigation */}
        <section className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
          <h2 className="text-lg font-semibold text-fg-primary mb-4">Admin Tools</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Link to="/admin/trader-manager">
              <div className="rounded-lg border border-border-secondary bg-bg-secondary p-4 hover:bg-bg-tertiary transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-100 p-2">
                    <Users03 className="size-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-fg-primary">Trader Manager</h3>
                    <p className="text-sm text-fg-tertiary">Create and manage trader profiles</p>
                  </div>
                </div>
              </div>
            </Link>
            <div className="rounded-lg border border-border-secondary bg-bg-secondary p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Activity className="size-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-fg-primary">System Analytics</h3>
                  <p className="text-sm text-fg-tertiary">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-fg-primary">Online users</h2>
              <p className="text-sm text-fg-tertiary">Active within the last 15 minutes.</p>
            </div>
            <Badge type="color" size="sm" color="success">
              {onlineUsers.length} online
            </Badge>
          </div>
          {dashboardQuery.isLoading ? (
            <div className="flex h-24 items-center justify-center text-sm text-fg-tertiary">
              Loading online users...
            </div>
          ) : onlineUsers.length === 0 ? (
            <p className="text-sm text-fg-tertiary">No users are currently online.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {onlineUsers.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-md border border-border-secondary bg-bg-secondary/60 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="xs" initials={entry.email.slice(0, 2).toUpperCase()} />
                    <div>
                      <p className="text-sm font-medium text-fg-primary">{entry.email}</p>
                      <p className="text-xs text-fg-tertiary">
                        {formatLabel(entry.account_tier)} · {formatLabel(entry.role)}
                      </p>
                    </div>
                  </div>
                  <Badge type="color" size="sm" color="success">
                    Online
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fg-primary">KYC review queue</h2>
                <p className="text-sm text-fg-tertiary">Review uploaded documents and approve or reject.</p>
              </div>
              <Badge type="color" size="sm" color="warning">
                {pendingKycQueue.length} pending
              </Badge>
            </div>
            {dashboardQuery.isLoading ? (
              <div className="flex h-24 items-center justify-center text-sm text-fg-tertiary">
                Loading KYC submissions...
              </div>
            ) : pendingKycQueue.length === 0 ? (
              <p className="text-sm text-fg-tertiary">No KYC submissions waiting for review.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-secondary text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-fg-tertiary">
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Notes</th>
                      <th className="px-3 py-2">Last activity</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-secondary text-fg-secondary">
                    {pendingKycQueue.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar size="xs" initials={entry.email.slice(0, 2).toUpperCase()} />
                            <div>
                              <p className="text-sm font-medium text-fg-primary">{entry.email}</p>
                              <p className="text-xs text-fg-tertiary">{entry.full_name ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm">{entry.kyc_notes ?? 'Awaiting review'}</td>
                        <td className="px-3 py-3 text-xs text-fg-tertiary">
                          {formatDateTime(entry.last_login_at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              color="primary"
                              size="sm"
                              disabled={isApprovingKyc}
                              onClick={() => handleKycReviewApprove(entry.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              color="primary-destructive"
                              size="sm"
                              disabled={isApprovingKyc}
                              onClick={() => handleKycReviewReject(entry.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fg-primary">Deposit approvals</h2>
                <p className="text-sm text-fg-tertiary">Approve cleared deposits so balances update immediately.</p>
              </div>
              <Badge type="color" size="sm" color="brand">
                {pendingDeposits.length} awaiting
              </Badge>
            </div>
            {dashboardQuery.isLoading ? (
              <div className="flex h-24 items-center justify-center text-sm text-fg-tertiary">
                Loading deposits...
              </div>
            ) : pendingDeposits.length === 0 ? (
              <p className="text-sm text-fg-tertiary">No deposits are waiting for approval.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-secondary text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-fg-tertiary">
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Submitted</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-secondary text-fg-secondary">
                    {pendingDeposits.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar size="xs" initials={entry.email.slice(0, 2).toUpperCase()} />
                            <div>
                              <p className="text-sm font-medium text-fg-primary">{entry.email}</p>
                              <p className="text-xs text-fg-tertiary">{formatLabel(entry.transaction_type)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">{formatCurrency(entry.amount)}</td>
                        <td className="px-3 py-3 text-xs text-fg-tertiary">
                          {formatDateTime(entry.created_at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              color="primary"
                              size="sm"
                              disabled={isUpdatingTransaction}
                              onClick={() => handleDepositApproval(entry.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              color="secondary"
                              size="sm"
                              disabled={isUpdatingTransaction}
                              onClick={() => handleDepositFailure(entry.id)}
                            >
                              Mark failed
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-fg-primary">User directory</h2>
              <p className="text-sm text-fg-tertiary">Approve KYC, adjust balances, or promote users.</p>
            </div>
            <ButtonUtility
              icon={Activity}
              tooltip="Refresh"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['admin-users'] });
                queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
              }}
            />
          </div>

          {usersQuery.isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Activity className="size-5 animate-spin text-fg-tertiary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-secondary">
                <thead>
                  <tr className="text-left text-xs uppercase text-fg-tertiary">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Tier</th>
                    <th className="px-3 py-2">Balance</th>
                    <th className="px-3 py-2">KYC status</th>
                    <th className="px-3 py-2">Last login</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary text-sm text-fg-secondary">
                  {users.map((item) => (
                    <tr key={item.id} className={selectedUser?.id === item.id ? 'bg-bg-secondary' : ''}>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="xs" initials={item.email.slice(0, 2).toUpperCase()} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-fg-primary">{item.email}</p>
                              {onlineUserIds.has(item.id) && (
                                <Badge type="color" size="sm" color="success">
                                  Online
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-fg-tertiary">{item.full_name ?? 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge type="color" size="sm" color={item.role === 'admin' ? 'brand' : 'gray'}>
                          {item.role}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 capitalize">{item.account_tier}</td>
                      <td className="px-3 py-3">{formatCurrency(item.balance ?? 0)}</td>
                      <td className="px-3 py-3">
                        <Badge
                          type="color"
                          size="sm"
                          color={item.kyc_status === 'approved' ? 'success' : item.kyc_status === 'pending' ? 'warning' : 'error'}
                        >
                          {item.kyc_status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-xs text-fg-tertiary">
                        {formatDateTime(item.last_login_at)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button color="secondary" size="sm" onClick={() => handleBalanceAdjust(item)}>
                            Adjust balance
                          </Button>
                          <Button color="secondary" size="sm" onClick={() => handleRoleToggle(item)}>
                            Set {item.role === 'admin' ? 'user' : 'admin'}
                          </Button>
                          <Button color="secondary" size="sm" onClick={() => handleTierUpdate(item)}>
                            Update tier
                          </Button>
                          <Button
                            color="primary"
                            size="sm"
                            disabled={item.kyc_status === 'approved'}
                            onClick={() => handleKycDecision(item, 'approved')}
                          >
                            Approve KYC
                          </Button>
                          <Button
                            color="primary-destructive"
                            size="sm"
                            disabled={item.kyc_status === 'rejected'}
                            onClick={() => handleKycDecision(item, 'rejected')}
                          >
                            Reject KYC
                          </Button>
                          <Button
                            color="secondary"
                            size="sm"
                            onClick={() => setSelectedUser(item)}
                          >
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Active Traders Section */}
        <TradersList />

        {selectedUser && (
          <section className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-fg-primary">User details</h2>
                <p className="text-sm text-fg-tertiary">Recent information for {selectedUser.email}</p>
              </div>
              <Button color="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                Close
              </Button>
            </div>
            <dl className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase text-fg-tertiary">Account tier</dt>
                <dd className="text-sm text-fg-primary">{selectedUser.account_tier}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-fg-tertiary">Balance</dt>
                <dd className="text-sm text-fg-primary">{formatCurrency(selectedUser.balance ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-fg-tertiary">KYC status</dt>
                <dd className="text-sm text-fg-primary">{selectedUser.kyc_status}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-fg-tertiary">KYC notes</dt>
                <dd className="text-sm text-fg-primary">{selectedUser.kyc_notes ?? ''}</dd>
              </div>
            </dl>
          </section>
        )}
      </main>
    </div>
  );
};
