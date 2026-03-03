import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  const email = process.argv[2] || 'carlos@devtrack.com'
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found')
    process.exit(2)
  }
  
  const valid = await bcrypt.compare('password123', user.password)
  
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
