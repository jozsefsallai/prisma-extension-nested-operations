"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logicalOperators = exports.modifiers = exports.isWriteOperation = exports.isReadOperation = exports.isQueryOperation = exports.toOneRelationNonListOperations = exports.writeOperations = exports.readOperations = exports.queryOperations = void 0;
exports.queryOperations = ["where"];
exports.readOperations = ["include", "select"];
exports.writeOperations = [
    "create",
    "update",
    "upsert",
    "createMany",
    "updateMany",
    "delete",
    "deleteMany",
    "disconnect",
    "connect",
    "connectOrCreate",
];
exports.toOneRelationNonListOperations = [
    "create",
    "update",
    "delete",
    "upsert",
    "connect",
    "connectOrCreate",
    "disconnect",
];
function isQueryOperation(action) {
    return exports.queryOperations.includes(action);
}
exports.isQueryOperation = isQueryOperation;
function isReadOperation(action) {
    return exports.readOperations.includes(action);
}
exports.isReadOperation = isReadOperation;
function isWriteOperation(action) {
    return exports.writeOperations.includes(action);
}
exports.isWriteOperation = isWriteOperation;
exports.modifiers = ["is", "isNot", "some", "none", "every"];
exports.logicalOperators = ["AND", "OR", "NOT"];
