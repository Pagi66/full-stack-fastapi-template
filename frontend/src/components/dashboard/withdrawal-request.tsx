import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { useAuth } from '@/providers/auth-provider';
import { CopyTradingService } from '@/api/services/CopyTradingService';

interface WithdrawalRequestProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const WithdrawalRequest: React.FC<WithdrawalRequestProps> = ({
  onSuccess,
  onError,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Withdrawal from copy trading');

  const withdrawalMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      CopyTradingService.copyTradingRequestWithdrawal({
        amount,
        description,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['copied-traders'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setAmount('');
      setDescription('Withdrawal from copy trading');
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseFloat(amount);
    if (amountValue <= 0 || isNaN(amountValue)) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    withdrawalMutation.mutate({
      amount: amountValue,
      description,
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Calculate available copy balance
  const copyBalance = user?.allocatedCopyBalance || 0;

  return (
    <div className="w-full rounded-2xl border border-secondary bg-secondary p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary">Request Withdrawal</h3>
        <p className="text-sm text-tertiary">
          Withdraw funds from your copy trading balance to your main balance
        </p>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-800">Available Copy Balance:</span>
          <span className="text-lg font-semibold text-blue-800">
            {formatCurrency(copyBalance)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Withdrawal Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full rounded-md border border-border-secondary bg-bg-primary px-3 py-2 text-sm text-fg-primary"
          />
          <p className="text-xs text-tertiary mt-1">
            Maximum: {formatCurrency(copyBalance)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Description
          </label>
          <Input
            value={description}
            onChange={setDescription}
            placeholder="Withdrawal from copy trading"
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          color="primary"
          isLoading={withdrawalMutation.isPending}
          disabled={withdrawalMutation.isPending || !amount || parseFloat(amount) <= 0}
          className="w-full"
        >
          Request Withdrawal
        </Button>

        {withdrawalMutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              {withdrawalMutation.error instanceof Error
                ? withdrawalMutation.error.message
                : 'Failed to request withdrawal'}
            </p>
          </div>
        )}

        {withdrawalMutation.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Withdrawal request submitted successfully. Awaiting admin approval.
            </p>
          </div>
        )}
      </form>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Withdrawal requests require admin approval. 
          Approved amounts will be transferred from your copy trading balance to your main balance.
        </p>
      </div>
    </div>
  );
};
