import { apiMethods } from "@/shared/api";
import type {
  CreateCredentialRequest,
  Credential,
  CredentialAuditLogResponse,
  CredentialListResponse,
  ResolvedCredential,
  RotateCredentialRequest,
  UpdateCredentialRequest,
  ValidateCredentialResponse,
} from "../types";

const GOOGLE_ADS_PATH = "google-ads/v1";

export const credentialsApi = {
  // ==================== Credentials CRUD ====================

  /**
   * Create a new credential
   * POST /google-ads/v1/credentials
   */
  create: (data: CreateCredentialRequest) =>
    apiMethods.post<Credential>(`${GOOGLE_ADS_PATH}/credentials`, data),

  /**
   * List credentials visible to current user
   * GET /google-ads/v1/credentials
   */
  list: () => apiMethods.get<CredentialListResponse>(`${GOOGLE_ADS_PATH}/credentials`),

  /**
   * Get credential by ID (metadata only, no value)
   * GET /google-ads/v1/credentials/{id}
   */
  get: (id: string) => apiMethods.get<Credential>(`${GOOGLE_ADS_PATH}/credentials/${id}`),

  /**
   * Update credential
   * PATCH /google-ads/v1/credentials/{id}
   */
  update: (id: string, data: UpdateCredentialRequest) =>
    apiMethods.patch<Credential>(`${GOOGLE_ADS_PATH}/credentials/${id}`, data),

  /**
   * Delete credential
   * DELETE /google-ads/v1/credentials/{id}
   */
  delete: (id: string) => apiMethods.delete<void>(`${GOOGLE_ADS_PATH}/credentials/${id}`),

  // ==================== Validation & Rotation ====================

  /**
   * Validate credential (test API connection)
   * POST /google-ads/v1/credentials/{id}/validate
   */
  validate: (id: string) =>
    apiMethods.post<ValidateCredentialResponse>(`${GOOGLE_ADS_PATH}/credentials/${id}/validate`),

  /**
   * Rotate credential value
   * POST /google-ads/v1/credentials/{id}/rotate
   */
  rotate: (id: string, data: RotateCredentialRequest) =>
    apiMethods.post<Credential>(`${GOOGLE_ADS_PATH}/credentials/${id}/rotate`, data),

  // ==================== Audit & Resolution ====================

  /**
   * Get credential audit log
   * GET /google-ads/v1/credentials/audit/{id}
   */
  getAuditLog: (id: string) =>
    apiMethods.get<CredentialAuditLogResponse>(`${GOOGLE_ADS_PATH}/credentials/audit/${id}`),

  /**
   * Get resolved credentials (show which credentials will be used)
   * GET /google-ads/v1/credentials/resolved
   */
  getResolved: () =>
    apiMethods.get<ResolvedCredential[]>(`${GOOGLE_ADS_PATH}/credentials/resolved`),
};
