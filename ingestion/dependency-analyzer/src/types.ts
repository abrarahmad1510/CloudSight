export interface ServiceDependency {
    sourceService: string;
    targetService: string;
    callCount: number;
    errorCount: number;
    avgLatency: number;
    cloudProvider: string;
    timestamp: Date;
}

export interface ServiceNode {
    name: string;
    cloudProvider: string;
    invocationCount: number;
    errorCount: number;
    avgLatency: number;
}

export interface CriticalPath {
    path: string[];
    totalLatency: number;
    callCount: number;
    impact: number;
}

export interface DependencyGraph {
    services: ServiceNode[];
    dependencies: ServiceDependency[];
    criticalPaths: CriticalPath[];
    timestamp: Date;
}
