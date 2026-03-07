import 'dotenv/config'
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

// Script to transfer all mentorship/assignment relationships from one user to another
// Usage:
//   SOURCE_ADMIN_EMAIL=admin@devtrack.com TARGET_ADMIN_EMAIL=loritox3421@gmail.com npx tsx prisma/transfer_admin_ownership.ts

const rawDatabaseUrl = process.env.DATABASE_URL ?? ""
const connectionString = rawDatabaseUrl.replace(/^\s*"|"\s*$/g, "").replace(/^\s*'|'\s*$/g, "").trim()
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const sourceEmail = process.env.SOURCE_ADMIN_EMAIL ?? 'admin@devtrack.com'
  const targetEmail = process.env.TARGET_ADMIN_EMAIL ?? 'loritox3421@gmail.com'

  console.log(`Transferring ownership from ${sourceEmail} -> ${targetEmail}`)

  const source = await prisma.user.findUnique({ where: { email: sourceEmail } })
  if (!source) {
    console.error(`Source user not found: ${sourceEmail}`)
    process.exit(1)
  }

  const target = await prisma.user.findUnique({ where: { email: targetEmail } })
  if (!target) {
    console.error(`Target user not found: ${targetEmail}`)
    process.exit(1)
  }

  if (source.id === target.id) {
    console.log('Source and target are the same user — nothing to do.')
    return
  }

  // Run updates in a transaction for safety
  const results = await prisma.$transaction([
    prisma.intern.updateMany({ where: { mentorId: source.id }, data: { mentorId: target.id } }),
    prisma.weeklyEvaluation.updateMany({ where: { evaluatedBy: source.id }, data: { evaluatedBy: target.id } }),
    prisma.task.updateMany({ where: { assignedBy: source.id }, data: { assignedBy: target.id } }),
    prisma.attendanceRecord.updateMany({ where: { recordedBy: source.id }, data: { recordedBy: target.id } }),
  ])

  const [internsUpdated, evalsUpdated, tasksUpdated, attendanceUpdated] = results

  console.log(`✅ Done:`)
  console.log(`  - Interns reassigned: ${internsUpdated.count}`)
  console.log(`  - Weekly evaluations reassigned: ${evalsUpdated.count}`)
  console.log(`  - Tasks reassigned: ${tasksUpdated.count}`)
  console.log(`  - Attendance records reassigned: ${attendanceUpdated.count}`)
}

main()
  .catch((e) => {
    console.error('❌ Error in transfer_admin_ownership:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
