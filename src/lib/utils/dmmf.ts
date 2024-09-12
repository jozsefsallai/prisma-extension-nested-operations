import { Prisma } from "@prisma/client";

let dmmf = Prisma.dmmf;

export function setDmmf(_dmmf: typeof Prisma.dmmf) {
  dmmf = _dmmf;
}

export function getDmmf() {
  if (!dmmf) {
    throw new Error(
      "Prisma DMMF not found, please generate Prisma client using `npx prisma generate`"
    );
  }

  return dmmf;
}
