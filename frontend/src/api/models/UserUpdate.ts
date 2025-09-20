/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserUpdate = {
    email?: (string | null);
    is_active?: boolean;
    is_superuser?: boolean;
    full_name?: (string | null);
    password?: (string | null);
    role?: ('admin' | 'user');
    account_tier?: string;
    kyc_status?: string;
    kyc_notes?: (string | null);
};

