import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const demoData = [
      {
        catName: 'Canvas Prints',
        catSlug: 'canvas-prints',
        catDesc: 'High quality stretched canvas wall art.',
        tempName: 'Canvas Template',
        tempSlug: 'canvas-template',
        prodName: 'Premium Custom Canvas',
        basePrice: 1999.00,
        tags: ['canvas', 'wall art', 'home decor']
      },
      {
        catName: 'Custom Mugs',
        catSlug: 'custom-mugs',
        catDesc: 'Personalized coffee mugs for every occasion.',
        tempName: 'Mug Wrap Template',
        tempSlug: 'mug-template',
        prodName: 'Magic Color Changing Mug',
        basePrice: 499.00,
        tags: ['mug', 'gift', 'coffee']
      },
      {
        catName: 'Photo Books',
        catSlug: 'photo-books',
        catDesc: 'Beautifully bound photo albums to cherish memories.',
        tempName: 'Photo Book Cover',
        tempSlug: 'photobook-template',
        prodName: 'Hardcover Memory Book',
        basePrice: 2499.00,
        tags: ['album', 'photobook', 'memories']
      },
      {
        catName: 'Phone Cases',
        catSlug: 'phone-cases',
        catDesc: 'Custom printed phone cases for all popular models.',
        tempName: 'Phone Case Back',
        tempSlug: 'phonecase-template',
        prodName: 'Custom iPhone Case',
        basePrice: 799.00,
        tags: ['phone case', 'accessories', 'custom']
      }
    ];

    for (const item of demoData) {
      // Create or get Category
      const category = await prisma.category.upsert({
        where: { slug: item.catSlug },
        update: {},
        create: {
          name: item.catName,
          slug: item.catSlug,
          description: item.catDesc,
          isActive: true,
        },
      });

      // Create or get Template
      const template = await prisma.template.upsert({
        where: { slug: item.tempSlug },
        update: {},
        create: {
          name: item.tempName,
          slug: item.tempSlug,
          canvasWidth: 1000,
          canvasHeight: 1000,
          templateJson: {
            canvas: { width: 1000, height: 1000 },
            editableRegions: [
              { id: "main_img", type: "rectangle", x: 100, y: 100, width: 800, height: 800 }
            ]
          },
          productType: item.catSlug,
          isActive: true,
        },
      });

      // Create Product
      await prisma.product.create({
        data: {
          name: item.prodName,
          slug: `${item.catSlug}-product-${Date.now()}`,
          description: `This is a beautiful ${item.prodName}. Custom made to your perfection.`,
          categoryId: category.id,
          templateId: template.id,
          variants: [
            {
              dim: 'Standard',
              thick: 'Standard',
              price: item.basePrice,
              discountprice: item.basePrice,
              stocks: 100
            }
          ],
          images: [],
          tags: item.tags,
          shape: 'rectangle',
          isFeatured: true,
          isTrending: true,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Added 4 products in 4 new categories successfully!' });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to add data', details: error.message }, { status: 500 });
  }
}
