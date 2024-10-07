export const queryOperations = ["where"];
export const readOperations = ["include", "select"];
export const writeOperations = [
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
export const toOneRelationNonListOperations = [
    "create",
    "update",
    "delete",
    "upsert",
    "connect",
    "connectOrCreate",
    "disconnect",
];
export function isQueryOperation(action) {
    return queryOperations.includes(action);
}
export function isReadOperation(action) {
    return readOperations.includes(action);
}
export function isWriteOperation(action) {
    return writeOperations.includes(action);
}
export const modifiers = ["is", "isNot", "some", "none", "every"];
export const logicalOperators = ["AND", "OR", "NOT"];
