import { 
  ProcessingError, 
  ValidationError, 
  DatabaseError, 
  RetryableError, 
  handleError 
} from '../../src/utils/errorHandler';

describe('ErrorHandler', () => {
  describe('ProcessingError', () => {
    test('should create ProcessingError with correct properties', () => {
      const error = new ProcessingError('Test error', 'TEST_ERROR', true, { context: 'test' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.context).toEqual({ context: 'test' });
      expect(error.name).toBe('ProcessingError');
    });
  });

  describe('ValidationError', () => {
    test('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Validation failed', { field: 'test' });

      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.retryable).toBe(false);
      expect(error.context).toEqual({ field: 'test' });
    });
  });

  describe('DatabaseError', () => {
    test('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('DB connection failed', { db: 'test' });

      expect(error.message).toBe('DB connection failed');
      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.context).toEqual({ db: 'test' });
    });
  });

  describe('RetryableError', () => {
    test('should create RetryableError with correct properties', () => {
      const error = new RetryableError('Network timeout', { endpoint: 'test' });

      expect(error.message).toBe('Network timeout');
      expect(error.code).toBe('RETRYABLE_ERROR');
      expect(error.retryable).toBe(true);
      expect(error.context).toEqual({ endpoint: 'test' });
    });
  });

  describe('handleError', () => {
    test('should return ProcessingError for unknown error', () => {
      const error = new Error('Test error');
      const result = handleError(error);

      expect(result).toBeInstanceOf(ProcessingError);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.retryable).toBe(false);
    });

    test('should return RetryableError for timeout error', () => {
      const error = new Error('timeout of 10000ms exceeded');
      const result = handleError(error);

      expect(result).toBeInstanceOf(RetryableError);
      expect(result.code).toBe('RETRYABLE_ERROR');
      expect(result.retryable).toBe(true);
    });

    test('should return RetryableError for network error', () => {
      const error = new Error('network error');
      const result = handleError(error);

      expect(result).toBeInstanceOf(RetryableError);
      expect(result.retryable).toBe(true);
    });

    test('should return RetryableError for ECONNREFUSED', () => {
      const error = new Error('ECONNREFUSED');
      const result = handleError(error);

      expect(result).toBeInstanceOf(RetryableError);
      expect(result.retryable).toBe(true);
    });

    test('should return DatabaseError for database error', () => {
      const error = new Error('database connection failed');
      const result = handleError(error);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.code).toBe('DATABASE_ERROR');
      expect(result.retryable).toBe(true);
    });

    test('should return DatabaseError for query error', () => {
      const error = new Error('query execution failed');
      const result = handleError(error);

      expect(result).toBeInstanceOf(DatabaseError);
      expect(result.retryable).toBe(true);
    });

    test('should return the same error if it is already a ProcessingError', () => {
      const originalError = new ProcessingError('Test', 'TEST_ERROR', true);
      const result = handleError(originalError);

      expect(result).toBe(originalError);
    });

    test('should handle non-Error objects', () => {
      const result = handleError('string error');

      expect(result).toBeInstanceOf(ProcessingError);
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });
});