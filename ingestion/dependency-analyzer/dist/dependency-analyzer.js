"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyAnalyzer = void 0;
class DependencyAnalyzer {
    constructor() {
        this.dependencies = new Map();
        this.serviceNodes = new Map();
    }
    processTrace(trace) {
        const spans = trace.spans || [];
        spans.forEach((span) => {
            // Record service node
            this.recordServiceNode(span);
            // Record dependencies if there's a parent-child relationship
            if (span.parentSpanId) {
                const parentSpan = spans.find((s) => s.spanId === span.parentSpanId);
                if (parentSpan) {
                    this.recordDependency(parentSpan, span);
                }
            }
        });
    }
    recordServiceNode(span) {
        var _a;
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
        const node = this.serviceNodes.get(serviceKey);
        node.invocationCount++;
        if (((_a = span.status) === null || _a === void 0 ? void 0 : _a.code) === 2) { // Error status
            node.errorCount++;
        }
        // Update average latency
        node.avgLatency = (node.avgLatency * (node.invocationCount - 1) + (span.duration || 0)) / node.invocationCount;
    }
    recordDependency(sourceSpan, targetSpan) {
        var _a;
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
        if (((_a = targetSpan.status) === null || _a === void 0 ? void 0 : _a.code) === 2) {
            existing.errorCount++;
        }
        // Update average latency
        existing.avgLatency = (existing.avgLatency * (existing.callCount - 1) + (targetSpan.duration || 0)) / existing.callCount;
        existing.timestamp = new Date();
        this.dependencies.set(dependencyKey, existing);
    }
    getDependencyGraph() {
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
    calculateCriticalPaths(dependencies) {
        // Simple critical path calculation based on call count and latency
        const paths = [];
        // Group by source service and find the most called dependencies
        const sourceGroups = new Map();
        dependencies.forEach(dep => {
            if (!sourceGroups.has(dep.sourceService)) {
                sourceGroups.set(dep.sourceService, []);
            }
            sourceGroups.get(dep.sourceService).push(dep);
        });
        sourceGroups.forEach((deps, source) => {
            // Find the dependency with highest call count
            const criticalDep = deps.reduce((prev, current) => (prev.callCount > current.callCount) ? prev : current);
            paths.push({
                path: [source, criticalDep.targetService],
                totalLatency: criticalDep.avgLatency,
                callCount: criticalDep.callCount,
                impact: criticalDep.callCount * criticalDep.avgLatency
            });
        });
        return paths.sort((a, b) => b.impact - a.impact).slice(0, 5); // Top 5 critical paths
    }
    clear() {
        this.dependencies.clear();
        this.serviceNodes.clear();
    }
    getStats() {
        return {
            serviceCount: this.serviceNodes.size,
            dependencyCount: this.dependencies.size
        };
    }
}
exports.DependencyAnalyzer = DependencyAnalyzer;
//# sourceMappingURL=dependency-analyzer.js.map