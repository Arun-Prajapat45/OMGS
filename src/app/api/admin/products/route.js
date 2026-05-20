import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where = search ? { name: { contains: search } } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const data = await req.json();
    let slug = data.slug || slugify(data.name, { lower: true, strict: true });

    // Check if slug already exists to prevent Unique Constraint violation
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    if (existingProduct) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalCategoryId = data.categoryId;

    if (data.newCategoryName) {
      const catSlug = slugify(data.newCategoryName, { lower: true, strict: true });
      const newCat = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: data.newCategoryName,
          slug: catSlug,
          isActive: true
        }
      });
      finalCategoryId = newCat.id;
    }

    if (!finalCategoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        slug: slug,
        sku: data.sku || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        categoryId: finalCategoryId,
        templateId: data.templateId,
        basePrice: parseFloat(data.basePrice),
        discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
        images: data.images || [],
        sizes: data.sizes || [],
        thicknesses: data.thicknesses || [],
        tags: data.tags || [],
        features: data.features || [],
        customizationRules: data.customizationRules || {},
        seo: data.seo || {},
        shape: data.shape || 'rectangle',
        stock: parseInt(data.stock || '100', 10),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        variants: {
          create: (data.variants || []).map(v => ({
            name: v.name,
            size: v.size,
            thickness: v.thickness,
            frameType: v.frameType,
            price: parseFloat(v.price),
            discountPrice: v.discountPrice ? parseFloat(v.discountPrice) : null,
            stock: parseInt(v.stock || '0', 10),
            sku: v.sku,
            isActive: v.isActive !== false
          }))
        }
      },
      include: { variants: true }
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
