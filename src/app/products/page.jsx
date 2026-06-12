import ProductGrid from '@/components/products/ProductGrid';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'All Products | Adore',
  description: 'Browse our full collection of premium acrylic photo prints, clocks, and custom wall art.',
};

/**
 * Serialize a Prisma product row to plain JSON-safe values.
 * Decimal → number, Date → ISO string, Json → parsed object.
 */
function serializeProduct(p) {
  const normalizeVariant = (v) => ({
    ...v,
    dim: v.dim || v.size || v.name || 'Standard',
    thick: v.thick != null ? String(v.thick) : String(v.thickness || 'Standard'),
    price: Number(v.price ?? 0),
    discountprice: v.discountprice != null
      ? Number(v.discountprice)
      : v.discountPrice != null
        ? Number(v.discountPrice)
        : Number(v.price ?? 0),
  });

  return {
    ...p,
    variants: Array.isArray(p.variants) ? p.variants.map(normalizeVariant) : [],
    is3dEnabled: p.is3dEnabled ?? false,
    threeDModelUrl: p.threeDModelUrl ?? null,
    createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() ?? p.updatedAt,
    images: Array.isArray(p.images) ? p.images : (p.images ?? []),
    tags: Array.isArray(p.tags) ? p.tags : (p.tags ?? []),
    features: Array.isArray(p.features) ? p.features : (p.features ?? []),
    category: p.category
      ? {
        ...p.category,
        createdAt: p.category.createdAt?.toISOString?.() ?? p.category.createdAt,
        updatedAt: p.category.updatedAt?.toISOString?.() ?? p.category.updatedAt,
      }
      : null,
    subCategory: p.subCategory
      ? {
        ...p.subCategory,
        createdAt: p.subCategory.createdAt?.toISOString?.() ?? p.subCategory.createdAt,
        updatedAt: p.subCategory.updatedAt?.toISOString?.() ?? p.subCategory.updatedAt,
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
  const sp = await searchParams;
  const categorySlug = sp?.category;
  const subcategorySlug = sp?.subcategory;

  const where = { isActive: true };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (subcategorySlug) {
    where.subCategory = { slug: subcategorySlug };
  }

  let subCategories = [];
  let categoryName = 'All Products';
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: { subCategories: true }
    });
    if (category) {
      subCategories = category.subCategories;
      categoryName = category.name;
    }
  }

  const raw = await prisma.product.findMany({
    where,
    include: {
      category: true,
      subCategory: true,
      template: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const products = raw.map(serializeProduct);

  return (
    <div className="pt-15 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Page Header */}
        <div className="mb-5">
          <h2 className="font-display text-3xl font-bold text-white mb">
            {categoryName}
          </h2>
          <p className="text-white/50">
            Discover our premium acrylic photo products...
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <ProductGrid searchParams={sp} products={products} subCategories={subCategories} categorySlug={categorySlug} />
        </div>
      </div>
    </div>
  );
}
