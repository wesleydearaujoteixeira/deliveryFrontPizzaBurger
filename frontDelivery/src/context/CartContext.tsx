import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, Product } from '@/types';

// Limites do backend (OrderRequest): 30 itens distintos, 50 unidades cada
const MAX_DISTINCT_ITEMS = 30;
const MAX_QUANTITY = 50;
const STORAGE_KEY = 'cart:v1';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (product: Product, quantity?: number) => void;
  remove: (productUuid: string) => void;
  setQuantity: (productUuid: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = (product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.product.uuid === product.uuid);
      if (existing) {
        return current.map((i) =>
          i.product.uuid === product.uuid
            ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QUANTITY) }
            : i,
        );
      }
      if (current.length >= MAX_DISTINCT_ITEMS) return current;
      return [...current, { product, quantity: Math.min(quantity, MAX_QUANTITY) }];
    });
  };

  const remove = (productUuid: string) =>
    setItems((current) => current.filter((i) => i.product.uuid !== productUuid));

  const setQuantity = (productUuid: string, quantity: number) => {
    if (quantity <= 0) {
      remove(productUuid);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.product.uuid === productUuid
          ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) }
          : i,
      ),
    );
  };

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0),
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        add,
        remove,
        setQuantity,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
