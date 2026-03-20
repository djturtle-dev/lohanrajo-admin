import { prisma } from './lib/prisma.js';

async function test() {
  try {
    const p = await prisma.product.create({
      data: {
        name: "Test Product " + Date.now(),
        category: "Other",
        description: "Test description"
      }
    });
    console.log("Success:", p);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
