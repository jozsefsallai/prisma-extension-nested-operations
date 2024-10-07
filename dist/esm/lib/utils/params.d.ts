import { Types } from "@prisma/client/runtime/library";
import { OperationCall, NestedOperation, NestedParams } from "../types";
export declare function assertOperationChangeIsValid(previousOperation: NestedOperation, nextOperation: NestedOperation): void;
export declare function buildArgsFromCalls<ExtArgs extends Types.Extensions.InternalArgs, Call extends Omit<OperationCall<ExtArgs>, "queryPromise" | "result">>(calls: Call[], rootParams: NestedParams<ExtArgs>): any;
