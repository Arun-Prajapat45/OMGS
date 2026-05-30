'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeDiscountPrice(variant) {
  if (variant.discountPrice != null) return Number(variant.discountPrice);
  return Number(variant.price || 0);
}

function buildJsonVariant({ size, thickness, name, price, discountPrice, stock }) {
  return {
    dim: size || name || 'Standard',
    thick: thickness != null ? String(thickness) : 'Standard',
    price: Number(price || 0),
    discountprice: normalizeDiscountPrice({ price, discountPrice }),
    stocks: Number(stock || 0),
  };
}

async function migrate() {
  console.log('Starting product variant migration to JSON field...');
  const products = await prisma.product.findMany({
    include: { variantRecords: true },
  });

  for (const product of products) {
    let jsonVariants = [];

    if (Array.isArray(product.variantRecords) && product.variantRecords.length > 0) {
      jsonVariants = product.variantRecords.map((variant) => buildJsonVariant(variant));
    } else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      jsonVariants = product.variants.map((variant) => ({
        dim: variant.dim || variant.size || variant.name || 'Standard',
        thick: variant.thick != null ? String(variant.thick) : String(variant.thickness || 'Standard'),
        price: Number(variant.price || 0),
        discountprice: variant.discountprice != null ? Number(variant.discountprice) : normalizeDiscountPrice(variant),
        stocks: Number(variant.stocks || variant.stock || 0),
      }));
    } else if (product.variants || product.variantRecords) {
      // fallback if fields are present but not arrays
      jsonVariants = [];
    }

    if (jsonVariants.length === 0) {
      const fallbackPrice = (product.discountPrice != null ? Number(product.discountPrice) : Number(product.basePrice || 0));
      if (fallbackPrice > 0) {
        jsonVariants = [{
          dim: 'Standard',
          thick: 'Standard',
          price: Number(product.basePrice || fallbackPrice),
          discountprice: fallbackPrice,
          stocks: Number(product.stock || 0),
        }];
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        variants: jsonVariants,
      },
    });

    console.log(`Migrated product ${product.id} (${product.name}) with ${jsonVariants.length} variant(s)`);
  }

  console.log('Product variant migration complete.');
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
