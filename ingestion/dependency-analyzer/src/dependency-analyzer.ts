import { ServiceDependency, DependencyGraph, ServiceNode, CriticalPath } from './types';

// Define span interface for type safety
interface Span {
    spanId: string;
    name: string;
    parentSpanId?: string;
    duration?: number;
    cloudProvider: string;
    status?: { code: number };
}

export class DependencyAnalyzer {
    private dependencies: Map<string, ServiceDependency> = new Map();
    private serviceNodes: Map<string, ServiceNode> = new Map();

    public processTrace(trace: any): void {
        const spans: Span[] = trace.spans || [];
        
        spans.forEach((span: Span) => {
            // Record service node
            this.recordServiceNode(span);
            
            // Record dependencies if there's a parent-child relationship
            if (span.parentSpanId) {
                const parentSpan = spans.find((s: Span) => s.spanId === span.parentSpanId);
                if (parentSpan) {
                    this.recordDependency(parentSpan, span);
                }
            }
        });
    }

    private recordServiceNode(span: Span): void {
        const serviceKey = `${span.name}-${span.cloudProvider}`;
        
        if (!this.serviceNodes.has(serviceKey)) {
            this.serviceNodes.set(serviceKey, {
                name: span.name,
                cloudProvider: span.cloudProvider,
                invocationCount: 0,
                errorCount: 0,
                avgLatency: 0
            });
        }
        
        const node = this.serviceNodes.get(serviceKey)!;
        node.invocationCount++;
        
        if (span.status?.code === 2) { // Error status
            node.errorCount++;
        }
        
        // Update average latency
        node.avgLatency = (node.avgLatency * (node.invocationCount - 1) + (span.duration || 0)) / node.invocationCount;
    }

    private recordDependency(sourceSpan: Span, targetSpan: Span): void {
        const dependencyKey = `${sourceSpan.name}-${targetSpan.name}-${sourceSpan.cloudProvider}`;
        
        const existing = this.dependencies.get(dependencyKey) || {
            sourceService: sourceSpan.name,
            targetService: targetSpan.name,
            callCount: 0,
            errorCount: 0,
            avgLatency: 0,
            cloudProvider: sourceSpan.cloudProvider,
            timestamp: new Date()
        };

        existing.callCount++;
        if (targetSpan.status?.code === 2) {
            existing.errorCount++;
        }
        
        // Update average latency
        existing.avgLatency = (existing.avgLatency * (existing.callCount - 1) + (targetSpan.duration || 0)) / existing.callCount;
        existing.timestamp = new Date();
        
        this.dependencies.set(dependencyKey, existing);
    }

    public getDependencyGraph(): DependencyGraph {
        const services = Array.from(this.serviceNodes.values());
        const dependencies = Array.from(this.dependencies.values());
        const criticalPaths = this.calculateCriticalPaths(dependencies);

        return {
            services,
            dependencies,
            criticalPaths,
            timestamp: new Date()
        };
    }

    private calculateCriticalPaths(dependencies: ServiceDependency[]): CriticalPath[] {
        // Simple critical path calculation based on call count and latency
        const paths: CriticalPath[] = [];
        
        // Group by source service and find the most called dependencies
        const sourceGroups = new Map<string, ServiceDependency[]>();
        dependencies.forEach(dep => {
            if (!sourceGroups.has(dep.sourceService)) {
                sourceGroups.set(dep.sourceService, []);
            }
            sourceGroups.get(dep.sourceService)!.push(dep);
        });

        sourceGroups.forEach((deps, source) => {
            // Find the dependency with highest call count
            const criticalDep = deps.reduce((prev, current) => 
                (prev.callCount > current.callCount) ? prev : current
            );
            
            paths.push({
                path: [source, criticalDep.targetService],
                totalLatency: criticalDep.avgLatency,
                callCount: criticalDep.callCount,
                impact: criticalDep.callCount * criticalDep.avgLatency
            });
        });

        return paths.sort((a, b) => b.impact - a.impact).slice(0, 5); // Top 5 critical paths
    }

    public clear(): void {
        this.dependencies.clear();
        this.serviceNodes.clear();
    }

    public getStats(): { serviceCount: number; dependencyCount: number } {
        return {
            serviceCount: this.serviceNodes.size,
            dependencyCount: this.dependencies.size
        };
    }
}
