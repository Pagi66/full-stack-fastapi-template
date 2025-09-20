/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserPublic = {
    email: string;
    is_active?: boolean;
    is_superuser?: boolean;
    full_name?: (string | null);
    id: string;
    balance?: number;
    role: 'admin' | 'user';
    account_tier: string;
    kyc_status: string;
    kyc_verified_at?: (string | null);
    kyc_notes?: (string | null);
    last_login_at?: (string | null);
};


