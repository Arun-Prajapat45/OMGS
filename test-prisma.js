const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: 'Test Product 3D',
        slug: 'test-product-3d',
        categoryId: 'cm21pif5m000c2u8w5o9e8y5m', // some id
        templateId: 'cm21pif5m000c2u8w5o9e8y5m', // some id
        images: [],
        variants: [],
        tags: [],
        features: [],
        customizationRules: {},
        seo: {},
        shape: 'rectangle',
        stock: 100,
        isActive: true,
        isFeatured: false,
        isTrending: false,
        is3dEnabled: false,
        threeDModelUrl: null
      },
    });
    console.log(newProduct);
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
