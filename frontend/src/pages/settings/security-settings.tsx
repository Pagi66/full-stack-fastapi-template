import { useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Toggle } from '@/components/base/toggle/toggle';

interface SecuritySettingsProps {
  onChangePassword?: () => void;
}

export const SecuritySettings = ({ onChangePassword }: SecuritySettingsProps) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="space-y-6 rounded-2xl border border-border-secondary bg-secondary p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-fg-primary">Security Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border-secondary bg-bg-primary p-4">
          <div>
            <h3 className="font-medium text-fg-primary">Password</h3>
            <p className="text-sm text-fg-tertiary">We recommend updating your password every few months.</p>
          </div>
          <Button size="sm" color="secondary" onClick={onChangePassword}>
            Change Password
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-secondary bg-bg-primary p-4">
          <div className="max-w-md">
            <h3 className="font-medium text-fg-primary">Two-Factor Authentication</h3>
            <p className="text-sm text-fg-tertiary">
              Add an extra layer of protection by requiring a verification code when signing in.
            </p>
          </div>
          <Toggle
            size="md"
            isSelected={twoFactorEnabled}
            onChange={setTwoFactorEnabled}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-secondary bg-bg-primary p-4">
          <div>
            <h3 className="font-medium text-fg-primary">Active Sessions</h3>
            <p className="text-sm text-fg-tertiary">Review devices that are currently logged in to your account.</p>
          </div>
          <Button size="sm" color="secondary">
            View Sessions
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border-secondary bg-bg-primary p-4">
          <div>
            <h3 className="font-medium text-fg-primary">API Access</h3>
            <p className="text-sm text-fg-tertiary">Generate and manage API keys for integrations.</p>
          </div>
          <Button size="sm" color="secondary">
            Manage API Keys
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-brand-muted bg-brand-muted/40 px-4 py-3 text-sm text-brand">
        <strong>Security best practices:</strong> Enable two-factor authentication, keep your password unique, and review your active sessions regularly.
      </div>
    </div>
  );
};
