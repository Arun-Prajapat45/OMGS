import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, fullName, phone, address, city, state, pincode, isDefault } = body;

    // If setting as default, unset others first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        title, fullName, phone, address, city, state, pincode, isDefault
      }
    });

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}
