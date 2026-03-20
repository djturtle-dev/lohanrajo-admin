import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const names = [
  'Arun Kumar', 'Sanjay Gupta', 'Priya Sharma', 'Rahul Mehta', 'Deepak Verma',
  'Anita Desai', 'Vikram Singh', 'Manoj Pandey', 'Suresh Iyer', 'Kavita Reddy',
  'Rajesh Khanna', 'Sunita Rao', 'Amit Shah', 'Nitin Gadkari', 'Piyush Goyal',
  'Smriti Irani', 'Nirmala Sitharaman', 'Rajnath Singh', 'S. Jaishankar', 'Yogi Adityanath'
]

const reviews = [
  'Excellent quality enclosures! We ordered 50 units and they were perfect.',
  'Best industrial panels in the region. Highly recommended for BMS projects.',
  'The powder coating finish is top-notch. Durable and aesthetically pleasing.',
  'Great service and timely delivery. The custom poles were exactly as specified.',
  'Very professional team. They understood our technical requirements perfectly.',
  'Lohanrajo Metal Arts is our go-to for all our electrical panel needs.',
  'Competitive pricing without compromising on quality. Very satisfied.',
  'The IP67 rating is genuine. We tested it in harsh conditions and it passed.',
  'Impressive factory setup and skilled workforce. It shows in the products.',
  'Been using their products for 5 years now. Never had a single complaint.',
  'Fast turnaround time for custom orders. Very impressed with the agility.',
  'The stainless steel enclosures are beautiful and very well-built.',
  'Great support during the design phase. They offered valuable suggestions.',
  'Strongly recommend for any industrial infrastructure projects.',
  'High quality finish and precise dimensions. Fits exactly as planned.',
  'The best part is their attention to detail. Every weld is perfect.',
  'Reliable partners for long-term projects. We appreciate the consistency.',
  'Outstanding craftsmanship. A gem in the metal arts industry.',
  'Their panels helped us achieve our LEED certification milestones.',
  'Solid products, solid people. A pleasure to do business with.'
]

const sources = ['Google', 'Justdial', 'Direct']

async function main() {
  console.log('Clearing existing testimonials...')
  await prisma.testimonial.deleteMany()

  console.log('Seeding 20 testimonials...')
  
  for (let i = 0; i < 20; i++) {
    await prisma.testimonial.create({
      data: {
        authorName: names[i],
        content: reviews[i],
        rating: Math.random() > 0.3 ? 5 : 4,
        source: sources[Math.floor(Math.random() * sources.length)],
        featured: i < 6, // First 6 are featured
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      }
    })
  }

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
