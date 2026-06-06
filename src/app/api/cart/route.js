import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            variants: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const getProductFallbackPrice = (product) => {
      if (!product?.variants?.length) return 0;
      return Number(product.variants.reduce((min, variant) => {
        const price = variant.discountprice != null ? Number(variant.discountprice) : Number(variant.price || 0);
        return min === null || price < min ? price : min;
      }, null) || 0);
    };

    // Normalize for frontend
    const normalized = items.map((item) => ({
      id: item.id,
      key: `${item.productId}-${item.size || 'no-size'}-${item.thickness || 'no-thickness'}-${item.designId || 'no-design'}`,
      productId: item.productId,
      designId: item.designId,
      quantity: item.quantity,
      size: item.size,
      thickness: item.thickness,
      customData: item.customData,
      name: item.product.name,
      productSlug: item.product.slug,
      price: item.customData?.price || getProductFallbackPrice(item.product),
      image: item.customData?.image || (Array.isArray(item.product.images) ? item.product.images[0] : null),
    }));

    return NextResponse.json({ items: normalized });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST /api/cart — add or update a cart item
export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, designId, size, thickness, quantity = 1, customData } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Upsert: increment quantity if same item exists for the user.
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        productId,
        size: size || null,
        thickness: thickness || null,
        designId: designId || null,
      },
    });

    let item;
    if (existing) {
      item = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          customData: customData ?? existing.customData,
        },
      });
    } else {
      item = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          designId: designId || null,
          size: size || null,
          thickness: thickness || null,
          quantity,
          customData: customData || null,
        },
      });
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
