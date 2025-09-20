/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type AccountSummary = {
    id: string;
    user_id: string;
    total_deposits: number;
    total_withdrawals: number;
    net_profit: number;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    updated_at: string;
};

export type DailyPerformanceEntry = {
    id: string;
    user_id: string;
    performance_date: string;
    profit_loss: number;
    created_at: string;
};

export type TradesCollectionEntry = {
    id: string;
    user_id: string;
    symbol: string;
    side: 'buy' | 'sell';
    entry_price: number;
    exit_price?: number | null;
    volume: number;
    profit_loss?: number | null;
    status: 'open' | 'closed' | 'cancelled';
    opened_at: string;
    closed_at?: string | null;
    notes?: string | null;
};

export type Paginated<T> = {
    data: Array<T>;
    count: number;
};

export class PortfolioService {
    /**
     * Retrieve account summary for a user
     * @param userId
     */
    public static accountSummary(
        userId: string,
    ): CancelablePromise<AccountSummary> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}/account-summary',
            path: {
                'user_id': userId,
            },
            errors: {
                404: `Account summary not available`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Daily profit performance timeline
     */
    public static dailyPerformance(
        skip?: number,
        limit: number = 30,
    ): CancelablePromise<Paginated<DailyPerformanceEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/performance/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Trades taken by the authenticated user
     */
    public static trades(
        skip?: number,
        limit: number = 20,
    ): CancelablePromise<Paginated<TradesCollectionEntry>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/trades/',
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
