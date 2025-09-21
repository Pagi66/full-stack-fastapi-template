/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Message } from '../models/Message';
import type { TransactionCreate } from '../models/TransactionCreate';
import type { TransactionPublic } from '../models/TransactionPublic';
import type { TransactionsPublic } from '../models/TransactionsPublic';
import type { TransactionUpdate } from '../models/TransactionUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionsService {
    /**
     * Read Transactions
     * Retrieve transactions. Superusers see all transactions; regular users only their own.
     * @param skip
     * @param limit
     * @returns TransactionsPublic Successful Response
     * @throws ApiError
     */
    public static transactionsReadTransactions(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<TransactionsPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/transactions/',
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
     * Create Transaction
     * Create a new transaction for the current user.
     * @param requestBody
     * @returns TransactionPublic Successful Response
     * @throws ApiError
     */
    public static transactionsCreateTransaction(
        requestBody: TransactionCreate,
    ): CancelablePromise<TransactionPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/transactions/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read Transaction
     * Get a transaction by ID.
     * @param id
     * @returns TransactionPublic Successful Response
     * @throws ApiError
     */
    public static transactionsReadTransaction(
        id: string,
    ): CancelablePromise<TransactionPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/transactions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Transaction
     * Update a transaction. Owners can update their transactions; superusers can update any.
     * @param id
     * @param requestBody
     * @returns TransactionPublic Successful Response
     * @throws ApiError
     */
    public static transactionsUpdateTransaction(
        id: string,
        requestBody: TransactionUpdate,
    ): CancelablePromise<TransactionPublic> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/transactions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete Transaction
     * Delete a transaction.
     * @param id
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static transactionsDeleteTransaction(
        id: string,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/transactions/{id}',
            path: {
                'id': id,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update transaction status. Admins can approve or fail pending transactions.
     * @param id
     * @param status
     * @returns TransactionPublic Successful Response
     * @throws ApiError
     */
    public static transactionsUpdateStatus(
        id: string,
        status: 'pending' | 'completed' | 'failed',
    ): CancelablePromise<TransactionPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/transactions/{id}/status',
            path: {
                'id': id,
            },
            query: {
                'status': status,
            },
            errors: {
                403: `Not enough permissions`,
                404: `Transaction not found`,
                422: `Validation Error`,
            },
        });
    }
}
