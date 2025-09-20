/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionPublic = {
    amount: number;
    transaction_type: 'deposit' | 'withdrawal' | 'adjustment';
    status: ('pending' | 'completed' | 'failed');
    description?: (string | null);
    id: string;
    user_id: string;
    created_at: string;
    executed_at?: (string | null);
};

