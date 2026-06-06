import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, fullName, phone, address, city, state, pincode, isDefault } = body;

    const existingAddress = await prisma.address.findUnique({ where: { id } });
    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // If setting as default, unset others first
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, isDefault: true },
        data: { isDefault: false }
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { title, fullName, phone, address, city, state, pincode, isDefault }
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}
