import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/products/ProductDetailClient';
import { prisma } from '@/lib/prisma';

async function getProductBySlug(slug) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      template: true,
      variants: true,
      reviews: true,
      productImages: true,
    }
  });
  
  if (!product) return null;

  // Serialize Prisma objects for Client Component
  return {
    ...product,
    basePrice: parseFloat(product.basePrice),
    discountPrice: product.discountPrice ? parseFloat(product.discountPrice) : null,
    createdAt: product.createdAt?.toISOString?.() ?? product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() ?? product.updatedAt,
    images: Array.isArray(product.images) ? product.images : (product.images ?? []),
    sizes: Array.isArray(product.sizes) ? product.sizes : (product.sizes ?? []),
    thicknesses: Array.isArray(product.thicknesses) ? product.thicknesses : (product.thicknesses ?? []),
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
  };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} | OMGS`,
    description: product.description || `Buy ${product.name} online at OMGS.`,
  };
}

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { isActive: true },
  });
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
