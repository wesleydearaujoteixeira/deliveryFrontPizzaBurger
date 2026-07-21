import type { PizzaBorder, PizzaCustomization, Product } from '@/types';

/** Uma opcao de borda: rotulo exibido e acrescimo por pizza. */
export interface BorderOption {
  id: PizzaBorder;
  label: string;
  price: number;
}

/**
 * Catalogo de bordas — FONTE UNICA de rotulos e precos no front.
 *
 * IMPORTANTE: no pedido o front envia apenas o `border` (enum); quem calcula
 * o preco final e o backend. Entao estes ids e precos PRECISAM existir e bater
 * com o enum PizzaBorder do backend, senao o checkout sera rejeitado (id
 * desconhecido) ou cobrado com valor diferente do exibido aqui.
 */
export const BORDER_CATALOG: BorderOption[] = [
  { id: 'NONE', label: 'Sem borda', price: 0 },
  { id: 'REQUEIJAO', label: 'Borda de Requeijão', price: 0 },
  { id: 'CATUPIRY', label: 'Borda Catupiry', price: 14.99 },
  { id: 'CREAM_CHEESE', label: 'Borda Cream Cheese', price: 14.99 },
  { id: 'CHEDDAR', label: 'Borda Cheddar', price: 14.99 },
  { id: 'CHOCOLATE', label: 'Borda de Chocolate', price: 14.99 },
  { id: 'AVELA', label: 'Borda Avelã', price: 14.99 },
];

const BORDER_BY_ID = Object.fromEntries(
  BORDER_CATALOG.map((b) => [b.id, b]),
) as Record<PizzaBorder, BorderOption>;

/** Acrescimo da borda (0 para "Sem borda" / Requeijão). */
export function borderPrice(border: PizzaBorder): number {
  return BORDER_BY_ID[border]?.price ?? 0;
}

/** Rotulo da borda para exibir no carrinho/checkout/tracking. */
export function borderLabel(border: PizzaBorder): string {
  return BORDER_BY_ID[border]?.label ?? 'Sem borda';
}

/** Compat: rotulos por id, derivados do catalogo. */
export const BORDER_LABELS: Record<PizzaBorder, string> = Object.fromEntries(
  BORDER_CATALOG.map((b) => [b.id, b.label]),
) as Record<PizzaBorder, string>;

/**
 * Preco unitario da pizza: no meio a meio vale o sabor mais caro
 * (regra classica de pizzaria) + acrescimo da borda. O backend aplica
 * a mesma regra ao criar o pedido — aqui e so para exibicao.
 */
export function pizzaUnitPrice(product: Product, customization?: PizzaCustomization): number {
  if (!customization) return product.basePrice;
  const base = customization.halfFlavor
    ? Math.max(product.basePrice, customization.halfFlavor.basePrice)
    : product.basePrice;
  return base + borderPrice(customization.border);
}

/** Nome da linha no carrinho: "½ Calabresa / ½ Marguerita" quando meio a meio. */
export function cartItemLabel(product: Product, customization?: PizzaCustomization): string {
  if (customization?.halfFlavor) {
    return `½ ${product.name} / ½ ${customization.halfFlavor.name}`;
  }
  return product.name;
}
