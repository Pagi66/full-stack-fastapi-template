/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BalanceResponse } from '../models/BalanceResponse';
import type { Message } from '../models/Message';
import type { UpdatePassword } from '../models/UpdatePassword';
import type { UserCreate } from '../models/UserCreate';
import type { UserPublic } from '../models/UserPublic';
import type { UserRegister } from '../models/UserRegister';
import type { UsersPublic } from '../models/UsersPublic';
import type { UserUpdate } from '../models/UserUpdate';
import type { UserUpdateMe } from '../models/UserUpdateMe';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Read Users
     * Retrieve users.
     * @param skip
     * @param limit
     * @returns UsersPublic Successful Response
     * @throws ApiError
     */
    public static usersReadUsers(
        skip?: number,
        limit: number = 100,
    ): CancelablePromise<UsersPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/',
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
     * Create User
     * Create new user.
     * @param requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static usersCreateUser(
        requestBody: UserCreate,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read User Me
     * Get current user.
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static usersReadUserMe(): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/me',
        });
    }
    /**
     * Delete User Me
     * Delete own user.
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static usersDeleteUserMe(): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/me',
        });
    }
    /**
     * Update User Me
     * Update own user.
     * @param requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static usersUpdateUserMe(
        requestBody: UserUpdateMe,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update Password Me
     * Update own password.
     * @param requestBody
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static usersUpdatePasswordMe(
        requestBody: UpdatePassword,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/me/password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Register User
     * Create new user without the need to be logged in.
     * @param requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static usersRegisterUser(
        requestBody: UserRegister,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read User By Id
     * Get a specific user by id.
     * @param userId
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static usersReadUserById(
        userId: string,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User
     * Update a user.
     * @param userId
     * @param requestBody
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static usersUpdateUser(
        userId: string,
        requestBody: UserUpdate,
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Delete User
     * Delete a user.
     * @param userId
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static usersDeleteUser(
        userId: string,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/users/{user_id}',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Read User Balance
     * Retrieve a user's balance. Owners can read their balance; superusers can read any.
     * @param userId
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static usersReadUserBalance(
        userId: string,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}/balance',
            path: {
                'user_id': userId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update User Balance
     * Update a user's balance. Only superusers can update other users. Users may update their own balance.
     * @param userId
     * @param amount
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static usersUpdateUserBalance(
        userId: string,
        amount: number,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}/balance',
            path: {
                'user_id': userId,
            },
            query: {
                'amount': amount,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Adjust user balance (admin only)
     */
    public static usersUpdateUserBalance(
        userId: string,
        requestBody: { amount: number; description?: string | null },
    ): CancelablePromise<BalanceResponse> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}/balance',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Submit KYC decision for a user
     */
    public static usersKycDecision(
        userId: string,
        requestBody: { status: string; notes?: string | null },
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/users/{user_id}/kyc/decision',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Update role or tier for a user
     */
    public static usersUpdateRole(
        userId: string,
        requestBody: { role?: 'admin' | 'user'; account_tier?: string; is_active?: boolean },
    ): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/v1/users/{user_id}/role',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
                422: `Validation Error`,
            },
        });
    }
}
