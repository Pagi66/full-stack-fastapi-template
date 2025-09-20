/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_login_login_access_token } from '../models/Body_login_login_access_token';
import type { Message } from '../models/Message';
import type { NewPassword } from '../models/NewPassword';
import type { Token } from '../models/Token';
import type { UserPublic } from '../models/UserPublic';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoginService {
    /**
     * Login Access Token
     * OAuth2 compatible token login, get an access token for future requests
     * @param formData
     * @returns Token Successful Response
     * @throws ApiError
     */
    public static loginLoginAccessToken(
        formData: Body_login_login_access_token,
    ): CancelablePromise<Token> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/login/access-token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Test Token
     * Test access token
     * @returns UserPublic Successful Response
     * @throws ApiError
     */
    public static loginTestToken(): CancelablePromise<UserPublic> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/login/test-token',
        });
    }
    /**
     * Recover Password
     * Password Recovery
     * @param email
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static loginRecoverPassword(
        email: string,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/password-recovery/{email}',
            path: {
                'email': email,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Reset Password
     * Reset password
     * @param requestBody
     * @returns Message Successful Response
     * @throws ApiError
     */
    public static loginResetPassword(
        requestBody: NewPassword,
    ): CancelablePromise<Message> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/reset-password/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Recover Password Html Content
     * HTML Content for Password Recovery
     * @param email
     * @returns string Successful Response
     * @throws ApiError
     */
    public static loginRecoverPasswordHtmlContent(
        email: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/password-recovery-html-content/{email}',
            path: {
                'email': email,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
