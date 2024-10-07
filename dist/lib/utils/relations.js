"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOppositeRelation = exports.getRelationsByModel = void 0;
const dmmf_1 = require("./dmmf");
function getRelationsByModel() {
    const dmmf = (0, dmmf_1.getDmmf)();
    const relationsByModel = {};
    dmmf.datamodel.models.forEach((model) => {
        relationsByModel[model.name] = model.fields.filter((field) => field.kind === "object" && field.relationName);
    });
    return relationsByModel;
}
exports.getRelationsByModel = getRelationsByModel;
function findOppositeRelation(relation) {
    const parentRelations = getRelationsByModel()[relation.type] || [];
    const oppositeRelation = parentRelations.find((parentRelation) => parentRelation !== relation &&
        parentRelation.relationName === relation.relationName);
    if (!oppositeRelation) {
        throw new Error(`Unable to find opposite relation to ${relation.name}`);
    }
    return oppositeRelation;
}
exports.findOppositeRelation = findOppositeRelation;
