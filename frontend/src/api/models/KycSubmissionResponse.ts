import type { UserProfilePublic } from './UserProfilePublic';

export type KycStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type KycSubmissionResponse = {
  profile: UserProfilePublic;
  status: KycStatus;
  submitted_at?: string | null;
};