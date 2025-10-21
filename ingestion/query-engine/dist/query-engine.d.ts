export interface ParsedQuery {
    select: string[];
    where: Record<string, any>;
    groupBy: string[];
    orderBy: {
        field: string;
        direction: 'ASC' | 'DESC';
    }[];
    limit?: number;
    from: string;
}
export interface QueryResult {
    data: any[];
    metadata: {
        executionTime: number;
        recordsReturned: number;
        cloudProviders: string[];
    };
}
export declare class CrossCloudQueryEngine {
    private connectors;
    constructor();
    private initializeConnectors;
    executeQuery(query: string): Promise<QueryResult>;
    private parseQuery;
    private extractSelectFields;
    private extractWhereConditions;
    private extractGroupBy;
    private extractOrderBy;
    private extractLimit;
    private processResults;
    private applyGroupBy;
    private applyOrderBy;
    private mockAWSData;
    private mockAzureData;
    private mockGCPData;
}
//# sourceMappingURL=query-engine.d.ts.map