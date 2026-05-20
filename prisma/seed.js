
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PRODUCT_TEMPLATES = [
  {
    id: 'acrylic-square-single',
    name: 'Acrylic Square Photo',
    productType: 'acrylic-wall-photo',
    shape: 'square',
    canvas: { width: 1000, height: 1000, backgroundColor: '#ffffff' },
    overlays: [
      { type: 'gloss', opacity: 0.15, blend: 'screen' },
      { type: 'reflection', opacity: 0.08, angle: 135 },
    ],
    editableRegions: [
      { id: 'main', type: 'rectangle', x: 40, y: 40, width: 920, height: 920, cornerRadius: 12, placeholder: 'Upload your photo', allowText: false, smartCrop: true },
    ],
    printSizes: [
      { label: '6×6 inch', width: 6, height: 6, price: 599 },
      { label: '8×8 inch', width: 8, height: 8, price: 799 },
      { label: '10×10 inch', width: 10, height: 10, price: 999 },
      { label: '12×12 inch', width: 12, height: 12, price: 1299 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 200 },
    ],
  },
  {
    id: 'acrylic-portrait-single',
    name: 'Acrylic Portrait Photo',
    productType: 'acrylic-wall-photo',
    shape: 'portrait',
    canvas: { width: 800, height: 1100, backgroundColor: '#ffffff' },
    overlays: [
      { type: 'gloss', opacity: 0.15, blend: 'screen' },
      { type: 'reflection', opacity: 0.08, angle: 135 },
    ],
    editableRegions: [
      { id: 'main', type: 'rectangle', x: 30, y: 30, width: 740, height: 1040, cornerRadius: 10, placeholder: 'Upload your photo', allowText: false, smartCrop: true },
    ],
    printSizes: [
      { label: '4×6 inch', width: 4, height: 6, price: 499 },
      { label: '5×7 inch', width: 5, height: 7, price: 699 },
      { label: '8×10 inch', width: 8, height: 10, price: 899 },
      { label: '12×16 inch', width: 12, height: 16, price: 1499 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 200 },
    ],
  },
  {
    id: 'acrylic-landscape-single',
    name: 'Acrylic Landscape Photo',
    productType: 'acrylic-wall-photo',
    shape: 'landscape',
    canvas: { width: 1100, height: 800, backgroundColor: '#ffffff' },
    overlays: [
      { type: 'gloss', opacity: 0.15, blend: 'screen' },
    ],
    editableRegions: [
      { id: 'main', type: 'rectangle', x: 30, y: 30, width: 1040, height: 740, cornerRadius: 10, placeholder: 'Upload your photo', allowText: false, smartCrop: true },
    ],
    printSizes: [
      { label: '6×4 inch', width: 6, height: 4, price: 499 },
      { label: '8×5 inch', width: 8, height: 5, price: 699 },
      { label: '10×8 inch', width: 10, height: 8, price: 899 },
      { label: '16×12 inch', width: 16, height: 12, price: 1499 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 200 },
    ],
  },
  {
    id: 'acrylic-circle-single',
    name: 'Circle Acrylic Print',
    productType: 'circle-acrylic',
    shape: 'circle',
    canvas: { width: 1000, height: 1000, backgroundColor: 'transparent' },
    overlays: [
      { type: 'gloss', opacity: 0.2, blend: 'screen' },
      { type: 'reflection', opacity: 0.1, angle: 45 },
    ],
    editableRegions: [
      { id: 'main', type: 'circle', x: 500, y: 500, radius: 460, placeholder: 'Upload your photo', smartCrop: true, allowText: false },
    ],
    printSizes: [
      { label: '6 inch diameter', width: 6, height: 6, price: 699 },
      { label: '8 inch diameter', width: 8, height: 8, price: 899 },
      { label: '10 inch diameter', width: 10, height: 10, price: 1099 },
      { label: '12 inch diameter', width: 12, height: 12, price: 1399 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 250 },
    ],
  },
  {
    id: 'acrylic-oval-single',
    name: 'Oval Acrylic Print',
    productType: 'oval-acrylic',
    shape: 'oval',
    canvas: { width: 1000, height: 900, backgroundColor: 'transparent' },
    overlays: [
      { type: 'gloss', opacity: 0.18, blend: 'screen' },
      { type: 'reflection', opacity: 0.08, angle: 45 },
    ],
    editableRegions: [
      { id: 'main', type: 'oval', x: 500, y: 450, width: 900, height: 700, placeholder: 'Upload your photo', smartCrop: true, allowText: false },
    ],
    printSizes: [
      { label: '6×8 inch', width: 6, height: 8, price: 749 },
      { label: '8×10 inch', width: 8, height: 10, price: 999 },
      { label: '10×12 inch', width: 10, height: 12, price: 1299 },
      { label: '12×14 inch', width: 12, height: 14, price: 1599 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 250 },
    ],
  },
  {
    id: 'acrylic-egg-single',
    name: 'Egg Acrylic Print',
    productType: 'egg-acrylic',
    shape: 'egg',
    canvas: { width: 1000, height: 900, backgroundColor: 'transparent' },
    overlays: [
      { type: 'gloss', opacity: 0.18, blend: 'screen' },
      { type: 'reflection', opacity: 0.08, angle: 45 },
    ],
    editableRegions: [
      { id: 'main', type: 'egg', x: 500, y: 470, width: 860, height: 760, placeholder: 'Upload your photo', smartCrop: true, allowText: false },
    ],
    printSizes: [
      { label: '6×8 inch', width: 6, height: 8, price: 799 },
      { label: '8×10 inch', width: 8, height: 10, price: 1049 },
      { label: '10×12 inch', width: 10, height: 12, price: 1349 },
      { label: '12×14 inch', width: 12, height: 14, price: 1649 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 250 },
    ],
  },
  {
    id: 'acrylic-heart-single',
    name: 'Heart Acrylic Print',
    productType: 'heart-acrylic',
    shape: 'heart',
    canvas: { width: 1000, height: 1000, backgroundColor: 'transparent' },
    overlays: [
      { type: 'gloss', opacity: 0.2, blend: 'screen' },
      { type: 'reflection', opacity: 0.08, angle: 120 },
    ],
    editableRegions: [
      { id: 'main', type: 'heart', x: 500, y: 500, width: 900, height: 900, placeholder: 'Upload your photo', smartCrop: true, allowText: false },
    ],
    printSizes: [
      { label: '8 inch', width: 8, height: 8, price: 899 },
      { label: '10 inch', width: 10, height: 10, price: 1149 },
      { label: '12 inch', width: 12, height: 12, price: 1399 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 250 },
    ],
  },
  {
    id: 'acrylic-cloud-single',
    name: 'Cloud Acrylic Print',
    productType: 'cloud-acrylic',
    shape: 'cloud',
    canvas: { width: 1000, height: 800, backgroundColor: 'transparent' },
    overlays: [
      { type: 'gloss', opacity: 0.14, blend: 'screen' },
      { type: 'reflection', opacity: 0.08, angle: 55 },
    ],
    editableRegions: [
      { id: 'main', type: 'cloud', x: 500, y: 400, width: 900, height: 520, placeholder: 'Upload your photo', smartCrop: true, allowText: false },
    ],
    printSizes: [
      { label: '8×6 inch', width: 8, height: 6, price: 799 },
      { label: '10×8 inch', width: 10, height: 8, price: 1049 },
      { label: '12×10 inch', width: 12, height: 10, price: 1349 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 250 },
    ],
  },
  {
    id: 'hexa-clock-single',
    name: 'Hexagon Photo Clock',
    productType: 'hexagon-clock',
    shape: 'hexagon',
    canvas: { width: 1000, height: 1000, backgroundColor: 'transparent' },
    overlays: [
      { type: 'clock-hands', opacity: 1 },
      { type: 'gloss', opacity: 0.15, blend: 'screen' },
    ],
    editableRegions: [
      { id: 'main', type: 'hexagon', x: 500, y: 500, radius: 460, placeholder: 'Upload your photo', smartCrop: true, allowText: false },
    ],
    printSizes: [
      { label: '8 inch', width: 8, height: 8, price: 999 },
      { label: '10 inch', width: 10, height: 10, price: 1299 },
      { label: '12 inch', width: 12, height: 12, price: 1599 },
    ],
    thicknesses: [{ label: '5mm', price: 0 }],
    extras: [{ type: 'clock-mechanism', included: true }],
  },
  {
    id: 'hexa-collage-3',
    name: 'Hexagon Collage (3 Photos)',
    productType: 'hexagon-collage',
    shape: 'hexagon',
    canvas: { width: 1400, height: 1200, backgroundColor: 'transparent' },
    overlays: [{ type: 'gloss', opacity: 0.12 }],
    editableRegions: [
      { id: 'hex1', type: 'hexagon', x: 200, y: 300, radius: 200, placeholder: 'Photo 1', smartCrop: true },
      { id: 'hex2', type: 'hexagon', x: 700, y: 100, radius: 200, placeholder: 'Photo 2', smartCrop: true },
      { id: 'hex3', type: 'hexagon', x: 1100, y: 300, radius: 200, placeholder: 'Photo 3', smartCrop: true },
    ],
    printSizes: [
      { label: 'Medium (12×10 inch)', width: 12, height: 10, price: 1999 },
      { label: 'Large (16×14 inch)', width: 16, height: 14, price: 2799 },
    ],
    thicknesses: [{ label: '5mm', price: 0 }],
  },
  {
    id: 'triangle-clock-single',
    name: 'Triangle Acrylic Clock',
    productType: 'triangle-clock',
    shape: 'triangle',
    canvas: { width: 1000, height: 900, backgroundColor: 'transparent' },
    overlays: [
      { type: 'clock-hands', opacity: 1 },
      { type: 'gloss', opacity: 0.15 },
    ],
    editableRegions: [
      { id: 'main', type: 'triangle', points: [[500, 50], [960, 860], [40, 860]], placeholder: 'Upload your photo', smartCrop: true },
    ],
    printSizes: [
      { label: '10 inch', width: 10, height: 9, price: 1099 },
      { label: '12 inch', width: 12, height: 11, price: 1399 },
    ],
    thicknesses: [{ label: '5mm', price: 0 }],
    extras: [{ type: 'clock-mechanism', included: true }],
  },
  {
    id: 'acrylic-clock-circle',
    name: 'Acrylic Wall Clock',
    productType: 'acrylic-clock',
    shape: 'circle',
    canvas: { width: 1000, height: 1000, backgroundColor: 'transparent' },
    overlays: [
      { type: 'clock-hands', opacity: 1 },
      { type: 'clock-numbers', opacity: 0.9 },
      { type: 'gloss', opacity: 0.18 },
    ],
    editableRegions: [
      { id: 'main', type: 'circle', x: 500, y: 500, radius: 460, placeholder: 'Upload your photo', smartCrop: true },
    ],
    printSizes: [
      { label: '10 inch', width: 10, height: 10, price: 1199 },
      { label: '12 inch', width: 12, height: 12, price: 1499 },
      { label: '14 inch', width: 14, height: 14, price: 1799 },
    ],
    thicknesses: [{ label: '5mm', price: 0 }],
    extras: [{ type: 'clock-mechanism', included: true }],
  },
  {
    id: 'collage-2-portrait',
    name: 'Collage Frame (2 Photos)',
    productType: 'collage-frame',
    shape: 'rectangle',
    canvas: { width: 1200, height: 900, backgroundColor: '#111118' },
    overlays: [{ type: 'frame-border', color: '#1a1a2e', width: 20 }],
    editableRegions: [
      { id: 'left', type: 'rectangle', x: 30, y: 30, width: 555, height: 840, cornerRadius: 8, placeholder: 'Photo 1', smartCrop: true },
      { id: 'right', type: 'rectangle', x: 615, y: 30, width: 555, height: 840, cornerRadius: 8, placeholder: 'Photo 2', smartCrop: true },
    ],
    printSizes: [
      { label: '12×8 inch', width: 12, height: 8, price: 1299 },
      { label: '16×12 inch', width: 16, height: 12, price: 1799 },
      { label: '20×16 inch', width: 20, height: 16, price: 2499 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 300 },
    ],
  },
  {
    id: 'collage-4-grid',
    name: 'Collage Grid (4 Photos)',
    productType: 'collage-frame',
    shape: 'square',
    canvas: { width: 1000, height: 1000, backgroundColor: '#111118' },
    overlays: [{ type: 'frame-border', color: '#1a1a2e', width: 15 }],
    editableRegions: [
      { id: 'tl', type: 'rectangle', x: 20, y: 20, width: 455, height: 455, cornerRadius: 6, placeholder: 'Photo 1', smartCrop: true },
      { id: 'tr', type: 'rectangle', x: 525, y: 20, width: 455, height: 455, cornerRadius: 6, placeholder: 'Photo 2', smartCrop: true },
      { id: 'bl', type: 'rectangle', x: 20, y: 525, width: 455, height: 455, cornerRadius: 6, placeholder: 'Photo 3', smartCrop: true },
      { id: 'br', type: 'rectangle', x: 525, y: 525, width: 455, height: 455, cornerRadius: 6, placeholder: 'Photo 4', smartCrop: true },
    ],
    printSizes: [
      { label: '10×10 inch', width: 10, height: 10, price: 1499 },
      { label: '12×12 inch', width: 12, height: 12, price: 1899 },
      { label: '16×16 inch', width: 16, height: 16, price: 2699 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 300 },
    ],
  },
  {
    id: 'collage-6-mixed',
    name: 'Collage Mosaic (6 Photos)',
    productType: 'collage-frame',
    shape: 'landscape',
    canvas: { width: 1400, height: 900, backgroundColor: '#111118' },
    overlays: [{ type: 'frame-border', color: '#1a1a2e', width: 15 }],
    editableRegions: [
      { id: 'left-main', type: 'rectangle', x: 20, y: 20, width: 500, height: 860, cornerRadius: 8, placeholder: 'Main Photo', smartCrop: true },
      { id: 'tr', type: 'rectangle', x: 540, y: 20, width: 390, height: 280, cornerRadius: 6, placeholder: 'Photo 2', smartCrop: true },
      { id: 'tm', type: 'rectangle', x: 950, y: 20, width: 430, height: 280, cornerRadius: 6, placeholder: 'Photo 3', smartCrop: true },
      { id: 'mr', type: 'rectangle', x: 540, y: 320, width: 840, height: 260, cornerRadius: 6, placeholder: 'Photo 4', smartCrop: true },
      { id: 'br', type: 'rectangle', x: 540, y: 600, width: 390, height: 280, cornerRadius: 6, placeholder: 'Photo 5', smartCrop: true },
      { id: 'bm', type: 'rectangle', x: 950, y: 600, width: 430, height: 280, cornerRadius: 6, placeholder: 'Photo 6', smartCrop: true },
    ],
    printSizes: [
      { label: '16×10 inch', width: 16, height: 10, price: 2199 },
      { label: '20×14 inch', width: 20, height: 14, price: 2999 },
    ],
    thicknesses: [
      { label: '3mm', price: 0 },
      { label: '5mm', price: 400 },
    ],
  },
  {
    id: 'couple-hearts-frame',
    name: 'Couple Heart Frame',
    productType: 'couple-gift',
    shape: 'custom',
    canvas: { width: 1200, height: 800, backgroundColor: '#0a0a0f' },
    overlays: [
      { type: 'heart-overlay', opacity: 0.15 },
      { type: 'gloss', opacity: 0.12 },
    ],
    editableRegions: [
      { id: 'photo1', type: 'circle', x: 280, y: 400, radius: 250, placeholder: 'His Photo', smartCrop: true },
      { id: 'photo2', type: 'circle', x: 920, y: 400, radius: 250, placeholder: 'Her Photo', smartCrop: true },
    ],
    textRegions: [
      { id: 'couple-name', type: 'text', x: 600, y: 400, defaultText: 'Names Here', fontSize: 36, fontFamily: 'serif', fill: '#f8f8ff', align: 'center' },
    ],
    printSizes: [
      { label: '12×8 inch', width: 12, height: 8, price: 1499 },
      { label: '16×10 inch', width: 16, height: 10, price: 1999 },
    ],
    thicknesses: [{ label: '5mm', price: 0 }],
  },
  {
    id: 'baby-birth-frame',
    name: 'Baby Birth Announcement Frame',
    productType: 'baby-frame',
    shape: 'portrait',
    canvas: { width: 800, height: 1100, backgroundColor: '#fff7ed' },
    overlays: [{ type: 'birth-stats-overlay', opacity: 1 }],
    editableRegions: [
      { id: 'baby-photo', type: 'circle', x: 400, y: 380, radius: 300, placeholder: 'Baby Photo', smartCrop: true },
    ],
    textRegions: [
      { id: 'baby-name', type: 'text', x: 400, y: 120, defaultText: 'Baby Name', fontSize: 48, fontFamily: 'serif', fill: '#7c2d12', align: 'center' },
      { id: 'birth-date', type: 'text', x: 400, y: 750, defaultText: 'Date of Birth', fontSize: 24, fontFamily: 'sans-serif', fill: '#9a3412', align: 'center' },
      { id: 'birth-weight', type: 'text', x: 250, y: 850, defaultText: 'Weight: 3.2 kg', fontSize: 20, fontFamily: 'sans-serif', fill: '#c2410c', align: 'center' },
      { id: 'birth-height', type: 'text', x: 550, y: 850, defaultText: 'Height: 51 cm', fontSize: 20, fontFamily: 'sans-serif', fill: '#c2410c', align: 'center' },
    ],
    printSizes: [
      { label: '8×10 inch', width: 8, height: 10, price: 1299 },
      { label: '10×14 inch', width: 10, height: 14, price: 1699 },
    ],
    thicknesses: [{ label: '5mm', price: 0 }],
  },
];

async function main() {
  console.log('Seeding database with templates and products...');

  // 1. Create a general category
  const category = await prisma.category.upsert({
    where: { slug: 'all-products' },
    update: {},
    create: {
      name: 'All Products',
      slug: 'all-products',
      description: 'Discover our premium acrylic photo products',
      isActive: true,
    },
  });

  // 2. Insert Templates and generate matching Products
  for (const t of PRODUCT_TEMPLATES) {
    const templateData = {
      name: t.name,
      slug: t.id,
      canvasWidth: t.canvas?.width || 1000,
      canvasHeight: t.canvas?.height || 1000,
      templateJson: t, // the whole JSON structure is saved here
      productType: t.productType || 'acrylic',
      isActive: true,
    };

    const template = await prisma.template.upsert({
      where: { slug: t.id },
      update: templateData,
      create: templateData,
    });

    // Extract layers, editable regions, borders to respective models based on the templateJson
    if (t.overlays) {
      for (const overlay of t.overlays) {
        await prisma.layer.create({
          data: {
            templateId: template.id,
            type: overlay.type || 'overlay',
            configJson: overlay,
          }
        });
      }
    }

    if (t.editableRegions) {
      for (const region of t.editableRegions) {
        await prisma.editableRegion.create({
          data: {
            templateId: template.id,
            type: region.type || 'rectangle',
            name: region.id,
            x: region.x || 0,
            y: region.y || 0,
            width: region.width || (region.radius ? region.radius * 2 : 0),
            height: region.height || (region.radius ? region.radius * 2 : 0),
            configJson: region,
          }
        });
      }
    }

    // Product pricing defaults
    const basePrice = t.printSizes && t.printSizes.length > 0 ? t.printSizes[0].price * 1.5 : 1500;
    const discountPrice = t.printSizes && t.printSizes.length > 0 ? t.printSizes[0].price : 1000;

    // Create a product for each template
    const product = await prisma.product.upsert({
      where: { slug: t.id + '-product' },
      update: {
        templateId: template.id,
        shape: t.shape,
        images: ['/images/sample-acrylic.jpg'], // fallback image
        basePrice,
        discountPrice,
        sizes: t.printSizes ? t.printSizes.map(s => s.label) : [],
        thicknesses: t.thicknesses ? t.thicknesses.map(th => th.label) : [],
        categoryId: category.id,
      },
      create: {
        name: t.name,
        slug: t.id + '-product',
        description: `Premium ${t.name}`,
        categoryId: category.id,
        templateId: template.id,
        basePrice,
        discountPrice,
        images: ['/images/sample-acrylic.jpg'],
        sizes: t.printSizes ? t.printSizes.map(s => s.label) : [],
        thicknesses: t.thicknesses ? t.thicknesses.map(th => th.label) : [],
        tags: [t.shape, t.productType],
        shape: t.shape,
        isFeatured: true,
        isTrending: Math.random() > 0.5, // randomize trending
      },
    });

    // Also populate product images using the newly created ProductImage model
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: '/images/sample-acrylic.jpg',
        isPrimary: true
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
