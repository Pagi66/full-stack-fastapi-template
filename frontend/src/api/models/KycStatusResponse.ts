import type { KycStatus } from './KycSubmissionResponse';

export type KycStatusResponse = {
  status: KycStatus;
  submitted_at?: string | null;
  approved_at?: string | null;
  rejected_reason?: string | null;
  notes?: string | null;
};