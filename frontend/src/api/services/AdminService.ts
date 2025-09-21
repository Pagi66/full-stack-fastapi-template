import type { AdminDashboardSummary } from '../models/AdminDashboardSummary';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AdminService {
  /**
   * Retrieve aggregated data for the admin dashboard.
   * @returns AdminDashboardSummary Successful Response
   * @throws ApiError
   */
  public static adminGetDashboard(): CancelablePromise<AdminDashboardSummary> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/admin/dashboard',
      errors: {
        403: `Not enough permissions`,
        422: `Validation Error`,
      },
    });
  }
}
