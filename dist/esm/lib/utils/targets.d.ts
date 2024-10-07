import { LogicalOperator, QueryTarget, ReadTarget, Target, WriteTarget } from "../types";
export declare function isQueryTarget(target: any): target is QueryTarget;
export declare function isReadTarget(target: any): target is ReadTarget;
export declare function isWriteTarget(target: any): target is WriteTarget;
export declare function buildOperationsPath(operations?: {
    logicalOperator: LogicalOperator;
    index?: number;
}[]): string[];
export declare function buildQueryTargetPath(target: QueryTarget): string[];
export declare function buildWriteTargetPath(target: WriteTarget): string[];
export declare function buildReadTargetPath(target: ReadTarget): string[];
export declare function buildTargetPath(target: Target): string[];
export declare const buildTargetRelationPath: (target: Target) => string[] | null;
export declare function targetChainLength(target: Target, count?: number): number;
