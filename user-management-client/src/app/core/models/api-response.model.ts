export interface ApiResponse<T> {
  statusCode: number;
  statusMessage?: string;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}
