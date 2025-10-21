import { DependencyGraph } from './types';
export declare class DependencyAnalyzer {
    private dependencies;
    private serviceNodes;
    processTrace(trace: any): void;
    private recordServiceNode;
    private recordDependency;
    getDependencyGraph(): DependencyGraph;
    private calculateCriticalPaths;
    clear(): void;
    getStats(): {
        serviceCount: number;
        dependencyCount: number;
    };
}
//# sourceMappingURL=dependency-analyzer.d.ts.map