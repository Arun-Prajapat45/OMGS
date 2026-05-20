import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

const ensureAdmin = async () => {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return null;
  }
  return session;
};

export async function GET(req, { params }) {
  try {
    const session = await ensureAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        category: true,
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await ensureAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = params;
    const data = await req.json();
    let slug = data.slug || slugify(data.name, { lower: true, strict: true });

    const existingSlug = await prisma.product.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalCategoryId = data.categoryId;
    if (data.newCategoryName) {
      const categorySlug = slugify(data.newCategoryName, { lower: true, strict: true });
      const category = await prisma.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: {
          name: data.newCategoryName,
          slug: categorySlug,
          isActive: true,
        }
      });
      finalCategoryId = category.id;
    }

    if (!finalCategoryId) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const variantPayload = (data.variants || []).map((variant) => ({
      name: variant.name,
      size: variant.size || null,
      thickness: variant.thickness || null,
      frameType: variant.frameType || null,
      price: parseFloat(variant.price),
      discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
      stock: parseInt(variant.stock || '0', 10),
      sku: variant.sku || null,
      isActive: variant.isActive !== false,
    }));

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
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
        stock: parseInt(data.stock || '0', 10),
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        variants: {
          deleteMany: {},
          create: variantPayload,
        }
      },
      include: { variants: true }
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await ensureAdmin();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product', details: error.message }, { status: 500 });
  }
}
