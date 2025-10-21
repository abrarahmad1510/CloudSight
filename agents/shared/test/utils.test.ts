import { CloudProviderDetector } from '../src/utils';

describe('CloudProviderDetector', () => {
    beforeEach(() => {
        // Clear environment variables
        delete process.env.AWS_LAMBDA_FUNCTION_NAME;
        delete process.env.WEBSITE_SITE_NAME;
        delete process.env.K_SERVICE;
    });

    test('should detect AWS platform', () => {
        process.env.AWS_LAMBDA_FUNCTION_NAME = 'test-function';
        expect(CloudProviderDetector.detectPlatform()).toBe('aws');
    });

    test('should detect Azure platform', () => {
        process.env.WEBSITE_SITE_NAME = 'test-app';
        expect(CloudProviderDetector.detectPlatform()).toBe('azure');
    });

    test('should detect GCP platform', () => {
        process.env.K_SERVICE = 'test-service';
        expect(CloudProviderDetector.detectPlatform()).toBe('gcp');
    });

    test('should throw error when platform cannot be detected', () => {
        expect(() => CloudProviderDetector.detectPlatform()).toThrow();
    });

    test('should get region for AWS', () => {
        process.env.AWS_LAMBDA_FUNCTION_NAME = 'test-function';
        process.env.AWS_REGION = 'us-east-1';
        expect(CloudProviderDetector.getRegion()).toBe('us-east-1');
    });

    test('should get region for Azure', () => {
        process.env.WEBSITE_SITE_NAME = 'test-app';
        process.env.REGION_NAME = 'westus';
        expect(CloudProviderDetector.getRegion()).toBe('westus');
    });

    test('should get region for GCP', () => {
        process.env.K_SERVICE = 'test-service';
        process.env.FUNCTION_REGION = 'us-central1';
        expect(CloudProviderDetector.getRegion()).toBe('us-central1');
    });
});
