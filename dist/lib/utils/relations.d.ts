import { Prisma } from "@prisma/client";
export declare function getRelationsByModel(): Record<string, Prisma.DMMF.Field[]>;
export declare function findOppositeRelation(relation: Prisma.DMMF.Field): Prisma.DMMF.Field;
