import { Types } from "@prisma/client/runtime/library";
import { ExecuteFunction, NestedParams, OperationCall, Target } from "../types";
export declare function executeOperation<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>(execute: ExecuteFunction, params: NestedParams<ExtArgs>, target: Target): Promise<OperationCall<ExtArgs>>;
