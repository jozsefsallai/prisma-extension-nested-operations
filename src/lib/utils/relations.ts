import { Prisma } from "@prisma/client";
import { getDmmf } from './dmmf';

export function getRelationsByModel(): Record<string, Prisma.DMMF.Field[]> {
  const dmmf = getDmmf();
  const relationsByModel: Record<string, Prisma.DMMF.Field[]> = {};

  dmmf.datamodel.models.forEach((model: Prisma.DMMF.Model) => {
    relationsByModel[model.name] = model.fields.filter(
      (field) => field.kind === "object" && field.relationName
    );
  });

  return relationsByModel;
  
}



export function findOppositeRelation(relation: Prisma.DMMF.Field): Prisma.DMMF.Field {
  const parentRelations =
    getRelationsByModel()[relation.type as Prisma.ModelName] || [];

  const oppositeRelation = parentRelations.find(
    (parentRelation) =>
      parentRelation !== relation &&
      parentRelation.relationName === relation.relationName
  );

  if (!oppositeRelation) {
    throw new Error(`Unable to find opposite relation to ${relation.name}`);
  }

  return oppositeRelation;
}
