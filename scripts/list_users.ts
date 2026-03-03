import 'dotenv/config'
import { prisma } from '../src/lib/prisma'

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } })
}

main()
  .catch((e)=>{ console.error(e); process.exit(1) })
  .finally(async ()=>{ await prisma.$disconnect() })
