export class ProcessingError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly context: Record<string, any>;

  constructor(
    message: string,
    code: string,
    retryable: boolean = false,
    context: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'ProcessingError';
    this.code = code;
    this.retryable = retryable;
    this.context = context;
  }
}

export class ValidationError extends ProcessingError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'VALIDATION_ERROR', false, context);
  }
}

export class DatabaseError extends ProcessingError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'DATABASE_ERROR', true, context);
  }
}

export class RetryableError extends ProcessingError {
  constructor(message: string, context: Record<string, any> = {}) {
    super(message, 'RETRYABLE_ERROR', true, context);
  }
}

export function handleError(error: unknown): ProcessingError {
  if (error instanceof ProcessingError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for network/timeout errors that are retryable
    if (
      error.message.includes('timeout') ||
      error.message.includes('network') ||
      error.message.includes('ECONNREFUSED')
    ) {
      return new RetryableError(error.message, { originalError: error.name });
    }

    // Check for database connection errors
    if (
      error.message.includes('database') ||
      error.message.includes('connection') ||
      error.message.includes('query')
    ) {
      return new DatabaseError(error.message, { originalError: error.name });
    }
  }

  return new ProcessingError(
    'Unknown processing error',
    'UNKNOWN_ERROR',
    false,
    { originalError: String(error) }
  );
}