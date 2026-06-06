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

    // Bypass Razorpay order creation for now
    // const razorpayOrder = await createRazorpayOrder({
    //   amount: total,
    //   receipt: orderNumber,
    //   notes: { userId: session.user.id, orderNumber },
    // });

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
      // razorpayOrderId: razorpayOrder.id,
      // amount: razorpayOrder.amount,
      // currency: razorpayOrder.currency,
      // keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
