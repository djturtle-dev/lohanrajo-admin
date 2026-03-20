import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  console.log('Prisma Models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')))
  try {
    const content = await (prisma as any).aboutContent.findUnique({ where: { id: 'singleton' } })
    console.log('Found:', content)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
