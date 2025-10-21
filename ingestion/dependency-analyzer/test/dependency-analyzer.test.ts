import { DependencyAnalyzer } from '../src/dependency-analyzer';

describe('DependencyAnalyzer', () => {
    let analyzer: DependencyAnalyzer;

    beforeEach(() => {
        analyzer = new DependencyAnalyzer();
    });

    test('should process cross-cloud trace and build dependency graph', () => {
        const crossCloudTrace = {
            traceId: 'trace-1',
            spans: [
                {
                    spanId: 'span-1',
                    name: 'order-service-azure',
                    parentSpanId: '',
                    duration: 150,
                    cloudProvider: 'azure',
                    status: { code: 1 }
                },
                {
                    spanId: 'span-2',
                    name: 'payment-service-gcp',
                    parentSpanId: 'span-1',
                    duration: 75,
                    cloudProvider: 'gcp',
                    status: { code: 1 }
                },
                {
                    spanId: 'span-3',
                    name: 'inventory-service-aws',
                    parentSpanId: 'span-1',
                    duration: 50,
                    cloudProvider: 'aws',
                    status: { code: 2 } // Error
                }
            ]
        };

        analyzer.processTrace(crossCloudTrace);
        const graph = analyzer.getDependencyGraph();

        expect(graph.services).toHaveLength(3);
        expect(graph.dependencies).toHaveLength(2);
        expect(graph.criticalPaths).toHaveLength(1);

        // Verify services
        const serviceNames = graph.services.map(s => s.name);
        expect(serviceNames).toContain('order-service-azure');
        expect(serviceNames).toContain('payment-service-gcp');
        expect(serviceNames).toContain('inventory-service-aws');

        // Verify dependencies
        const dependency = graph.dependencies.find(d => 
            d.sourceService === 'order-service-azure' && 
            d.targetService === 'payment-service-gcp'
        );
        expect(dependency).toBeDefined();
        expect(dependency?.callCount).toBe(1);
        expect(dependency?.cloudProvider).toBe('azure');
    });

    test('should calculate critical paths correctly', () => {
        const trace = {
            traceId: 'trace-2',
            spans: [
                {
                    spanId: 'span-1',
                    name: 'api-gateway',
                    parentSpanId: '',
                    duration: 100,
                    cloudProvider: 'aws',
                    status: { code: 1 }
                },
                {
                    spanId: 'span-2',
                    name: 'user-service',
                    parentSpanId: 'span-1',
                    duration: 200,
                    cloudProvider: 'azure',
                    status: { code: 1 }
                },
                {
                    spanId: 'span-3',
                    name: 'auth-service',
                    parentSpanId: 'span-1',
                    duration: 50,
                    cloudProvider: 'gcp',
                    status: { code: 1 }
                }
            ]
        };

        analyzer.processTrace(trace);
        const graph = analyzer.getDependencyGraph();

        expect(graph.criticalPaths.length).toBeGreaterThan(0);
        expect(graph.criticalPaths[0].path).toContain('api-gateway');
    });

    test('should provide statistics', () => {
        const trace = {
            traceId: 'trace-3',
            spans: [
                {
                    spanId: 'span-1',
                    name: 'service-a',
                    parentSpanId: '',
                    duration: 100,
                    cloudProvider: 'aws',
                    status: { code: 1 }
                },
                {
                    spanId: 'span-2',
                    name: 'service-b',
                    parentSpanId: 'span-1',
                    duration: 200,
                    cloudProvider: 'aws',
                    status: { code: 1 }
                }
            ]
        };

        analyzer.processTrace(trace);
        const stats = analyzer.getStats();

        expect(stats.serviceCount).toBe(2);
        expect(stats.dependencyCount).toBe(1);
    });
});
