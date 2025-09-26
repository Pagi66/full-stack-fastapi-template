/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TraderCreateRequest = {
    user_id: string;
    display_name: string;
    specialty: string;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    trading_strategy?: (string | null);
    is_public?: boolean;
    copy_fee_percentage?: number;
    minimum_copy_amount?: number;
};
