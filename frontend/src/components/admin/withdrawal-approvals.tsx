import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/base/buttons/button';
import { Badge } from '@/components/base/badges/badges';
import { Avatar } from '@/components/base/avatar/avatar';
import { AdminService } from '@/api/services/AdminService';

interface PendingWithdrawal {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

export const WithdrawalApprovals: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: pendingWithdrawals, isLoading } = useQuery({
    queryKey: ['admin-pending-withdrawals'],
    queryFn: () => AdminService.adminGetPendingWithdrawals(),
  });

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) =>
      AdminService.adminApproveWithdrawal(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      AdminService.adminRejectWithdrawal(transactionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(new Date(value));

  const handleApprove = (withdrawal: PendingWithdrawal) => {
    if (window.confirm(`Approve withdrawal of ${formatCurrency(withdrawal.amount)} for ${withdrawal.email}?`)) {
      approveMutation.mutate(withdrawal.id);
    }
  };

  const handleReject = (withdrawal: PendingWithdrawal) => {
    const reason = window.prompt('Enter rejection reason:', 'Insufficient funds');
    if (reason) {
      rejectMutation.mutate({
        transactionId: withdrawal.id,
        reason,
      });
    }
  };

  const withdrawals = pendingWithdrawals?.data || [];

  return (
    <div className="w-full rounded-2xl border border-secondary bg-secondary p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary">Withdrawal Approvals</h3>
        <p className="text-sm text-tertiary">
          Review and approve pending withdrawal requests from copy trading balances
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-tertiary mt-2">Loading withdrawals...</p>
          </div>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-tertiary mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-tertiary">No pending withdrawal requests</p>
          <p className="text-sm text-tertiary mt-1">All withdrawal requests have been processed</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Badge type="color" size="sm" color="warning">
              {withdrawals.length} pending
            </Badge>
            <Button
              color="secondary"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-pending-withdrawals'] })}
            >
              Refresh
            </Button>
          </div>

          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="p-4 border border-border-secondary rounded-lg bg-primary hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Avatar 
                      size="sm" 
                      initials={withdrawal.email.slice(0, 2).toUpperCase()} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-primary truncate">
                          {withdrawal.email}
                        </p>
                        <Badge type="color" size="sm" color="brand">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-tertiary mb-1">
                        {withdrawal.description}
                      </p>
                      <p className="text-xs text-tertiary">
                        Requested {formatDateTime(withdrawal.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-primary mb-2">
                      {formatCurrency(withdrawal.amount)}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        color="success"
                        size="sm"
                        isLoading={approveMutation.isPending && approveMutation.variables === withdrawal.id}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        onClick={() => handleApprove(withdrawal)}
                      >
                        Approve
                      </Button>
                      <Button
                        color="primary-destructive"
                        size="sm"
                        isLoading={rejectMutation.isPending && rejectMutation.variables?.transactionId === withdrawal.id}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        onClick={() => handleReject(withdrawal)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(approveMutation.isError || rejectMutation.isError) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            {approveMutation.error instanceof Error
              ? approveMutation.error.message
              : rejectMutation.error instanceof Error
              ? rejectMutation.error.message
              : 'An error occurred'}
          </p>
        </div>
      )}

      {(approveMutation.isSuccess || rejectMutation.isSuccess) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Withdrawal request processed successfully.
          </p>
        </div>
      )}
    </div>
  );
};
