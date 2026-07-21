import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStoreStatus } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/Button';
import { formatBRL } from '@/utils/currency';
import { borderLabel, borderPrice, cartItemLabel } from '@/utils/pizza';

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, remove, setQuantity } = useCart();
  const { data: store } = useStoreStatus();
  const navigate = useNavigate();

  const storeClosed = store ? !store.open : false;
  const missingForMinimum = store ? Math.max(0, store.minOrder - subtotal) : 0;
  const blocked = storeClosed || missingForMinimum > 0;

  const checkout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/40"
            aria-hidden
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col
              bg-surface-light shadow-2xl dark:bg-surface-dark-2"
            role="dialog"
            aria-label="Carrinho"
          >
            <header className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShoppingBag className="h-5 w-5 text-brand-500" aria-hidden />
                Seu carrinho
              </h2>
              <button
                onClick={closeCart}
                aria-label="Fechar carrinho"
                className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-600" aria-hidden />
                <p className="font-medium">Seu carrinho esta vazio</p>
                <p className="text-sm text-zinc-500">
                  Adicione itens do cardapio para comecar.
                </p>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-zinc-100 overflow-y-auto p-4 dark:divide-zinc-800">
                  {items.map(({ key, product, quantity, customization, unitPrice }) => (
                    <li key={key} className="flex gap-3 py-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                      )}
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {cartItemLabel(product, customization)}
                          </span>
                          <button
                            onClick={() => remove(key)}
                            aria-label={`Remover ${product.name}`}
                            className="text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {customization && customization.border !== 'NONE' && (
                          <span className="text-xs text-zinc-500">
                            {borderLabel(customization.border)}
                            {borderPrice(customization.border) > 0 &&
                              ` (+${formatBRL(borderPrice(customization.border))})`}
                          </span>
                        )}
                        <span className="text-sm text-zinc-500">
                          {formatBRL(unitPrice)}
                        </span>
                        <div className="mt-1 flex items-center gap-3">
                          <button
                            onClick={() => setQuantity(key, quantity - 1)}
                            aria-label="Diminuir quantidade"
                            className="rounded-lg bg-zinc-100 p-1.5 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                          <button
                            onClick={() => setQuantity(key, quantity + 1)}
                            aria-label="Aumentar quantidade"
                            className="rounded-lg bg-zinc-100 p-1.5 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <span className="ml-auto text-sm font-bold">
                            {formatBRL(unitPrice * quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Subtotal</span>
                    <span className="text-lg font-bold">{formatBRL(subtotal)}</span>
                  </div>
                  {storeClosed && (
                    <p className="mb-3 rounded-xl bg-red-100 px-3 py-2 text-xs font-medium
                      text-red-800 dark:bg-red-500/15 dark:text-red-400">
                      A loja esta fechada no momento.
                    </p>
                  )}
                  {!storeClosed && missingForMinimum > 0 && (
                    <p className="mb-3 rounded-xl bg-amber-100 px-3 py-2 text-xs font-medium
                      text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
                      Pedido minimo de {formatBRL(store!.minOrder)} — faltam{' '}
                      {formatBRL(missingForMinimum)}.
                    </p>
                  )}
                  <Button className="w-full" onClick={checkout} disabled={blocked}>
                    Finalizar pedido
                  </Button>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
