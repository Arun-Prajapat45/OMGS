import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { templateId, productId, customizedJson, previewImage, name } = data;

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        templateId,
        productId,
        name: name || 'Untitled Design',
        customizedJson: customizedJson || {},
        previewImage,
        status: 'SAVED',
      },
    });

    return NextResponse.json({ success: true, design }, { status: 201 });
  } catch (error) {
    console.error('Save design error:', error);
    return NextResponse.json({ error: 'Failed to save design' }, { status: 500 });
  }
}
