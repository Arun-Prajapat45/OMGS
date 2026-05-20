import ProductGrid from '@/components/products/ProductGrid';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'All Products | OMGS',
  description: 'Browse our full collection of premium acrylic photo prints, clocks, and custom wall art.',
};

/**
 * Serialize a Prisma product row to plain JSON-safe values.
 * Decimal → number, Date → ISO string, Json → parsed object.
 */
function serializeProduct(p) {
  return {
    ...p,
    basePrice:     parseFloat(p.basePrice),
    discountPrice: p.discountPrice ? parseFloat(p.discountPrice) : null,
    createdAt:     p.createdAt?.toISOString?.() ?? p.createdAt,
    updatedAt:     p.updatedAt?.toISOString?.() ?? p.updatedAt,
    images:        Array.isArray(p.images) ? p.images : (p.images ?? []),
    sizes:         Array.isArray(p.sizes) ? p.sizes : (p.sizes ?? []),
    thicknesses:   Array.isArray(p.thicknesses) ? p.thicknesses : (p.thicknesses ?? []),
    tags:          Array.isArray(p.tags) ? p.tags : (p.tags ?? []),
    features:      Array.isArray(p.features) ? p.features : (p.features ?? []),
    category: p.category
      ? {
          ...p.category,
          createdAt: p.category.createdAt?.toISOString?.() ?? p.category.createdAt,
          updatedAt: p.category.updatedAt?.toISOString?.() ?? p.category.updatedAt,
        }
      : null,
    template: p.template
      ? {
          ...p.template,
          createdAt: p.template.createdAt?.toISOString?.() ?? p.template.createdAt,
          updatedAt: p.template.updatedAt?.toISOString?.() ?? p.template.updatedAt,
        }
      : null,
  };
}

export default async function ProductsPage({ searchParams }) {
  const raw = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      template: true,
      reviews:  { select: { rating: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const products = raw.map(serializeProduct);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            All Products
          </h1>
          <p className="text-white/50">
            Discover our premium acrylic photo products
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <ProductGrid searchParams={searchParams} products={products} />
        </div>
      </div>
    </div>
  );
}
