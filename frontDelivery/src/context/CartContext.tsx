import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, PizzaCustomization, Product } from '@/types';
import { pizzaUnitPrice } from '@/utils/pizza';

// Limites do backend (OrderRequest): 30 itens distintos, 50 unidades cada
const MAX_DISTINCT_ITEMS = 30;
const MAX_QUANTITY = 50;
// v2: itens ganharam key/unitPrice/customization — carrinhos antigos sao descartados
const STORAGE_KEY = 'cart:v2';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (product: Product, quantity?: number, customization?: PizzaCustomization) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Mesma pizza com bordas ou sabores diferentes vira linhas separadas no carrinho. */
function lineKey(product: Product, customization?: PizzaCustomization): string {
  return [
    product.uuid,
    customization?.halfFlavor?.uuid ?? '',
    customization?.border ?? 'NONE',
  ].join('|');
}

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

  const add = (product: Product, quantity = 1, customization?: PizzaCustomization) => {
    const key = lineKey(product, customization);
    setItems((current) => {
      const existing = current.find((i) => i.key === key);
      if (existing) {
        return current.map((i) =>
          i.key === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, MAX_QUANTITY) }
            : i,
        );
      }
      if (current.length >= MAX_DISTINCT_ITEMS) return current;
      return [
        ...current,
        {
          key,
          product,
          quantity: Math.min(quantity, MAX_QUANTITY),
          customization,
          unitPrice: pizzaUnitPrice(product, customization),
        },
      ];
    });
  };

  const remove = (key: string) =>
    setItems((current) => current.filter((i) => i.key !== key));

  const setQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      remove(key);
      return;
    }
    setItems((current) =>
      current.map((i) =>
        i.key === key ? { ...i, quantity: Math.min(quantity, MAX_QUANTITY) } : i,
      ),
    );
  };

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
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
