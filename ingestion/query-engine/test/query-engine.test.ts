import { CrossCloudQueryEngine } from '../src/query-engine';

describe('CrossCloudQueryEngine', () => {
    let queryEngine: CrossCloudQueryEngine;

    beforeEach(() => {
        queryEngine = new CrossCloudQueryEngine();
    });

    test('should execute basic SELECT query', async () => {
        const query = "SELECT service_name, cloud_provider FROM cloudsight.telemetry";
        const result = await queryEngine.executeQuery(query);
        
        expect(result).toBeDefined();
        expect(result.data).toBeInstanceOf(Array);
        expect(result.metadata.recordsReturned).toBeGreaterThan(0);
        expect(result.metadata.cloudProviders).toContain('aws');
        expect(result.metadata.cloudProviders).toContain('azure');
        expect(result.metadata.cloudProviders).toContain('gcp');
    });

    test('should execute query with WHERE clause', async () => {
        const query = "SELECT service_name, duration FROM cloudsight.telemetry WHERE error = true";
        const result = await queryEngine.executeQuery(query);
        
        expect(result.data.length).toBeGreaterThan(0);
    });

    test('should execute query with GROUP BY and aggregation', async () => {
        const query = `
            SELECT 
                service_name, 
                cloud_provider,
                AVG(duration) as avg_duration,
                COUNT(*) as invocations,
                SUM(cost) as total_cost
            FROM cloudsight.telemetry
            WHERE timestamp >= NOW() - INTERVAL '1' HOUR
            GROUP BY service_name, cloud_provider
            ORDER BY total_cost DESC
        `;
        
        const result = await queryEngine.executeQuery(query);
        
        expect(result.data).toBeInstanceOf(Array);
        result.data.forEach(item => {
            expect(item.service_name).toBeDefined();
            expect(item.cloud_provider).toBeDefined();
        });
    });

    test('should handle LIMIT clause', async () => {
        const query = "SELECT service_name FROM cloudsight.telemetry LIMIT 2";
        const result = await queryEngine.executeQuery(query);
        
        expect(result.data.length).toBeLessThanOrEqual(2);
    });

    test('should return metadata with execution time', async () => {
        const query = "SELECT * FROM cloudsight.telemetry";
        const result = await queryEngine.executeQuery(query);
        
        // Execution time can be 0 for very fast operations, so we check for >= 0
        expect(result.metadata.executionTime).toBeGreaterThanOrEqual(0);
        expect(result.metadata.recordsReturned).toBeGreaterThan(0);
        expect(result.metadata.cloudProviders).toHaveLength(3);
    });
});
