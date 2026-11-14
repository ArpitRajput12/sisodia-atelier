import React from 'react';
import { MASTERPIECE_PRODUCTS } from '@/lib/products';
import { ProductDetailView } from '@/components/product/ProductDetailView';

export function generateStaticParams() {
  const ids = MASTERPIECE_PRODUCTS.map((p) => ({ id: p.id }));
  const slugs = MASTERPIECE_PRODUCTS.map((p) => ({ id: p.slug }));
  return [...ids, ...slugs];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailView id={id} />;
}
