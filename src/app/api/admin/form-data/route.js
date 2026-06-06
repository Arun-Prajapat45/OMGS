import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        subCategories: { select: { id: true, name: true } }
      }
    });

    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        productType: true,
        previewImage: true,
        canvasWidth: true,
        canvasHeight: true,
        isActive: true,
        templateJson: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Extract shape from templateJson for each template
    const templatesWithShape = templates.map((t) => {
      const json = typeof t.templateJson === 'string' ? JSON.parse(t.templateJson) : t.templateJson;
      return {
        id: t.id,
        name: t.name,
        productType: t.productType,
        previewImage: t.previewImage,
        canvasWidth: t.canvasWidth,
        canvasHeight: t.canvasHeight,
        isActive: t.isActive,
        shape: json?.shape || json?.canvas?.shape || 'rectangle',
        templateJson: json,
      };
    });

    return NextResponse.json({ categories, templates: templatesWithShape });
  } catch (error) {
    console.error('Fetch form data error:', error);
    return NextResponse.json({ error: 'Failed to fetch form data' }, { status: 500 });
  }
}
