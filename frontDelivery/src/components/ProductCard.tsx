import { Card } from '@/components/ui/Card';
import { formatBRL } from '@/utils/currency';
import type { Product } from '@/types';
import { Plus, UtensilsCrossed } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="group h-full w-full text-left"
      aria-label={`Adicionar ${product.name}`}
    >
      <Card hoverable className="flex h-full flex-col gap-3">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-brand-50 dark:bg-zinc-800">
            <UtensilsCrossed className="h-8 w-8 text-brand-200 dark:text-zinc-600" aria-hidden />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-display text-base font-bold leading-tight text-cocoa dark:text-zinc-100">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {product.description}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="font-display text-lg font-extrabold text-brand-900 dark:text-accent-500">
              {formatBRL(product.basePrice)}
            </span>
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500
                text-cocoa transition-transform group-hover:scale-110 group-active:scale-95"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
}
