import { prisma } from '@/lib/prisma';

function parseJsonValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return [];
}

export async function GET(req) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get('ids') || '';
  const ids = idsParam
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isFinite(id));

  if (ids.length === 0) {
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: {
      template: true,
    },
  });

  const normalized = products.map((product) => ({
    ...product,
    images: parseJsonValue(product.images),
    template: product.template
      ? {
          ...product.template,
          templateJson: typeof product.template.templateJson === 'string'
            ? parseJsonValue(product.template.templateJson)
            : product.template.templateJson,
        }
      : null,
  }));

  return new Response(JSON.stringify(normalized), {
    headers: { 'Content-Type': 'application/json' },
  });
}
