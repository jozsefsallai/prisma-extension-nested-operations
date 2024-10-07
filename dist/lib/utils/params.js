"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildArgsFromCalls = exports.assertOperationChangeIsValid = void 0;
const lodash_1 = require("lodash");
const targets_1 = require("./targets");
const operations_1 = require("./operations");
const cloneArgs_1 = require("./cloneArgs");
const extractNestedOperations_1 = require("./extractNestedOperations");
function addWriteToArgs(args, updatedArgs, target, scope) {
    const toOneRelation = !(scope === null || scope === void 0 ? void 0 : scope.relations.to.isList);
    const targetPath = (0, targets_1.buildWriteTargetPath)(target);
    const targetArgs = (0, lodash_1.get)(args, targetPath);
    // it's possible to target args that have already been updated if the user
    // has reused the same object in multiple places when changing action, in this
    // case we can just return
    if (targetArgs === updatedArgs) {
        return;
    }
    // if target doesn't exist or is a boolean action, we can just set the args
    if (!targetArgs || typeof targetArgs === "boolean") {
        (0, lodash_1.set)(args, targetPath, updatedArgs);
        return;
    }
    // createMany operations cannot be turned into arrays of operations so merge
    // their data fields
    if (target.operation === "createMany") {
        (0, lodash_1.set)(args, [...targetPath, "data"], [...targetArgs.data, ...updatedArgs.data]);
        return;
    }
    // to one relations have actions that cannot be turned into arrays of operations
    // so merge their args
    if (toOneRelation &&
        operations_1.toOneRelationNonListOperations.includes(target.operation)) {
        (0, lodash_1.merge)((0, lodash_1.get)(args, targetPath), updatedArgs);
        return;
    }
    // if target is an array of operations push args as another operation
    if (Array.isArray(targetArgs)) {
        targetArgs.push(updatedArgs);
        return;
    }
    // convert target to an array of operations with the target args as the
    // first operation and passed args as the second
    (0, lodash_1.set)(args, targetPath, [targetArgs, updatedArgs]);
}
function removeWriteFromArgs(args, target) {
    // remove args from target
    const targetPath = (0, targets_1.buildWriteTargetPath)(target);
    (0, lodash_1.unset)(args, targetPath);
    // if target parent is now an empty object or array we must remove it
    const targetParentPath = targetPath.slice(0, -1);
    const targetParent = (0, lodash_1.get)(args, targetParentPath);
    if (Object.keys(targetParent).length === 0) {
        (0, lodash_1.unset)(args, targetParentPath);
    }
}
function removeReadFromArgs(args, target) {
    // remove args from target
    const targetPath = (0, targets_1.buildReadTargetPath)(target);
    (0, lodash_1.unset)(args, targetPath);
    // if target parent is an array with only unset values we must remove it
    const targetParentPath = targetPath.slice(0, -1);
    const targetParent = (0, lodash_1.get)(args, targetParentPath);
    if (Object.keys(targetParent).length === 0) {
        (0, lodash_1.unset)(args, targetParentPath);
    }
}
function assertOperationChangeIsValid(previousOperation, nextOperation) {
    if ((0, operations_1.isReadOperation)(previousOperation) && (0, operations_1.isWriteOperation)(nextOperation)) {
        throw new Error("Changing a read action to a write action is not supported");
    }
    if ((0, operations_1.isWriteOperation)(previousOperation) && (0, operations_1.isReadOperation)(nextOperation)) {
        throw new Error("Changing a write action to a read action is not supported");
    }
    if ((0, operations_1.isQueryOperation)(previousOperation) && !(0, operations_1.isQueryOperation)(nextOperation)) {
        throw new Error("Changing a query action to a non-query action is not supported");
    }
}
exports.assertOperationChangeIsValid = assertOperationChangeIsValid;
function moveOperationChangesToEnd(callA, callB) {
    if (callA.target.operation !== callA.origin.operation) {
        return 1;
    }
    if (callB.target.operation !== callB.origin.operation) {
        return -1;
    }
    return 0;
}
function findParentCall(calls, origin) {
    return calls.find((call) => origin.parentTarget &&
        (0, targets_1.buildTargetPath)(origin.parentTarget).join(".") ===
            (0, targets_1.buildTargetPath)(call.origin).join("."));
}
function buildArgsFromCalls(calls, rootParams) {
    const finalArgs = (0, cloneArgs_1.cloneArgs)(rootParams.args);
    // calls should update the parent calls updated params
    // sort calls so we set from deepest to shallowest
    // actions that are at the same depth should put action changes at the end
    const sortedCalls = calls.sort((a, b) => {
        const aDepth = (0, targets_1.targetChainLength)(a.target);
        const bDepth = (0, targets_1.targetChainLength)(b.target);
        if (aDepth === bDepth) {
            return moveOperationChangesToEnd(a, b);
        }
        return bDepth - aDepth;
    });
    // eslint-disable-next-line complexity
    sortedCalls.forEach((call, i) => {
        var _a;
        const parentCall = findParentCall(calls.slice(i), call.origin);
        const parentArgs = (parentCall === null || parentCall === void 0 ? void 0 : parentCall.updatedArgs) || finalArgs;
        const parentOperation = (parentCall === null || parentCall === void 0 ? void 0 : parentCall.target.operation) || rootParams.operation;
        const origin = (0, lodash_1.omit)(call.origin, "parentTarget");
        const target = (0, lodash_1.omit)(call.target, "parentTarget");
        if (origin.operation !== target.operation) {
            assertOperationChangeIsValid(origin.operation, target.operation);
        }
        if ((0, targets_1.isWriteTarget)(target) && (0, targets_1.isWriteTarget)(origin)) {
            // if action has not changed use normal target to set args
            if (target.operation === origin.operation) {
                const targetPath = (0, targets_1.buildWriteTargetPath)(target);
                const callTargetArgs = (0, lodash_1.get)(parentArgs, targetPath);
                // if target hasn't changed but is an array it has been merged
                // the original target must be the first element of the array
                if (Array.isArray(callTargetArgs)) {
                    callTargetArgs[0] = call.updatedArgs;
                    return;
                }
                // set the updated args if the target hasn't changed
                (0, lodash_1.set)(parentArgs, targetPath, call.updatedArgs);
                return;
            }
            // if parent action has not changed we can use our normal targets
            if (parentOperation === ((_a = call.scope) === null || _a === void 0 ? void 0 : _a.parentParams.operation)) {
                addWriteToArgs(parentArgs, call.updatedArgs, target, call.scope);
                removeWriteFromArgs(parentArgs, origin);
                return;
            }
            // if parent action has changed we must modify out target to match the
            // parent action
            const fields = 
            // NOTE:- this might need to be origin.operation
            extractNestedOperations_1.fieldsByWriteOperation[target.operation];
            fields.forEach((field) => {
                const newOrigin = { ...origin, field };
                const newTarget = { ...target, field };
                if ((0, lodash_1.get)(parentArgs, (0, targets_1.buildWriteTargetPath)(newOrigin))) {
                    // if action has changed we add merge args with target and remove the
                    // args from the origin
                    addWriteToArgs(parentArgs, call.updatedArgs, newTarget, call.scope);
                    removeWriteFromArgs(parentArgs, newOrigin);
                }
            });
        }
        if ((0, targets_1.isReadTarget)(target) && (0, targets_1.isReadTarget)(origin)) {
            const targetPath = (0, targets_1.buildReadTargetPath)(target);
            // because includes and selects cannot be at the same level we can safely
            // set target path to be the updated args without worrying about
            // overwriting the original args
            (0, lodash_1.set)(parentArgs, targetPath, call.updatedArgs);
            // remove the origin args if the action has changed
            if (target.operation !== origin.operation) {
                removeReadFromArgs(parentArgs, origin);
            }
        }
        if ((0, targets_1.isQueryTarget)(target) && (0, targets_1.isQueryTarget)(origin)) {
            if (target.readOperation) {
                (0, lodash_1.set)(parentArgs, "where", call.updatedArgs);
                return;
            }
            const basePath = parentCall ? [] : ["where"];
            (0, lodash_1.set)(parentArgs, [...basePath, ...(0, targets_1.buildQueryTargetPath)(target)], call.updatedArgs);
        }
    });
    return finalArgs;
}
exports.buildArgsFromCalls = buildArgsFromCalls;
