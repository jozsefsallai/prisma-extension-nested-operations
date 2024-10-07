"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneArgs = void 0;
const client_1 = require("@prisma/client");
const lodash_1 = require("lodash");
// Prisma v4 requires that instances of Prisma.NullTypes are not cloned,
// otherwise it will parse them as 'undefined' and the operation will fail.
function passThroughNullTypes(value) {
    if (value instanceof client_1.Prisma.NullTypes.DbNull ||
        value instanceof client_1.Prisma.NullTypes.JsonNull ||
        value instanceof client_1.Prisma.NullTypes.AnyNull) {
        return value;
    }
}
function cloneArgs(args) {
    // only handle null types if they are present, Prisma versions lower than v4
    // do not have them and we can clone the string values as usual
    if (client_1.Prisma.NullTypes) {
        return (0, lodash_1.cloneDeepWith)(args, passThroughNullTypes);
    }
    return (0, lodash_1.cloneDeep)(args);
}
exports.cloneArgs = cloneArgs;
