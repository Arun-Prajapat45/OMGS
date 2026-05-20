import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const templates = await prisma.template.findMany({ select: { id: true, name: true } });

    return NextResponse.json({ categories, templates });
  } catch (error) {
    console.error('Fetch form data error:', error);
    return NextResponse.json({ error: 'Failed to fetch form data' }, { status: 500 });
  }
}
