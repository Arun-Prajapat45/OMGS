import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const subCategories = await prisma.subCategory.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(subCategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json({ error: 'Failed to fetch subcategories' }, { status: 500 });
  }
}
