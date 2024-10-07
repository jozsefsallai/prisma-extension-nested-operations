import { getDmmf } from './dmmf';
export function getRelationsByModel() {
    const dmmf = getDmmf();
    const relationsByModel = {};
    dmmf.datamodel.models.forEach((model) => {
        relationsByModel[model.name] = model.fields.filter((field) => field.kind === "object" && field.relationName);
    });
    return relationsByModel;
}
export function findOppositeRelation(relation) {
    const parentRelations = getRelationsByModel()[relation.type] || [];
    const oppositeRelation = parentRelations.find((parentRelation) => parentRelation !== relation &&
        parentRelation.relationName === relation.relationName);
    if (!oppositeRelation) {
        throw new Error(`Unable to find opposite relation to ${relation.name}`);
    }
    return oppositeRelation;
}
