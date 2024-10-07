"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNestedOperations = exports.extractRelationReadOperations = exports.extractRelationWriteOperations = exports.extractRelationWhereOperations = exports.extractRelationLogicalWhereOperations = exports.fieldsByWriteOperation = void 0;
const get_1 = __importDefault(require("lodash/get"));
const operations_1 = require("./operations");
const relations_1 = require("./relations");
// actions have nested relations inside fields within the args object, sometimes
// relations are defined directly in the args object because the action is in a
// to one relation, for example the update action. Add undefined for actions where this
// can happen
exports.fieldsByWriteOperation = {
    create: [undefined, "data"],
    update: [undefined, "data"],
    upsert: ["update", "create"],
    connectOrCreate: ["create"],
    createMany: ["data"],
    updateMany: ["data"],
    connect: [],
    disconnect: [],
    delete: [],
    deleteMany: [],
};
function extractRelationLogicalWhereOperations(params, parentTarget, parentOperations = []) {
    const relations = (0, relations_1.getRelationsByModel)()[params.model || ""] || [];
    const nestedWhereOperations = [];
    const operationsPath = [];
    parentOperations.forEach(({ logicalOperator, index }) => {
        operationsPath.push(logicalOperator);
        if (typeof index === "number") {
            operationsPath.push(index.toString());
        }
    });
    operations_1.logicalOperators.forEach((logicalOperator) => {
        const baseArgPath = params.scope ? ["args"] : ["args", "where"];
        const logicalArg = (0, get_1.default)(params, [
            ...baseArgPath,
            ...operationsPath,
            logicalOperator,
        ]);
        if (!logicalArg)
            return;
        const nestedOperators = Array.isArray(logicalArg)
            ? logicalArg.map((_, index) => ({ logicalOperator, index }))
            : [{ logicalOperator }];
        nestedOperators.forEach((nestedOperator) => {
            nestedWhereOperations.push(...extractRelationLogicalWhereOperations(params, parentTarget, [
                ...parentOperations,
                nestedOperator,
            ]));
        });
        relations.forEach((relation) => {
            const model = relation.type;
            const oppositeRelation = (0, relations_1.findOppositeRelation)(relation);
            if (Array.isArray(logicalArg)) {
                logicalArg.forEach((where, index) => {
                    const arg = where === null || where === void 0 ? void 0 : where[relation.name];
                    if (!arg)
                        return;
                    const logicalOperations = [
                        ...parentOperations,
                        { logicalOperator, index },
                    ];
                    const foundModifiers = operations_1.modifiers.filter((mod) => arg[mod]);
                    // if there are no modifiers call the where action without a modifier
                    if (!foundModifiers.length) {
                        nestedWhereOperations.push({
                            target: {
                                operation: "where",
                                relationName: relation.name,
                                logicalOperations,
                                parentTarget,
                            },
                            params: {
                                model,
                                operation: "where",
                                args: arg,
                                scope: {
                                    parentParams: params,
                                    logicalOperators: logicalOperations.map((op) => op.logicalOperator),
                                    relations: { to: relation, from: oppositeRelation },
                                },
                                query: params.query,
                            },
                        });
                        return;
                    }
                    // if there are modifiers call the where action with each modifier but
                    // not the action without a modifier
                    foundModifiers.forEach((modifier) => {
                        nestedWhereOperations.push({
                            target: {
                                operation: "where",
                                relationName: relation.name,
                                modifier,
                                logicalOperations,
                                parentTarget,
                            },
                            params: {
                                model,
                                operation: "where",
                                args: arg[modifier],
                                scope: {
                                    parentParams: params,
                                    modifier,
                                    logicalOperators: logicalOperations.map((op) => op.logicalOperator),
                                    relations: { to: relation, from: oppositeRelation },
                                },
                                query: params.query,
                            },
                        });
                    });
                });
                return;
            }
            const arg = logicalArg[relation.name];
            if (!arg)
                return;
            const logicalOperations = [...parentOperations, { logicalOperator }];
            const foundModifiers = operations_1.modifiers.filter((mod) => arg[mod]);
            if (!foundModifiers.length) {
                nestedWhereOperations.push({
                    target: {
                        operation: "where",
                        relationName: relation.name,
                        logicalOperations,
                        parentTarget,
                    },
                    params: {
                        model,
                        operation: "where",
                        args: arg,
                        scope: {
                            parentParams: params,
                            logicalOperators: logicalOperations.map((op) => op.logicalOperator),
                            relations: { to: relation, from: oppositeRelation },
                        },
                        query: params.query,
                    },
                });
                return;
            }
            foundModifiers.forEach((modifier) => {
                nestedWhereOperations.push({
                    target: {
                        operation: "where",
                        relationName: relation.name,
                        modifier,
                        logicalOperations,
                        parentTarget,
                    },
                    params: {
                        model,
                        operation: "where",
                        args: modifier ? arg[modifier] : arg,
                        scope: {
                            parentParams: params,
                            modifier,
                            logicalOperators: logicalOperations.map((op) => op.logicalOperator),
                            relations: { to: relation, from: oppositeRelation },
                        },
                        query: params.query,
                    },
                });
            });
        });
    });
    return nestedWhereOperations;
}
exports.extractRelationLogicalWhereOperations = extractRelationLogicalWhereOperations;
function extractRelationWhereOperations(params, parentTarget) {
    const relations = (0, relations_1.getRelationsByModel)()[params.model || ""] || [];
    const nestedWhereOperations = extractRelationLogicalWhereOperations(params, parentTarget);
    relations.forEach((relation) => {
        const model = relation.type;
        const oppositeRelation = (0, relations_1.findOppositeRelation)(relation);
        const baseArgPath = params.scope ? ["args"] : ["args", "where"];
        const arg = (0, get_1.default)(params, [...baseArgPath, relation.name]);
        if (!arg)
            return;
        const foundModifiers = operations_1.modifiers.filter((mod) => arg[mod]);
        if (!foundModifiers.length) {
            nestedWhereOperations.push({
                target: {
                    operation: "where",
                    relationName: relation.name,
                    parentTarget,
                },
                params: {
                    model,
                    operation: "where",
                    args: arg,
                    scope: {
                        parentParams: params,
                        relations: { to: relation, from: oppositeRelation },
                    },
                    query: params.query,
                },
            });
            return;
        }
        foundModifiers.forEach((modifier) => {
            nestedWhereOperations.push({
                target: {
                    operation: "where",
                    relationName: relation.name,
                    modifier,
                    parentTarget,
                },
                params: {
                    model,
                    operation: "where",
                    args: modifier ? arg[modifier] : arg,
                    scope: {
                        parentParams: params,
                        modifier,
                        relations: { to: relation, from: oppositeRelation },
                    },
                    query: params.query,
                },
            });
        });
    });
    return nestedWhereOperations.concat(nestedWhereOperations.flatMap((nestedOperationInfo) => extractRelationWhereOperations(nestedOperationInfo.params, nestedOperationInfo.target)));
}
exports.extractRelationWhereOperations = extractRelationWhereOperations;
function extractRelationWriteOperations(params, parentTarget) {
    const relations = (0, relations_1.getRelationsByModel)()[params.model || ""] || [];
    if (!(0, operations_1.isWriteOperation)(params.operation))
        return [];
    const nestedWriteOperations = [];
    const fields = exports.fieldsByWriteOperation[params.operation] || [];
    relations.forEach((relation) => {
        const model = relation.type;
        const oppositeRelation = (0, relations_1.findOppositeRelation)(relation);
        fields.forEach((field) => {
            const argPath = ["args", field, relation.name].filter((part) => !!part);
            const arg = (0, get_1.default)(params, argPath, {});
            Object.keys(arg)
                .filter(operations_1.isWriteOperation)
                .forEach((operation) => {
                /*
                  Add single writes passed as a list as separate operations.
        
                  Checking if the operation is an array is enough since only lists of
                  separate operations are passed as arrays at the top level. For example
                  a nested create may be passed as an array but a nested createMany will
                  pass an object with a data array.
                */
                if (Array.isArray(arg[operation])) {
                    nestedWriteOperations.push(...arg[operation].map((item, index) => ({
                        target: {
                            field,
                            relationName: relation.name,
                            operation,
                            index,
                            parentTarget,
                        },
                        params: {
                            model,
                            operation,
                            args: item,
                            scope: {
                                parentParams: params,
                                relations: { to: relation, from: oppositeRelation },
                            },
                            query: params.query,
                        },
                    })));
                    return;
                }
                nestedWriteOperations.push({
                    target: {
                        field,
                        relationName: relation.name,
                        operation,
                        parentTarget,
                    },
                    params: {
                        model,
                        operation,
                        args: arg[operation],
                        scope: {
                            parentParams: params,
                            relations: { to: relation, from: oppositeRelation },
                        },
                        query: params.query,
                    },
                });
            });
        });
    });
    return nestedWriteOperations.concat(nestedWriteOperations.flatMap((nestedOperationInfo) => extractRelationWriteOperations(nestedOperationInfo.params, nestedOperationInfo.target)));
}
exports.extractRelationWriteOperations = extractRelationWriteOperations;
function extractRelationReadOperations(params, parentTarget) {
    const relations = (0, relations_1.getRelationsByModel)()[params.model || ""] || [];
    const nestedOperations = [];
    relations.forEach((relation) => {
        const model = relation.type;
        const oppositeRelation = (0, relations_1.findOppositeRelation)(relation);
        operations_1.readOperations.forEach((operation) => {
            var _a, _b;
            const arg = (0, get_1.default)(params, ["args", operation, relation.name]);
            if (!arg)
                return;
            const readOperationInfo = {
                params: {
                    model,
                    operation,
                    args: arg,
                    scope: {
                        parentParams: params,
                        relations: { to: relation, from: oppositeRelation },
                    },
                    // this needs to be nested query function
                    query: params.query,
                },
                target: { operation, relationName: relation.name, parentTarget },
            };
            nestedOperations.push(readOperationInfo);
            if ((_a = readOperationInfo.params.args) === null || _a === void 0 ? void 0 : _a.where) {
                const whereOperationInfo = {
                    target: {
                        operation: "where",
                        relationName: relation.name,
                        readOperation: operation,
                        parentTarget: readOperationInfo.target,
                    },
                    params: {
                        model: readOperationInfo.params.model,
                        operation: "where",
                        args: readOperationInfo.params.args.where,
                        scope: {
                            parentParams: readOperationInfo.params,
                            relations: readOperationInfo.params.scope.relations,
                        },
                        query: params.query,
                    },
                };
                nestedOperations.push(whereOperationInfo);
                nestedOperations.push(...extractRelationWhereOperations(whereOperationInfo.params, whereOperationInfo.target));
            }
            // push select nested in an include
            if (operation === "include" && arg.select) {
                const nestedSelectOperationInfo = {
                    params: {
                        model,
                        operation: "select",
                        args: arg.select,
                        scope: {
                            parentParams: readOperationInfo.params,
                            relations: readOperationInfo.params.scope.relations,
                        },
                        query: params.query,
                    },
                    target: {
                        field: "include",
                        operation: "select",
                        relationName: relation.name,
                        parentTarget,
                    },
                };
                nestedOperations.push(nestedSelectOperationInfo);
                if ((_b = nestedSelectOperationInfo.params.args) === null || _b === void 0 ? void 0 : _b.where) {
                    const whereOperationInfo = {
                        target: {
                            operation: "where",
                            relationName: relation.name,
                            readOperation: "select",
                            parentTarget: nestedSelectOperationInfo.target,
                        },
                        params: {
                            model: nestedSelectOperationInfo.params.model,
                            operation: "where",
                            args: nestedSelectOperationInfo.params.args.where,
                            scope: {
                                parentParams: nestedSelectOperationInfo.params,
                                relations: nestedSelectOperationInfo.params.scope.relations,
                            },
                            query: params.query,
                        },
                    };
                    nestedOperations.push(whereOperationInfo);
                    nestedOperations.push(...extractRelationWhereOperations(whereOperationInfo.params, whereOperationInfo.target));
                }
            }
        });
    });
    return nestedOperations.concat(nestedOperations.flatMap((nestedOperation) => extractRelationReadOperations(nestedOperation.params, nestedOperation.target)));
}
exports.extractRelationReadOperations = extractRelationReadOperations;
function extractNestedOperations(params) {
    return [
        ...extractRelationWhereOperations(params),
        ...extractRelationReadOperations(params),
        ...extractRelationWriteOperations(params),
    ];
}
exports.extractNestedOperations = extractNestedOperations;
