import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
      orderBy: {
        sortOrder: 'asc', // or name: 'asc', depending on how you want to sort
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
