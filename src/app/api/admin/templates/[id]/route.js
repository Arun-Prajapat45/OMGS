import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import slugify from 'slugify';

export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Fetch template error:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const data = await req.json();

    // Verify template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

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

    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: data.name || existingTemplate.name,
        slug: slug,
        canvasWidth: data.canvasWidth ? parseInt(data.canvasWidth, 10) : existingTemplate.canvasWidth,
        canvasHeight: data.canvasHeight ? parseInt(data.canvasHeight, 10) : existingTemplate.canvasHeight,
        templateJson: parsedJson || existingTemplate.templateJson,
        previewImage: data.previewImage ?? existingTemplate.previewImage,
        productType: data.productType || existingTemplate.productType,
        isActive: data.isActive !== undefined ? data.isActive : existingTemplate.isActive,
      }
    });

    return NextResponse.json({ success: true, template: updatedTemplate });
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json({ error: 'Failed to update template', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;

    // Verify template exists
    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if template is used by any products
    const productsUsingTemplate = await prisma.product.findMany({
      where: { templateId: id }
    });

    if (productsUsingTemplate.length > 0) {
      return NextResponse.json({
        error: `Cannot delete template. It is used by ${productsUsingTemplate.length} product(s).`
      }, { status: 409 });
    }

    await prisma.template.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({ error: 'Failed to delete template', details: error.message }, { status: 500 });
  }
}
