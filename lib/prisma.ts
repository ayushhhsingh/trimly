import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Execute a Prisma operation with retry logic to handle Neon cold starts.
 * Neon free-tier databases auto-suspend after inactivity; the first query
 * after suspension may fail with P1001 while the database wakes up.
 * Retrying with a small delay almost always succeeds.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; delayMs?: number; label?: string } = {}
): Promise<T> {
  const { retries = 3, delayMs = 1500, label = "prisma" } = options;
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const code = (error as { code?: string })?.code;
      const isConnectionError =
        code === "P1001" || // Can't reach database server
        code === "P1002" || // Database server timed out
        code === "P1017"; // Server has closed the connection

      if (!isConnectionError || attempt === retries) {
        throw error;
      }

      console.warn(
        `[${label}] connection error (${code}), retrying in ${delayMs}ms (attempt ${attempt}/${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
