"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDmmf = exports.setDmmf = void 0;
const client_1 = require("@prisma/client");
let dmmf = client_1.Prisma.dmmf;
function setDmmf(_dmmf) {
    dmmf = _dmmf;
}
exports.setDmmf = setDmmf;
function getDmmf() {
    if (!dmmf) {
        throw new Error("Prisma DMMF not found, please generate Prisma client using `npx prisma generate`");
    }
    return dmmf;
}
exports.getDmmf = getDmmf;
