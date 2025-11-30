import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as any;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { LoanBudget, WithdrawRequest, Expense, User, Account, Session } from "@prisma/client";

