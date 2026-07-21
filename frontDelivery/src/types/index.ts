export interface User {
  uuid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  provider: 'LOCAL' | 'GOOGLE';
  role: 'ADMIN' | 'MANAGER' | 'ATTENDANT' | 'COURIER' | 'CUSTOMER';
}

/** Cadastro iniciado: aguardando o codigo enviado por e-mail. */
export interface RegistrationPending {
  email: string;
  expiresInSeconds: number;
  resendCooldownSeconds: number;
}

export interface Category {
  uuid: string;
  name: string;
  slug: string;
  iconName: string | null;
}

export interface Product {
  uuid: string;
  name: string;
  description: string;
  type: 'PIZZA' | 'BURGER' | 'DRINK' | 'DESSERT' | 'SIDE' | 'COMBO';
  basePrice: number;
  imageUrl: string | null;
  categorySlug: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface StoreStatus {
  open: boolean;
  deliveryFee: number;
  minOrder: number;
  etaMinMinutes: number;
  etaMaxMinutes: number;
}

export type PizzaBorder =
  | 'NONE'
  | 'REQUEIJAO'
  | 'CATUPIRY'
  | 'CREAM_CHEESE'
  | 'CHEDDAR'
  | 'CHOCOLATE'
  | 'AVELA';

/** Personalizacao de pizza: segundo sabor (meio a meio) e borda recheada. */
export interface PizzaCustomization {
  halfFlavor?: Product;
  border: PizzaBorder;
}

export interface CartItem {
  /** Identidade da linha: produto + personalizacao (permite duas pizzas iguais com bordas diferentes). */
  key: string;
  product: Product;
  quantity: number;
  customization?: PizzaCustomization;
  /** Preco ja com a regra do meio a meio (sabor mais caro) e o acrescimo da borda. */
  unitPrice: number;
}

export type OrderStatus =
  | 'RECEIVED'
  | 'PREPARING'
  | 'OVEN'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'PIX' | 'CARD' | 'CASH';

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
}

export interface OrderItem {
  productUuid: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  halfFlavorName: string | null;
  border: PizzaBorder | null;
}

export interface Order {
  uuid: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: DeliveryAddress;
  note: string | null;
  createdAt: string;
  customerName: string | null;
  estimatedMinutes: number | null;
  estimatedDeliveryAt: string | null;
  items: OrderItem[];
}
