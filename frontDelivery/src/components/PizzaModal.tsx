import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CupSoda, Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatBRL } from '@/utils/currency';
import { BORDER_CATALOG, cartItemLabel, pizzaUnitPrice } from '@/utils/pizza';
import type { PizzaBorder, Product } from '@/types';

interface PizzaModalProps {
  product: Product;
  /** Sabores disponiveis para o meio a meio (pizzas ativas do cardapio). */
  pizzas: Product[];
  /** Refrigerantes/bebidas para o combo opcional. */
  drinks: Product[];
  onClose: () => void;
}

/** Cabecalho de secao, no estilo "Escolha a 2ª metade! · Obrigatório". */
function SectionHead({
  title,
  subtitle,
  required,
}: {
  title: string;
  subtitle?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-1 mt-6 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-base font-extrabold text-cocoa dark:text-zinc-100">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
      </div>
      {required && (
        <span
          className="shrink-0 rounded-full border border-brand-300 px-2.5 py-0.5 text-[11px]
            font-semibold text-brand-600 dark:border-brand-500/40 dark:text-brand-300"
        >
          Obrigatório
        </span>
      )}
    </div>
  );
}

/** Linha de opcao com radio a direita — o "check" das listas do modal. */
function OptionRow({
  label,
  price,
  selected,
  onSelect,
}: {
  label: string;
  /** Texto ja formatado a direita ("+R$ 14,99", "GRÁTIS"). Vazio = nada. */
  price?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 py-3
        text-left transition-colors last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800
        dark:hover:bg-zinc-800/40"
    >
      <span className="text-sm font-medium text-cocoa dark:text-zinc-200">{label}</span>
      <span className="flex shrink-0 items-center gap-3">
        {price && <span className="text-xs font-semibold text-zinc-500">{price}</span>}
        <span
          aria-hidden
          className={`grid h-5 w-5 place-items-center rounded-full border-2 transition-colors
            ${selected ? 'border-brand-500' : 'border-zinc-300 dark:border-zinc-600'}`}
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />}
        </span>
      </span>
    </button>
  );
}

/** Tag de preco de cada borda: grátis, sem custo ou "+R$ x". */
function borderPriceTag(id: PizzaBorder, price: number): string {
  if (price > 0) return `+${formatBRL(price)}`;
  return id === 'NONE' ? '' : 'GRÁTIS';
}

export function PizzaModal({ product, pizzas, drinks, onClose }: PizzaModalProps) {
  const { add } = useCart();
  const [twoFlavors, setTwoFlavors] = useState(false);
  const [halfFlavor, setHalfFlavor] = useState<Product | null>(null);
  const [border, setBorder] = useState<PizzaBorder>('NONE');
  const [drink, setDrink] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const otherFlavors = useMemo(
    () => pizzas.filter((p) => p.uuid !== product.uuid),
    [pizzas, product.uuid],
  );
  const canGoHalf = otherFlavors.length > 0;

  const customization = {
    halfFlavor: twoFlavors && halfFlavor ? halfFlavor : undefined,
    border,
  };
  const unitPrice = pizzaUnitPrice(product, customization);
  const total = unitPrice * quantity + (drink?.basePrice ?? 0);

  const confirm = () => {
    if (twoFlavors && !halfFlavor) {
      toast.error('Escolha a 2ª metade da pizza');
      return;
    }
    add(product, quantity, customization);
    if (drink) add(drink);
    toast.success(`${cartItemLabel(product, customization)} adicionado ao carrinho`);
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50"
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: 'tween', duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Personalizar ${product.name}`}
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-lg
          flex-col overflow-hidden rounded-t-3xl bg-surface-light shadow-2xl
          dark:bg-surface-dark-2 sm:inset-x-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
          sm:rounded-3xl"
      >
        <header className="relative shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-40 w-full object-cover sm:h-48"
            />
          ) : (
            <div className="h-24 w-full bg-brand-50 dark:bg-zinc-800" />
          )}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white
              transition-colors hover:bg-black/70"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <h2 className="font-display text-xl font-extrabold text-cocoa dark:text-zinc-100">
            {product.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{product.description}</p>

          {/* Quantos sabores: inteira x meio a meio */}
          <SectionHead
            title="Quantos sabores?"
            subtitle="A pizza pode ser inteira ou dividida ao meio."
          />
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Quantos sabores">
            {[
              { value: false, label: '1 sabor', hint: 'Pizza inteira' },
              { value: true, label: '2 sabores', hint: 'Meio a meio' },
            ].map(({ value, label, hint }) => {
              const disabled = value && !canGoHalf;
              return (
                <button
                  key={String(value)}
                  type="button"
                  role="radio"
                  aria-checked={twoFlavors === value}
                  disabled={disabled}
                  onClick={() => {
                    setTwoFlavors(value);
                    if (!value) setHalfFlavor(null);
                  }}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors
                    disabled:cursor-not-allowed disabled:opacity-40
                    ${twoFlavors === value
                      ? 'border-brand-500 bg-brand-50 text-brand-900 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'}`}
                >
                  {label}
                  <span className="block text-[11px] font-normal text-zinc-500">{hint}</span>
                </button>
              );
            })}
          </div>

          {/* 2ª metade: lista de sabores (so quando meio a meio) */}
          {twoFlavors && (
            <>
              <SectionHead
                title="Escolha a 2ª metade!"
                subtitle={`1ª metade: ${product.name} · escolha 1 opção`}
                required
              />
              <div role="radiogroup" aria-label="Segunda metade">
                {otherFlavors.map((flavor) => (
                  <OptionRow
                    key={flavor.uuid}
                    label={flavor.name}
                    price={formatBRL(flavor.basePrice)}
                    selected={halfFlavor?.uuid === flavor.uuid}
                    onSelect={() => setHalfFlavor(flavor)}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                No meio a meio vale o preço do sabor mais caro.
              </p>
            </>
          )}

          {/* Borda recheada */}
          <SectionHead title="Deseja borda recheada?" subtitle="Escolha 1 opção" required />
          <div role="radiogroup" aria-label="Borda recheada">
            {BORDER_CATALOG.map((option) => (
              <OptionRow
                key={option.id}
                label={option.label}
                price={borderPriceTag(option.id, option.price)}
                selected={border === option.id}
                onSelect={() => setBorder(option.id)}
              />
            ))}
          </div>

          {/* Refrigerante opcional */}
          {drinks.length > 0 && (
            <>
              <SectionHead
                title="Vai um refrigerante junto?"
                subtitle="Opcional · escolha 1 opção"
              />
              <div role="radiogroup" aria-label="Refrigerante">
                <OptionRow
                  label="Sem bebida"
                  selected={drink === null}
                  onSelect={() => setDrink(null)}
                />
                {drinks.map((d) => (
                  <OptionRow
                    key={d.uuid}
                    label={d.name}
                    price={`+${formatBRL(d.basePrice)}`}
                    selected={drink?.uuid === d.uuid}
                    onSelect={() => setDrink(d)}
                  />
                ))}
              </div>
              {drink && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-300">
                  <CupSoda className="h-3.5 w-3.5" aria-hidden />
                  {drink.name} entra como item separado no carrinho.
                </p>
              )}
            </>
          )}
        </div>

        <footer className="flex items-center gap-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuir quantidade"
              className="rounded-lg bg-zinc-100 p-2 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              aria-label="Aumentar quantidade"
              className="rounded-lg bg-zinc-100 p-2 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button className="flex-1" onClick={confirm}>
            Adicionar · {formatBRL(total)}
          </Button>
        </footer>
      </motion.div>
    </>
  );
}
