"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOperation = void 0;
const deferred_promise_1 = require("@open-draft/deferred-promise");
const lodash_1 = require("lodash");
const cloneArgs_1 = require("./cloneArgs");
async function executeOperation(execute, params, target) {
    const queryCalledPromise = new deferred_promise_1.DeferredPromise();
    const queryPromise = new deferred_promise_1.DeferredPromise();
    const result = execute({
        ...(0, cloneArgs_1.cloneArgs)(params),
        query: (updatedArgs, updatedOperation = params.operation) => {
            queryCalledPromise.resolve({
                updatedArgs,
                updatedOperation
            });
            return queryPromise;
        },
    }).catch((e) => {
        // reject params updated callback so it throws when awaited
        queryCalledPromise.reject(e);
        // if next has already been resolved we must throw
        if (queryPromise.state === "fulfilled") {
            throw e;
        }
    });
    const { updatedArgs, updatedOperation } = await queryCalledPromise;
    // execute middleware with updated params if action has changed
    if (updatedOperation !== params.operation) {
        return executeOperation(execute, {
            ...params,
            operation: updatedOperation,
            args: updatedArgs,
        }, (0, lodash_1.omit)(target, "index"));
    }
    // execute middleware with updated params if action has changed
    return {
        queryPromise,
        result,
        updatedArgs,
        origin: target,
        target: { ...target, operation: params.operation },
        scope: params.scope,
    };
}
exports.executeOperation = executeOperation;
