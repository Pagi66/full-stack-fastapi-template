/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Message } from '../models/Message';
import type { TraderCreateRequest } from '../models/TraderCreateRequest';
import type { TraderCreateResponse } from '../models/TraderCreateResponse';
import type { TraderProfilePublic } from '../models/TraderProfilePublic';
import type { TraderProfilesPublic } from '../models/TraderProfilesPublic';
import type { TraderProfileUpdate } from '../models/TraderProfileUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TraderService {
    /**
     * Read Traders
     * Retrieve traders.
     * @param skip
     * @param limit
     * @returns TraderProfilesPublic Successful Response
     * @throws ApiError
     */
    public static tradersReadTraders(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<TraderProfilesPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/traders/',
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
     * Create Trader
     * Create new trader.
     * @param requestBody
     * @returns TraderCreateResponse Successful Response
     * @throws ApiError
     */
    public static tradersCreateTrader(
        requestBody: TraderCreateRequest,
    ): CancelablePromise<TraderCreateResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/traders/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Read Trader By Id
     * Get a specific trader by id.
     * @param traderId
     * @returns TraderProfilePublic Successful Response
     * @throws ApiError
     */
    public static tradersReadTraderById(
        traderId: string,
    ): CancelablePromise<TraderProfilePublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/traders/{trader_id}',
            path: {
                'trader_id': traderId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Trader
     * Update a trader.
     * @param traderId
     * @param requestBody
     * @returns TraderProfilePublic Successful Response
     * @throws ApiError
     */
    public static tradersUpdateTrader(
        traderId: string,
        requestBody: TraderProfileUpdate,
    ): CancelablePromise<TraderProfilePublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/traders/{trader_id}',
            path: {
                'trader_id': traderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Trader
     * Delete a trader.
     * @param traderId
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static tradersDeleteTrader(
        traderId: string,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/traders/{trader_id}',
            path: {
                'trader_id': traderId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
