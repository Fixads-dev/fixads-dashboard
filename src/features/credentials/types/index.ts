/**
 * Credential scope - determines visibility and access
 */
export type CredentialScope = "PLATFORM" | "ORGANIZATION" | "USER";

/**
 * Credential type - what kind of API key/token
 */
export type CredentialType =
  | "GOOGLE_ADS_DEVELOPER_TOKEN"
  | "GOOGLE_ADS_CLIENT_ID"
  | "GOOGLE_ADS_CLIENT_SECRET"
  | "GEMINI_API_KEY";

/**
 * Storage mode for credential value
 */
export type StorageMode = "database" | "secret_manager";

/**
 * Credential from API (value is never returned)
 */
export interface Credential {
  id: string;
  credential_type: CredentialType;
  scope: CredentialScope;
  organization_id?: string;
  user_id?: string;
  name: string;
  is_active: boolean;
  is_validated: boolean;
  validated_at?: string;
  storage_mode: StorageMode;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

/**
 * Credential audit log entry
 */
export interface CredentialAuditLog {
  id: string;
  credential_id: string;
  action: "created" | "updated" | "rotated" | "accessed" | "deleted";
  actor_user_id: string;
  changes?: string;
  ip_address?: string;
  created_at: string;
}

/**
 * Resolved credential info (which credential is being used)
 */
export interface ResolvedCredential {
  credential_type: CredentialType;
  scope: CredentialScope;
  credential_id?: string;
  name?: string;
  source: "user" | "organization" | "platform" | "environment";
}

// Request types

export interface CreateCredentialRequest {
  credential_type: CredentialType;
  scope: CredentialScope;
  name: string;
  value: string;
  organization_id?: string;
}

export interface UpdateCredentialRequest {
  name?: string;
  value?: string;
  is_active?: boolean;
}

export interface RotateCredentialRequest {
  new_value: string;
}

// Response types

export interface CredentialListResponse {
  items: Credential[];
  total: number;
}

export interface ValidateCredentialResponse {
  valid: boolean;
  message: string;
}

export interface CredentialAuditLogResponse {
  items: CredentialAuditLog[];
  total: number;
}

// Display helpers

export const CREDENTIAL_TYPE_LABELS: Record<CredentialType, string> = {
  GOOGLE_ADS_DEVELOPER_TOKEN: "Google Ads Developer Token",
  GOOGLE_ADS_CLIENT_ID: "Google Ads Client ID",
  GOOGLE_ADS_CLIENT_SECRET: "Google Ads Client Secret",
  GEMINI_API_KEY: "Gemini API Key",
};

export const CREDENTIAL_SCOPE_LABELS: Record<CredentialScope, string> = {
  PLATFORM: "Platform (Admin only)",
  ORGANIZATION: "Organization",
  USER: "Personal",
};

export const CREDENTIAL_TYPE_DESCRIPTIONS: Record<CredentialType, string> = {
  GOOGLE_ADS_DEVELOPER_TOKEN: "Required for Google Ads API access",
  GOOGLE_ADS_CLIENT_ID: "OAuth2 client ID for Google Ads",
  GOOGLE_ADS_CLIENT_SECRET: "OAuth2 client secret for Google Ads",
  GEMINI_API_KEY: "API key for AI text generation with Google Gemini",
};
