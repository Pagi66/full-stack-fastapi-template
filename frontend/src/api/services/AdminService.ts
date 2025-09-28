import type { AdminDashboardSummary } from '../models/AdminDashboardSummary';
import type { KycApplicationDetail } from '../models/KycApplicationDetail';
import type { KycApplicationPublic } from '../models/KycApplicationPublic';
import type { KycRejectionPayload } from '../models/KycRejectionPayload';
import type { UserPublic } from '../models/UserPublic';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export type SimulationTriggerRequest = {
  trader_profile_id?: string;
};

export type SimulationTriggerResponse = {
  trader_trades_created: number;
  follower_trades_created: number;
  events_recorded: number;
};

export type ManualProfitRequest = {
  amount: number;
  description?: string;
};

export type ManualProfitResponse = {
  balance: number;
  event_id: string;
};

export class AdminService {
  /**
   * Retrieve aggregated data for the admin dashboard.
   */
  public static adminGetDashboard(): CancelablePromise<AdminDashboardSummary> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/admin/dashboard',
      errors: {
        403: "Not enough permissions",
        422: "Validation Error",
      },
    });
  }

  /**
   * Retrieve pending KYC applications awaiting review.
   */
  public static getPendingKyc(): CancelablePromise<Array<KycApplicationPublic>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/kyc/applications/pending',
      errors: {
        403: "Not enough permissions",
      },
    });
  }

  public static getKycApplicationDetail(userId: string): CancelablePromise<KycApplicationDetail> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/kyc/applications/{user_id}',
      path: {
        user_id: userId,
      },
      errors: {
        403: "Not enough permissions",
        404: "User not found",
      },
    });
  }

  public static approveKyc(userId: string): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/kyc/applications/{user_id}/approve',
      path: {
        user_id: userId,
      },
      errors: {
        403: "Not enough permissions",
        404: "User not found",
      },
    });
  }

  public static rejectKyc(
    userId: string,
    payload: KycRejectionPayload,
  ): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/kyc/applications/{user_id}/reject',
      path: {
        user_id: userId,
      },
      body: payload,
      mediaType: 'application/json',
      errors: {
        403: "Not enough permissions",
        404: "User not found",
        422: "Validation Error",
      },
    });
  }

  public static adminRunSimulation(
    requestBody: SimulationTriggerRequest = {},
  ): CancelablePromise<SimulationTriggerResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/admin/simulations/run',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static adminGrantManualProfit(
    userId: string,
    requestBody: ManualProfitRequest,
  ): CancelablePromise<ManualProfitResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/admin/simulations/users/{user_id}/profit',
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
