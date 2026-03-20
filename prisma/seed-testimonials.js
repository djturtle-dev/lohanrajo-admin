const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const testimonials = [
    {
      authorName: "Geerthana Baskar",
      content: "They make great panel with high level customisations. The communications & discussions are very clear.",
      rating: 5,
      source: "Google",
      featured: true
    },
    {
      authorName: "Padma Mithra",
      content: "Excellent quality and prompt delivery.",
      rating: 5,
      source: "Google",
      featured: true
    },
    {
      authorName: "Ramesh",
      content: "Great service and quality metal arts. Highly recommended for custom enclosures.",
      rating: 4,
      source: "Justdial",
      featured: false
    },
    {
      authorName: "Sivakumar",
      content: "Professional team and top-notch manufacturing quality. Their attention to detail is impressive.",
      rating: 5,
      source: "Google",
      featured: true
    },
    {
      authorName: "Arun Kumar",
      content: "Excellent quality enclosures! We ordered 50 units and they were perfect.",
      rating: 5,
      source: "Google",
      featured: false
    },
    {
      authorName: "Sanjay Gupta",
      content: "Best industrial panels in the region. Highly recommended for BMS projects.",
      rating: 5,
      source: "Justdial",
      featured: false
    }
  ];

  console.log('Clearing existing testimonials...');
  await prisma.testimonial.deleteMany();

  console.log('Seeding testimonials...');
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }

  console.log('Seeded 6 testimonials');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
