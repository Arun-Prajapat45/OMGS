import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.redirect(new URL('/products?error=missing_order', req.url));
    }

    // Verify payment status with Cashfree
    const cashfreeUrl = process.env.CASHFREE_ENV === 'PROD' 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const cashfreeRes = await fetch(cashfreeUrl, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'x-api-version': '2023-08-01',
      },
    });

    if (!cashfreeRes.ok) {
      console.error('Failed to verify Cashfree order');
      return NextResponse.redirect(new URL(`/orders?error=verification_failed`, req.url));
    }

    const orderData = await cashfreeRes.json();

    // Check if order is paid
    if (orderData.order_status === 'PAID') {
      // Find the order in our DB by orderNumber
      const dbOrder = await prisma.order.findUnique({
        where: { orderNumber: orderId }
      });

      if (dbOrder) {
        // Update order status to paid
        await prisma.order.update({
          where: { id: dbOrder.id },
          data: {
            status: 'PROCESSING',
            paymentStatus: 'PAID',
          }
        });

        // Redirect to success page
        return NextResponse.redirect(new URL(`/orders/${dbOrder.id}?success=1`, req.url));
      }
    }

    // Default redirect to orders page if not paid or order not found
    return NextResponse.redirect(new URL('/orders', req.url));

  } catch (error) {
    console.error('Cashfree verification error:', error);
    return NextResponse.redirect(new URL('/orders?error=verification_error', req.url));
  }
}
