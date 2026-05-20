import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where = search ? { name: { contains: search } } : {};

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.template.count({ where })
    ]);

    return NextResponse.json({ templates, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Fetch templates error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    const slug = data.slug || slugify(data.name, { lower: true, strict: true });

    // Validate JSON structure
    let parsedJson = {};
    if (typeof data.templateJson === 'string') {
      try {
        parsedJson = JSON.parse(data.templateJson);
      } catch (err) {
        return NextResponse.json({ error: 'Invalid Template JSON format' }, { status: 400 });
      }
    } else {
      parsedJson = data.templateJson;
    }

    const newTemplate = await prisma.template.create({
      data: {
        name: data.name,
        slug: slug,
        canvasWidth: parseInt(data.canvasWidth, 10),
        canvasHeight: parseInt(data.canvasHeight, 10),
        templateJson: parsedJson,
        previewImage: data.previewImage || null,
        productType: data.productType || 'acrylic',
        isActive: data.isActive !== false,
      }
    });

    return NextResponse.json({ success: true, template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Failed to create template', details: error.message }, { status: 500 });
  }
}
