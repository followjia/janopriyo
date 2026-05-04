
import { ProductCardSelector } from '@/components/templates/Registry';
import { Product } from '@/types/product';

export function ProductCard({ style = 'v1', product }: { style?: string, product: Product }) {
  return <ProductCardSelector style={style} product={product} />;
}
