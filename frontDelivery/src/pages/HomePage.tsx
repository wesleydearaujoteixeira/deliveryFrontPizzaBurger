import { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCategories, useProducts, useStoreStatus } from '@/hooks/useCatalog';
import { useCart } from '@/context/CartContext';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { HeroCarousel } from '@/components/HeroCarousel';
import { PizzaModal } from '@/components/PizzaModal';
import { StoreStatusCard } from '@/components/StoreStatusCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export function HomePage() {
  const { data: categories } = useCategories();
  // Uma busca so, agrupada por categoria: cada secao vira um carrossel
  const { data: products, isLoading } = useProducts(undefined, 0, 150);
  const { data: storeStatus } = useStoreStatus();
  const { add } = useCart();
  // Pizza clicada: abre o modal de personalizacao (2 sabores, borda, bebida)
  const [selectedPizza, setSelectedPizza] = useState<Product | null>(null);

  const pizzas = useMemo(
    () => products?.content.filter((p) => p.type === 'PIZZA') ?? [],
    [products],
  );
  const drinks = useMemo(
    () => products?.content.filter((p) => p.type === 'DRINK') ?? [],
    [products],
  );

  const handleSelect = (product: Product) => {
    if (storeStatus && !storeStatus.open) {
      toast.error('A loja está fechada no momento');
      return;
    }
    if (product.type === 'PIZZA') {
      setSelectedPizza(product);
      return;
    }
    add(product);
    toast.success(`${product.name} adicionado ao carrinho`);
  };

  const sections =
    categories
      ?.map((category) => ({
        category,
        items: products?.content.filter((p) => p.categorySlug === category.slug) ?? [],
      }))
      .filter((s) => s.items.length > 0) ?? [];

  const scrollToCategory = (slug: string) =>
    document.getElementById(`categoria-${slug}`)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <HeroCarousel />

      <StoreStatusCard />

      {/* Navegacao por categoria: rola ate a secao, como nos cardapios de fast-food */}
      <nav
        aria-label="Categorias"
        className="glass sticky top-16 z-30 -mx-4 flex gap-2 overflow-x-auto rounded-none
          px-4 py-2 scrollbar-none"
      >
        {sections.map(({ category }) => (
          <button
            key={category.uuid}
            onClick={() => scrollToCategory(category.slug)}
            className="whitespace-nowrap rounded-full bg-white px-4 py-2 font-display text-sm
              font-bold text-cocoa transition-colors hover:bg-brand-500 hover:text-white
              dark:bg-surface-dark-2 dark:text-zinc-200 dark:hover:bg-brand-500"
          >
            {category.name}
          </button>
        ))}
      </nav>

      {isLoading && (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-72 w-56 shrink-0 sm:w-64" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sections.map(({ category, items }) => (
        <CategoryCarousel
          key={category.uuid}
          slug={category.slug}
          title={category.name}
          products={items}
          onSelect={handleSelect}
        />
      ))}

      {products && products.content.length === 0 && (
        <p className="py-12 text-center text-zinc-500">Nenhum produto no cardapio ainda.</p>
      )}

      <AnimatePresence>
        {selectedPizza && (
          <PizzaModal
            product={selectedPizza}
            pizzas={pizzas}
            drinks={drinks}
            onClose={() => setSelectedPizza(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
