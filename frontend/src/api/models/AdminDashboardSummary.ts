/* eslint-disable */
export type AdminDashboardTotals = {
  total_users: number;
  total_deposits: number;
  total_withdrawals: number;
};

export type AdminOnlineUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  account_tier?: string | null;
  last_login_at?: string | null;
};

export type AdminKycItem = {
  id: string;
  email: string;
  full_name?: string | null;
  kyc_status: string;
  kyc_notes?: string | null;
  last_login_at?: string | null;
};

export type AdminDepositItem = {
  id: string;
  user_id: string;
  email: string;
  amount: number;
  status: string;
  transaction_type: string;
  created_at: string;
};

export type AdminDashboardSummary = {
  totals: AdminDashboardTotals;
  online_users: AdminOnlineUser[];
  pending_kyc: AdminKycItem[];
  pending_deposits: AdminDepositItem[];
};
