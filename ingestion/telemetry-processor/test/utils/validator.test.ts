import { TelemetryValidator } from '../../src/utils/validator';
import { ValidationError } from '../../src/utils/errorHandler';

describe('TelemetryValidator', () => {
  let validator: TelemetryValidator;

  beforeEach(() => {
    validator = new TelemetryValidator();
  });

  describe('validateMetric', () => {
    test('should validate correct metric records', () => {
      const validMetric = {
        name: 'invocation_success',
        value: 1,
        unit: 'Count',
        timestamp: new Date().toISOString(),
        dimensions: {
          function_name: 'test-function',
          region: 'us-east-1'
        },
        _cloudsight: 'metric'
      };

      const result = validator.validateMetric(validMetric);
      expect(result).toEqual(validMetric);
    });

    test('should throw ValidationError for missing required fields', () => {
      const invalidMetric = {
        name: 'test_metric',
        // missing value, unit, timestamp, dimensions
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid value type', () => {
      const invalidMetric = {
        name: 'test_metric',
        value: 'not-a-number',
        unit: 'Count',
        timestamp: new Date().toISOString(),
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid timestamp', () => {
      const invalidMetric = {
        name: 'test_metric',
        value: 1,
        unit: 'Count',
        timestamp: 'invalid-date',
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid dimensions', () => {
      const invalidMetric = {
        name: 'test_metric',
        value: 1,
        unit: 'Count',
        timestamp: new Date().toISOString(),
        dimensions: 'not-an-object',
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should throw ValidationError for wrong _cloudsight type', () => {
      const invalidMetric = {
        name: 'test_metric',
        value: 1,
        unit: 'Count',
        timestamp: new Date().toISOString(),
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'wrong-type'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should validate cold start metric correctly', () => {
      const coldStartMetric = {
        name: 'cold_start',
        value: 1,
        unit: 'Count',
        timestamp: new Date().toISOString(),
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'metric'
      };

      const result = validator.validateMetric(coldStartMetric);
      expect(result).toEqual(coldStartMetric);
    });

    test('should throw ValidationError for invalid cold start value', () => {
      const invalidMetric = {
        name: 'cold_start',
        value: 2, // Should be 1
        unit: 'Count',
        timestamp: new Date().toISOString(),
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should throw ValidationError for duration metric with wrong unit', () => {
      const invalidMetric = {
        name: 'invocation_duration',
        value: 100,
        unit: 'Count', // Should be Milliseconds
        timestamp: new Date().toISOString(),
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });

    test('should throw ValidationError for out-of-range duration', () => {
      const invalidMetric = {
        name: 'invocation_duration',
        value: 1000000, // More than 15 minutes
        unit: 'Milliseconds',
        timestamp: new Date().toISOString(),
        dimensions: { function_name: 'test-function' },
        _cloudsight: 'metric'
      };

      expect(() => validator.validateMetric(invalidMetric)).toThrow(ValidationError);
    });
  });

  describe('validateTrace', () => {
    test('should validate correct trace records', () => {
      const validTrace = {
        traceId: 'trace-123',
        spanId: 'span-456',
        startTime: new Date().toISOString(),
        invocationContext: {
          functionName: 'test-function',
          coldStart: false
        },
        _cloudsight: 'trace'
      };

      const result = validator.validateTrace(validTrace);
      expect(result).toEqual(validTrace);
    });

    test('should throw ValidationError for missing required trace fields', () => {
      const invalidTrace = {
        traceId: 'trace-123',
        // missing spanId, startTime, invocationContext
        _cloudsight: 'trace'
      };

      expect(() => validator.validateTrace(invalidTrace)).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid traceId', () => {
      const invalidTrace = {
        traceId: 123, // Should be string
        spanId: 'span-456',
        startTime: new Date().toISOString(),
        invocationContext: {
          functionName: 'test-function',
          coldStart: false
        },
        _cloudsight: 'trace'
      };

      expect(() => validator.validateTrace(invalidTrace)).toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid startTime', () => {
      const invalidTrace = {
        traceId: 'trace-123',
        spanId: 'span-456',
        startTime: 'invalid-date',
        invocationContext: {
          functionName: 'test-function',
          coldStart: false
        },
        _cloudsight: 'trace'
      };

      expect(() => validator.validateTrace(invalidTrace)).toThrow(ValidationError);
    });
  });

  describe('isValidJSON', () => {
    test('should return true for valid JSON', () => {
      expect(validator.isValidJSON('{"key": "value"}')).toBe(true);
    });

    test('should return false for invalid JSON', () => {
      expect(validator.isValidJSON('invalid json')).toBe(false);
    });

    test('should return false for incomplete JSON', () => {
      expect(validator.isValidJSON('{"incomplete":')).toBe(false);
    });
  });
});