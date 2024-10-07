"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.targetChainLength = exports.buildTargetRelationPath = exports.buildTargetPath = exports.buildReadTargetPath = exports.buildWriteTargetPath = exports.buildQueryTargetPath = exports.buildOperationsPath = exports.isWriteTarget = exports.isReadTarget = exports.isQueryTarget = void 0;
const operations_1 = require("./operations");
function isQueryTarget(target) {
    return (0, operations_1.isQueryOperation)(target.operation);
}
exports.isQueryTarget = isQueryTarget;
function isReadTarget(target) {
    return (0, operations_1.isReadOperation)(target.operation);
}
exports.isReadTarget = isReadTarget;
function isWriteTarget(target) {
    return (0, operations_1.isWriteOperation)(target.operation);
}
exports.isWriteTarget = isWriteTarget;
function buildOperationsPath(operations) {
    if (!operations)
        return [];
    return operations.flatMap((op) => {
        if (typeof op.index === "number")
            return [op.logicalOperator, op.index.toString()];
        return [op.logicalOperator];
    });
}
exports.buildOperationsPath = buildOperationsPath;
function buildQueryTargetPath(target) {
    const path = target.parentTarget
        ? buildTargetPath(target.parentTarget)
        : [];
    if (!target.relationName) {
        return [...path, target.operation];
    }
    if (target.logicalOperations) {
        path.push(...buildOperationsPath(target.logicalOperations));
    }
    if (target.readOperation) {
        path.push(target.readOperation);
    }
    path.push(target.relationName);
    if (target.readOperation) {
        path.push("where");
    }
    if (target.modifier) {
        path.push(target.modifier);
    }
    return path;
}
exports.buildQueryTargetPath = buildQueryTargetPath;
function buildWriteTargetPath(target) {
    const path = target.parentTarget ? buildTargetPath(target.parentTarget) : [];
    if (target.field) {
        path.push(target.field);
    }
    path.push(target.relationName, target.operation);
    if (typeof target.index === "number") {
        path.push(target.index.toString());
    }
    return path;
}
exports.buildWriteTargetPath = buildWriteTargetPath;
function buildReadTargetPath(target) {
    const path = target.parentTarget ? buildTargetPath(target.parentTarget) : [];
    if (!target.relationName) {
        return [...path, target.operation];
    }
    if (!target.field) {
        return [...path, target.operation, target.relationName];
    }
    return [...path, target.field, target.relationName, target.operation];
}
exports.buildReadTargetPath = buildReadTargetPath;
function buildTargetPath(target) {
    if (isQueryTarget(target))
        return buildQueryTargetPath(target);
    if (isReadTarget(target))
        return buildReadTargetPath(target);
    return buildWriteTargetPath(target);
}
exports.buildTargetPath = buildTargetPath;
const buildTargetRelationPath = (target) => {
    if (!isReadTarget(target))
        return null;
    if (target.parentTarget) {
        const basePath = (0, exports.buildTargetRelationPath)(target.parentTarget);
        if (!basePath)
            return null;
        return target.relationName ? [...basePath, target.relationName] : basePath;
    }
    return target.relationName ? [target.relationName] : [];
};
exports.buildTargetRelationPath = buildTargetRelationPath;
function targetChainLength(target, count = 0) {
    if (!target.parentTarget) {
        return count + 1;
    }
    return targetChainLength(target.parentTarget, count + 1);
}
exports.targetChainLength = targetChainLength;
