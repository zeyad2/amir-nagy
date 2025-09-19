import { PrismaClient } from "@prisma/client";
const Prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = Prisma;
export default Prisma;