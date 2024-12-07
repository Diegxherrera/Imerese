import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"], // Log database queries in development (optional)
    });

export const spaces = await prisma.organization.findMany();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;