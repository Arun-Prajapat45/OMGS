import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { prisma } from '@/lib/prisma';

async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      template: true,
      reviews: true,
    }
  });

  if (!product) return null;

  // Fetch similar products in the same category
  const similarProducts = product.categoryId ? await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: true,
    }
  }) : [];

  const normalizeVariant = (v) => ({
    ...v,
    dim: v.dim || v.size || v.name || 'Standard',
    thick: v.thick != null ? String(v.thick) : String(v.thickness || 'Standard'),
    price: parseFloat(v.price || 0),
    discountprice: v.discountprice != null
      ? parseFloat(v.discountprice)
      : v.discountPrice != null
        ? parseFloat(v.discountPrice)
        : parseFloat(v.price || 0),
  });

  return {
    ...product,
    variants: Array.isArray(product.variants) ? product.variants.map(normalizeVariant) : [],
    is3dEnabled: product.is3dEnabled ?? false,
    threeDModelUrl: product.threeDModelUrl ?? null,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() ?? product.updatedAt,
    images: Array.isArray(product.images) ? product.images : (product.images ?? []),
    tags: Array.isArray(product.tags) ? product.tags : (product.tags ?? []),
    features: Array.isArray(product.features) ? product.features : (product.features ?? []),
    category: product.category ? {
      ...product.category,
      createdAt: product.category.createdAt?.toISOString?.() ?? product.category.createdAt,
      updatedAt: product.category.updatedAt?.toISOString?.() ?? product.category.updatedAt,
    } : null,
    template: product.template ? {
      ...product.template,
      createdAt: product.template.createdAt?.toISOString?.() ?? product.template.createdAt,
      updatedAt: product.template.updatedAt?.toISOString?.() ?? product.template.updatedAt,
      templateJson: typeof product.template.templateJson === 'string' ? JSON.parse(product.template.templateJson) : product.template.templateJson,
    } : null,
    similarProducts: similarProducts.map(sp => ({
      ...sp,
      variants: Array.isArray(sp.variants) ? sp.variants.map(normalizeVariant) : [],
      createdAt: sp.createdAt?.toISOString?.() ?? sp.createdAt,
      updatedAt: sp.updatedAt?.toISOString?.() ?? sp.updatedAt,
      images: Array.isArray(sp.images) ? sp.images : (sp.images ?? []),
    })),
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} | Adore`,
    description: product.description || `Buy ${product.name} online at Adore`,
  };
}

// export async function generateStaticParams() {
//   const products = await prisma.product.findMany({
//     select: { slug: true },
//     where: { isActive: true },
//   });
//   return products.map((p) => ({ slug: p.slug }));
// }

export const dynamic = "force-dynamic";
export const revalidate = 0;
export async function generateStaticParams() {
  return [];
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
