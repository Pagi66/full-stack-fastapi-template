import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/base/badges/badges';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Toggle } from '@/components/base/toggle/toggle';
import { UsersService } from '@/api/services/UsersService';
import { useAuth } from '@/providers/auth-provider';
import { Bell01, Lock01, ShieldTick, User01 } from '@untitledui/icons';
import { SecuritySettings } from './security-settings';

type TabId = 'profile' | 'security' | 'notifications' | 'privacy';

type ProfileForm = {
  full_name: string;
  email: string;
};

const ProfileSettings = ({
  initial,
  onUpdated,
}: {
  initial: ProfileForm;
  onUpdated: () => void;
}) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProfileForm>(initial);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: () => UsersService.usersUpdateUserMe({ full_name: form.full_name, email: form.email }),
    onSuccess: () => {
      setMessage('Profile updated successfully');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      onUpdated();
    },
    onError: (err: unknown) => {
      setMessage(null);
      setError(err instanceof Error ? err.message : 'Unable to update profile right now.');
    },
  });

  return (
    <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-fg-primary">Profile</h2>
        <p className="text-sm text-fg-tertiary">Keep your account details current so we can reach you if needed.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Full name"
          value={form.full_name}
          onChange={(value) => setForm((prev) => ({ ...prev, full_name: value }))}
          placeholder="Your name"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
          placeholder="you@example.com"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          color="primary"
          onClick={() => updateMutation.mutate()}
          isLoading={updateMutation.isPending}
          isDisabled={updateMutation.isPending}
        >
          Save changes
        </Button>
        <Button
          color="tertiary"
          onClick={() => {
            setForm(initial);
            setMessage(null);
            setError(null);
          }}
          isDisabled={updateMutation.isPending}
        >
          Reset
        </Button>
      </div>
      {message && <p className="text-sm text-success-600">{message}</p>}
      {error && <p className="text-sm text-error-600">{error}</p>}
    </div>
  );
};

const NotificationSettings = () => {
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-fg-primary">Notification Preferences</h2>
      <p className="text-sm text-fg-tertiary">Choose how you would like to hear from us.</p>
      <div className="space-y-4">
        <Toggle
          size="md"
          label="Email alerts"
          hint="Receive confirmations, trade updates, and portfolio summaries."
          isSelected={emailAlerts}
          onChange={setEmailAlerts}
        />
        <Toggle
          size="md"
          label="SMS notifications"
          hint="Get critical alerts delivered instantly to your phone."
          isSelected={smsAlerts}
          onChange={setSmsAlerts}
        />
      </div>
    </div>
  );
};

const PrivacySettings = () => (
  <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-fg-primary">Privacy Controls</h2>
    <p className="text-sm text-fg-tertiary">Manage how your data is shared across the Apex ecosystem.</p>
    <ul className="list-disc space-y-2 pl-6 text-sm text-fg-tertiary">
      <li>We never share your personal information without your consent.</li>
      <li>Download a copy of your data or request deletion by contacting support.</li>
      <li>Adjust marketing preferences at any time via Notification settings.</li>
    </ul>
  </div>
);

export const AccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const tabs: Array<{ id: TabId; label: string; icon: typeof User01 }> = [
    { id: 'profile', label: 'Profile', icon: User01 },
    { id: 'security', label: 'Security', icon: ShieldTick },
    { id: 'notifications', label: 'Notifications', icon: Bell01 },
    { id: 'privacy', label: 'Privacy', icon: Lock01 },
  ];

  const kycStatus = user?.kyc_status ?? 'PENDING';
  const kycBadge = useMemo(() => {
    switch (kycStatus) {
      case 'APPROVED':
        return { color: 'success' as const, label: 'Approved' };
      case 'UNDER_REVIEW':
        return { color: 'warning' as const, label: 'Under review' };
      case 'REJECTED':
        return { color: 'error' as const, label: 'Rejected' };
      default:
        return { color: 'warning' as const, label: 'Pending' };
    }
  }, [kycStatus]);

  if (!user) {
    return null;
  }

  const profileForm: ProfileForm = {
    full_name: user.full_name ?? '',
    email: user.email,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-fg-primary">Account settings</h1>
        <p className="text-sm text-fg-tertiary">Manage your profile, security, and communication preferences.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[250px,1fr]">
        <aside className="space-y-6">
          <nav className="space-y-2 rounded-2xl border border-border-secondary bg-secondary p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-solid/10 text-brand-solid ring-1 ring-brand-solid/30' : 'text-fg-tertiary hover:bg-bg-secondary'}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="space-y-3 rounded-2xl border border-border-secondary bg-secondary p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-fg-primary">KYC status</span>
              <Badge type="color" size="sm" color={kycBadge.color}>
                {kycBadge.label}
              </Badge>
            </div>
            <p className="text-xs text-fg-tertiary">
              {kycStatus === 'APPROVED'
                ? 'Your identity is verified. Enjoy full access to trading features.'
                : kycStatus === 'UNDER_REVIEW'
                ? 'We are reviewing your documents. You will receive an email once the process is complete.'
                : kycStatus === 'REJECTED'
                ? 'We were unable to verify your documents. Please resubmit updated information.'
                : 'Complete verification to unlock deposits and withdrawals.'}
            </p>
            {kycStatus !== 'APPROVED' && (
              <Link to="/kyc" className="inline-block">
                <Button size="sm" color="primary" className="w-full">
                  Continue verification
                </Button>
              </Link>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          {activeTab === 'profile' && <ProfileSettings initial={profileForm} onUpdated={() => undefined} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'privacy' && <PrivacySettings />}
        </section>
      </div>
    </div>
  );
};
