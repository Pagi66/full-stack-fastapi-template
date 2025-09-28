import type { KycSubmissionPayload } from '../models/KycSubmissionPayload';
import type { KycSubmissionResponse } from '../models/KycSubmissionResponse';
import type { KycStatusResponse } from '../models/KycStatusResponse';
import type { KycDocumentPublic } from '../models/KycDocumentPublic';
import type { KycDocumentsPublic } from '../models/KycDocumentsPublic';
import type { UserProfilePublic } from '../models/UserProfilePublic';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class KycService {
  public static getProfile(): CancelablePromise<UserProfilePublic | null> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/kyc/profile',
    });
  }

  public static submit(payload: KycSubmissionPayload): CancelablePromise<KycSubmissionResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/kyc/submit',
      body: payload,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid submission',
        422: 'Validation Error',
      },
    });
  }

  public static getStatus(): CancelablePromise<KycStatusResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/kyc/status',
    });
  }

  public static listDocuments(): CancelablePromise<KycDocumentsPublic> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/kyc/documents',
    });
  }

  public static uploadDocument(
    documentType: string,
    file: File,
    side: 'front' | 'back' = 'front',
  ): CancelablePromise<KycDocumentPublic> {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('side', side);
    formData.append('file', file);

    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/kyc/documents',
      body: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: 'Invalid document upload',
        422: 'Validation Error',
      },
    });
  }
}