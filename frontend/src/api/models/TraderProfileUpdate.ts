/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TraderProfileUpdate = {
    display_name?: string;
    trader_code?: string;
    trading_strategy?: (string | null);
    risk_tolerance?: ('LOW' | 'MEDIUM' | 'HIGH');
    is_public?: boolean;
    copy_fee_percentage?: number;
    minimum_copy_amount?: number;
};
