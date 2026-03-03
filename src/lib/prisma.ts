import type { PrismaClient } from "@/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  // Dynamically require the generated Prisma client at runtime to avoid
  // importing node:* builtins during module evaluation in non-Node runtimes.
  // Use eval('require') so bundlers don't hoist/transform the require call.
  const pathLib = eval("require")("path") as typeof import("path")
  const clientPath = pathLib.join(process.cwd(), "src", "generated", "prisma", "client")
  // Require the generated client module.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const required = eval("require")(clientPath)
  const PrismaClientCtor = required.PrismaClient ?? required.default?.PrismaClient ?? required.default

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  const adapter = new PrismaPg(pool)
  return new PrismaClientCtor({ adapter })
}

// Lazy initialization via Proxy — avoids PrismaClient constructor during next build
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return Reflect.get(globalForPrisma.prisma, prop)
  },
})
