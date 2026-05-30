import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function parseJsonValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeProduct(product) {
  return {
    ...product,
    images: parseJsonValue(product.images),
    template: product.template
      ? {
          ...product.template,
          templateJson: typeof product.template.templateJson === 'string'
            ? parseJsonValue(product.template.templateJson)
            : product.template.templateJson,
        }
      : null,
  };
}

export async function GET(req) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('ids') || '';
  const ids = idsParam
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { template: true },
    });

    const normalizedProducts = products.map(normalizeProduct);

    return NextResponse.json({
      products: normalizedProducts,
      productIds: normalizedProducts.map((product) => product.id),
    });
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ items: [], products: [], productIds: [] });
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          template: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const items = wishlistItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    createdAt: item.createdAt,
    product: normalizeProduct(item.product),
  }));

  return NextResponse.json({
    items,
    products: items.map((item) => item.product),
    productIds: items.map((item) => item.productId),
  });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const productId = body?.productId;

  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
  });

  if (!existing) {
    await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
    });
  }

  return NextResponse.json({ success: true, productId }, { status: 201 });
}

export async function DELETE(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const productId = body?.productId;

  if (!productId) {
    await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ success: true, cleared: true });
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json({ success: true });
}
