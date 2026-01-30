// npx ng test --include='**/api-error.service.spec.ts' --no-watch --browsers=ChromeHeadless
import { TestBed } from '@angular/core/testing';
import { ApiErrorService } from './api-error.service';
import { ApiError } from '@core/types/api-error.types';

describe('ApiErrorService', () => {
  let service: ApiErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isApiError', () => {
    it('should return true for object with errorMessage', () => {
      expect(service.isApiError({ errorMessage: 'test' })).toBe(true);
    });

    it('should return true for object with statusMessage', () => {
      expect(service.isApiError({ statusMessage: 'test' })).toBe(true);
    });

    it('should return true for object with message', () => {
      expect(service.isApiError({ message: 'test' })).toBe(true);
    });

    it('should return true for object with statusCode', () => {
      expect(service.isApiError({ statusCode: 400 })).toBe(true);
    });

    it('should return false for null', () => {
      expect(service.isApiError(null)).toBe(false);
    });

    it('should return false for string', () => {
      expect(service.isApiError('error')).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return default when apiError is null', () => {
      expect(service.getErrorMessage(null, 'default')).toBe('default');
    });

    it('should return errorMessage when present', () => {
      const apiError: ApiError = { errorMessage: 'API error' };
      expect(service.getErrorMessage(apiError, 'default')).toBe('API error');
    });

    it('should return statusMessage when errorMessage is missing', () => {
      const apiError: ApiError = { statusMessage: 'Status error' };
      expect(service.getErrorMessage(apiError, 'default')).toBe('Status error');
    });

    it('should return message when errorMessage and statusMessage are missing', () => {
      const apiError: ApiError = { message: 'Generic message' };
      expect(service.getErrorMessage(apiError, 'default')).toBe('Generic message');
    });

    it('should return default when no message fields present', () => {
      const apiError: ApiError = { statusCode: 500 };
      expect(service.getErrorMessage(apiError, 'default')).toBe('default');
    });
  });

  describe('getMessageFromHttpError', () => {
    it('should return default for non-object error', () => {
      expect(service.getMessageFromHttpError('error', 'default')).toBe('default');
    });

    it('should extract errorMessage from error.error', () => {
      const error = { error: { errorMessage: 'Backend error' } };
      expect(service.getMessageFromHttpError(error, 'default')).toBe('Backend error');
    });

    it('should extract statusMessage from error.error', () => {
      const error = { error: { statusMessage: 'Status error' } };
      expect(service.getMessageFromHttpError(error, 'default')).toBe('Status error');
    });

    it('should return default when error.error has no message', () => {
      const error = { error: {} };
      expect(service.getMessageFromHttpError(error, 'default')).toBe('default');
    });
  });
});
