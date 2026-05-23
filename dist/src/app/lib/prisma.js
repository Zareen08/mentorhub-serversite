import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "../config/env.js";
const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
if (env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
