import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // Next.js 15+ requires awaiting params
    
    // Find the order
    const order = await prisma.order.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
    }

    // Update order status directly
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paymentId: `mock_pay_${Date.now()}` // Add a mock payment ID
      },
    });

    return NextResponse.json({ success: true, orderId: id });
  } catch (error) {
    console.error('Payment retry error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}
