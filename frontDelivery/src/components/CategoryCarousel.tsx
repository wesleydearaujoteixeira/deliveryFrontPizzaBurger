import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

interface CategoryCarouselProps {
  slug: string;
  title: string;
  products: Product[];
  onSelect: (product: Product) => void;
}

/**
 * Produtos por categoria: no celular/tablet e um carrossel (swipe no
 * touch + setas para quem usa mouse); no desktop vira grade fixa,
 * como nos cardapios de fast-food.
 */
export function CategoryCarousel({ slug, title, products, onSelect }: CategoryCarouselProps) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section id={`categoria-${slug}`} aria-label={title} className="scroll-mt-28">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold sm:text-2xl">{title}</h2>
        {/* Setas apenas no modo carrossel (celular/tablet) */}
        <div className="flex gap-2 lg:hidden">
          <ArrowButton label={`${title}: anterior`} onClick={() => scroll(-1)}>
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </ArrowButton>
          <ArrowButton label={`${title}: proximo`} onClick={() => scroll(1)}>
            <ChevronRight className="h-5 w-5" aria-hidden />
          </ArrowButton>
        </div>
      </div>

      {/* Mobile/tablet: -mx-4 px-4 deixa os cards rolarem ate a borda da tela */}
      <ul
        ref={trackRef}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4
          pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:p-0 xl:grid-cols-4"
      >
        {products.map((product) => (
          <li key={product.uuid} className="w-56 shrink-0 snap-start sm:w-64 lg:w-auto">
            <ProductCard product={product} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-cocoa
        shadow-card transition-colors hover:bg-brand-500 hover:text-white
        dark:bg-surface-dark-2 dark:text-zinc-200 dark:shadow-card-dark dark:hover:bg-brand-500"
    >
      {children}
    </button>
  );
}
