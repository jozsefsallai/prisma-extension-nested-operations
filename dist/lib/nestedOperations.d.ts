import { Prisma } from "@prisma/client";
import { Types } from "@prisma/client/runtime/library";
import { NestedParams } from "./types";
type NonNullable<T> = Exclude<T, null | undefined>;
export declare function withNestedOperations<ExtArgs extends Types.Extensions.InternalArgs = Types.Extensions.DefaultArgs>({ $rootOperation, $allNestedOperations, dmmf }: {
    $rootOperation: NonNullable<Types.Extensions.DynamicQueryExtensionArgs<{
        $allModels: {
            $allOperations: any;
        };
    }, Prisma.TypeMap<ExtArgs>>["$allModels"]["$allOperations"]>;
    $allNestedOperations: (params: NestedParams<ExtArgs>) => Promise<any>;
    dmmf?: typeof Prisma.dmmf;
}): typeof $rootOperation;
export {};
