import { Types } from "@prisma/client/runtime/library";
import { LogicalOperator, NestedParams, NestedWriteOperation, Target } from "../types";
type NestedOperationInfo<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs> = {
    params: NestedParams<ExtArgs>;
    target: Target;
};
export declare const fieldsByWriteOperation: Record<NestedWriteOperation, (string | undefined)[]>;
export declare function extractRelationLogicalWhereOperations<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>(params: NestedParams<ExtArgs>, parentTarget?: Target, parentOperations?: {
    logicalOperator: LogicalOperator;
    index?: number;
}[]): NestedOperationInfo[];
export declare function extractRelationWhereOperations<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>(params: NestedParams<ExtArgs>, parentTarget?: Target): NestedOperationInfo[];
export declare function extractRelationWriteOperations<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>(params: NestedParams<ExtArgs>, parentTarget?: Target): NestedOperationInfo[];
export declare function extractRelationReadOperations<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>(params: NestedParams<ExtArgs>, parentTarget?: Target): NestedOperationInfo[];
export declare function extractNestedOperations<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>(params: NestedParams<ExtArgs>): NestedOperationInfo[];
export {};
