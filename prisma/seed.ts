import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    {
      name: 'Enclosures',
      subCategories: ['Mild Steel', 'Stainless Steel', 'Plastic', 'Aluminium']
    },
    {
      name: 'Panels',
      subCategories: ['Power', 'Control', 'Distribution', 'Instrument']
    },
    {
      name: 'Accessories',
      subCategories: ['Cable Glands', 'Locks', 'Hinges', 'Mounting Plates']
    }
  ]

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    })

    for (const sub of cat.subCategories) {
      await prisma.subCategory.upsert({
        where: { name: sub },
        update: { categoryId: category.id },
        create: { 
          name: sub,
          categoryId: category.id
        },
      })
    }
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
