import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where = {};
    
    if (status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, phone: true }
          },
          orderItems: {
            include: {
              product: { select: { name: true, images: true } },
              design: { select: { previewImage: true } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({ 
      orders, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    });
  } catch (error) {
    console.error('Fetch Orders API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const { orderId, status } = data;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and Status are required' }, { status: 400 });
    }

    // Ensure status is a valid OrderStatus enum
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update Order Status API Error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
