import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
} from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Avatar } from "@/components/base/avatar/avatar";
import {
  UsersService,
} from "@/api/services/UsersService";
import type { UserPublic } from "@/api/models/UserPublic";
import { useAuth } from "@/providers/auth-provider";
import {
  Activity,
  CheckVerified01,
  Shield01,
  UserCheck02,
  Users03,
} from "@untitledui/icons";
import { format } from "date-fns";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => UsersService.usersReadUsers(0, 100),
  });

  const users = usersQuery.data?.data ?? [];

  const approveKyc = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string | null }) =>
      UsersService.usersKycDecision(id, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const updateBalance = useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      UsersService.usersUpdateUserBalance(id, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role, account_tier }: { id: string; role?: 'admin' | 'user'; account_tier?: string }) =>
      UsersService.usersUpdateRole(id, { role, account_tier }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.is_active).length;
    const kycPending = users.filter((u) => u.kyc_status === 'pending').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    return [
      {
        label: 'Total users',
        value: total,
        icon: Users03,
      },
      {
        label: 'Active accounts',
        value: active,
        icon: UserCheck02,
      },
      {
        label: 'KYC pending',
        value: kycPending,
        icon: Shield01,
      },
      {
        label: 'Administrators',
        value: admins,
        icon: CheckVerified01,
      },
    ];
  }, [users]);

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

  const handleKycDecision = (target: UserPublic, status: 'approved' | 'rejected') => {
    approveKyc.mutate({ id: target.id, status, notes: status === 'rejected' ? 'Rejected via admin dashboard' : undefined });
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

        <section className="rounded-lg border border-border-secondary bg-bg-primary p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-fg-primary">User directory</h2>
              <p className="text-sm text-fg-tertiary">Approve KYC, adjust balances, or promote users.</p>
            </div>
            <ButtonUtility
              icon={Activity}
              tooltip="Refresh"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
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
                            <p className="font-medium text-fg-primary">{item.email}</p>
                            <p className="text-xs text-fg-tertiary">{item.full_name ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge type="color" size="sm" color={item.role === 'admin' ? 'brand' : 'secondary'}>
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
                        {item.last_login_at ? format(new Date(item.last_login_at), 'PPP p') : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button color="secondary" size="xs" onClick={() => handleBalanceAdjust(item)}>
                            Adjust balance
                          </Button>
                          <Button color="secondary" size="xs" onClick={() => handleRoleToggle(item)}>
                            Set {item.role === 'admin' ? 'user' : 'admin'}
                          </Button>
                          <Button color="secondary" size="xs" onClick={() => handleTierUpdate(item)}>
                            Update tier
                          </Button>
                          <Button
                            color="success"
                            size="xs"
                            disabled={item.kyc_status === 'approved'}
                            onClick={() => handleKycDecision(item, 'approved')}
                          >
                            Approve KYC
                          </Button>
                          <Button
                            color="warning"
                            size="xs"
                            disabled={item.kyc_status === 'rejected'}
                            onClick={() => handleKycDecision(item, 'rejected')}
                          >
                            Reject KYC
                          </Button>
                          <Button
                            color="secondary"
                            size="xs"
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
                <dd className="text-sm text-fg-primary">{selectedUser.kyc_notes ?? '—'}</dd>
              </div>
            </dl>
          </section>
        )}
      </main>
    </div>
  );
};
