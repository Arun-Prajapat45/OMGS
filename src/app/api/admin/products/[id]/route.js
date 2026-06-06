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

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        sku: data.sku || null,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        categoryId: finalCategoryId,
        subCategoryId: data.subCategoryId || null,
        templateId: data.templateId,
        images: data.images || [],
        variants: (data.variants || []).map((variant) => ({
          dim: variant.dim || 'Standard',
          thick: variant.thick != null ? String(variant.thick) : 'Standard',
          price: parseFloat(variant.price || 0),
          discountprice: variant.discountprice != null
            ? parseFloat(variant.discountprice)
            : parseFloat(variant.price || 0),
          stocks: parseInt(variant.stocks || '0', 10),
        })),
        tags: data.tags || [],
        customizationRules: data.customizationRules || {},
        seo: data.seo || {},
        shape: data.shape || 'rectangle',
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        isTrending: data.isTrending,
        is3dEnabled: data.is3dEnabled || false,
        threeDModelUrl: data.threeDModelUrl || null,
      },
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
