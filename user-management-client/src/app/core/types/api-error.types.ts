/**
 * API Error response structure (backend may use errorMessage or statusMessage)
 */
export interface ApiError {
  statusCode?: number;
  errorMessage?: string;
  statusMessage?: string;
  message?: string;
}
