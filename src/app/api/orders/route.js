import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/utils';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress, couponCode } = body;

    if (!items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate totals
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 99;
    let discount = 0;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode, isActive: true } });
      if (coupon) {
        discount = coupon.discountType === 'PERCENTAGE'
          ? (subtotal * Number(coupon.discountValue)) / 100
          : Number(coupon.discountValue);
        if (coupon.maxDiscount) discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    }

    const total = subtotal - discount + deliveryFee;
    const orderNumber = generateOrderNumber();

    const cashfreeUrl = process.env.CASHFREE_ENV === 'PROD' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const orderPayload = {
      order_amount: total,
      order_currency: "INR",
      order_id: orderNumber,
      customer_details: {
        customer_id: session.user.id || "guest",
        customer_phone: shippingAddress.phone || "9999999999",
        customer_email: shippingAddress.email || "test@example.com",
        customer_name: shippingAddress.fullName || "Test User"
      },
      order_meta: {
        return_url: `${process.env.NEXTAUTH_URL?.replace('http://localhost', 'https://localhost')}/api/payments/cashfree-verify?order_id={order_id}`
      }
    };

    const cashfreeRes = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    if (!cashfreeRes.ok) {
      const errorData = await cashfreeRes.json();
      console.error('Cashfree order creation failed:', errorData);
      return NextResponse.json({ error: 'Payment gateway error' }, { status: 500 });
    }

    const cashfreeOrder = await cashfreeRes.json();

    // Create pending order in DB
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        orderNumber,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode,
        shippingAddress,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            designId: item.designId || null,
            quantity: item.quantity,
            size: item.size || null,
            thickness: item.thickness || null,
            price: item.price,
            customData: {
              ...(item.customData || {}),
              cartImage: item.image || null,
            },
          })),
        },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentSessionId: cashfreeOrder.payment_session_id,
      cashfreeOrderId: cashfreeOrder.order_id
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
