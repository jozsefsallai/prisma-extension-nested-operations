"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withNestedOperations = void 0;
const extractNestedOperations_1 = require("./utils/extractNestedOperations");
const execution_1 = require("./utils/execution");
const params_1 = require("./utils/params");
const targets_1 = require("./utils/targets");
const results_1 = require("./utils/results");
const dmmf_1 = require("./utils/dmmf");
function isFulfilled(result) {
    return result.status === "fulfilled";
}
function isRejected(result) {
    return result.status === "rejected";
}
function withNestedOperations({ $rootOperation, $allNestedOperations, dmmf }) {
    if (!!dmmf) {
        (0, dmmf_1.setDmmf)(dmmf);
    }
    return async (rootParams) => {
        let calls = [];
        try {
            const executionResults = await Promise.allSettled((0, extractNestedOperations_1.extractNestedOperations)(rootParams).map((nestedOperation) => (0, execution_1.executeOperation)($allNestedOperations, nestedOperation.params, nestedOperation.target)));
            // populate middlewareCalls with successful calls first so we can resolve
            // next promises if we find a rejection
            calls = executionResults.filter(isFulfilled).map(({ value }) => value);
            // consider any rejected execution as a failure of all nested middleware
            const failedExecution = executionResults.find(isRejected);
            if (failedExecution)
                throw failedExecution.reason;
            // build updated params from middleware calls
            const updatedArgs = (0, params_1.buildArgsFromCalls)(calls, rootParams);
            const result = await $rootOperation({
                ...rootParams,
                args: updatedArgs,
            });
            // bail out if result is null
            if (result === null) {
                calls.forEach((call) => call.queryPromise.resolve(undefined));
                await Promise.all(calls.map((call) => call.result));
                return null;
            }
            // add id symbols to result so we can use them to update result relations
            // with the results from nested middleware
            (0, results_1.addIdSymbolsToResult)(result);
            const nestedNextResults = await Promise.all(calls.map(async (call) => {
                const relationsPath = (0, targets_1.buildTargetRelationPath)(call.target);
                if (result === null || !relationsPath) {
                    call.queryPromise.resolve(undefined);
                    await call.result;
                    return null;
                }
                const relationResults = (0, results_1.getRelationResult)(result, relationsPath);
                call.queryPromise.resolve(relationResults);
                const updatedResult = await call.result;
                if (typeof relationResults === "undefined") {
                    return null;
                }
                return {
                    relationsPath,
                    updatedResult,
                };
            }));
            // keep only the relevant result updates from nested next results
            const resultUpdates = nestedNextResults.filter((update) => !!update);
            resultUpdates
                .sort((a, b) => b.relationsPath.length - a.relationsPath.length)
                .forEach(({ relationsPath, updatedResult }, i) => {
                const remainingUpdates = resultUpdates.slice(i);
                const nextUpdatePath = relationsPath.slice(0, -1).join(".");
                const nextUpdate = remainingUpdates.find((update) => (update === null || update === void 0 ? void 0 : update.relationsPath.join(".")) === nextUpdatePath);
                if (nextUpdate) {
                    (0, results_1.updateResultRelation)(nextUpdate.updatedResult, relationsPath[relationsPath.length - 1], updatedResult);
                    return;
                }
                (0, results_1.updateResultRelation)(result, relationsPath[relationsPath.length - 1], updatedResult);
            });
            (0, results_1.stripIdSymbolsFromResult)(result);
            return result;
        }
        catch (e) {
            // if an error occurs reject the nested next functions promises to stop
            // them being pending forever
            calls.forEach((call) => call.queryPromise.reject(e));
            // wait for all nested middleware to settle before rethrowing
            await Promise.all(calls.map((call) => call.result.catch(() => { })));
            // bubble error up to parent middleware
            throw e;
        }
    };
}
exports.withNestedOperations = withNestedOperations;
