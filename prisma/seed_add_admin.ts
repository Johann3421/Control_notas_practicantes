import 'dotenv/config'
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

// Safe script to insert (or update) a single admin user without wiping the DB
const rawDatabaseUrl = process.env.DATABASE_URL ?? ""
const connectionString = rawDatabaseUrl.replace(/^\s*"|"\s*$/g, "").replace(/^\s*'|'\s*$/g, "").trim()
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "loritox3421@gmail.com"
  const name = "Tec. Ing. Johann Abad"
  const plainPassword = "podereterno1"

  const hashed = await bcrypt.hash(plainPassword, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashed,
      role: "ADMIN",
    },
    create: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
    },
  })

  console.log(`✅ Upserted admin: ${user.email} (id=${user.id})`)
}

main()
  .catch((e) => {
    console.error("❌ Error en seed_add_admin:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
