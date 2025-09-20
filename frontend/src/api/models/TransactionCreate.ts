/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TransactionCreate = {
    amount: number;
    transaction_type: 'deposit' | 'withdrawal' | 'adjustment';
    status?: ('pending' | 'completed' | 'failed');
    description?: (string | null);
    user_id?: string;
};

