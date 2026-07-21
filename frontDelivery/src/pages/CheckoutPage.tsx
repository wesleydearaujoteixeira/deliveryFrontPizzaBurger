import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { Banknote, CreditCard, DoorClosed, QrCode } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useStoreStatus } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { formatBRL } from '@/utils/currency';
import { BORDER_LABELS, cartItemLabel } from '@/utils/pizza';
import type { PaymentMethod } from '@/types';

const schema = z.object({
  street: z.string().trim().min(3, 'Informe a rua').max(120),
  number: z.string().trim().min(1, 'Informe o numero').max(20),
  complement: z.string().trim().max(60).optional(),
  neighborhood: z.string().trim().min(2, 'Informe o bairro').max(80),
  city: z.string().trim().min(2, 'Informe a cidade').max(80),
  paymentMethod: z.enum(['PIX', 'CARD', 'CASH']),
  note: z.string().trim().max(300, 'Maximo de 300 caracteres').optional(),
});

type FormData = z.infer<typeof schema>;

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof QrCode }[] = [
  { value: 'PIX', label: 'Pix', icon: QrCode },
  { value: 'CARD', label: 'Cartao na entrega', icon: CreditCard },
  { value: 'CASH', label: 'Dinheiro', icon: Banknote },
];

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const createOrder = useCreateOrder();
  const { data: store } = useStoreStatus();
  const navigate = useNavigate();
  // Evita o redirect de carrinho vazio no instante em que o pedido e criado
  const placedRef = useRef(false);

  const deliveryFee = store?.deliveryFee ?? 0;
  const minOrder = store?.minOrder ?? 0;
  const storeClosed = store ? !store.open : false;
  const belowMinimum = subtotal < minOrder;
  const blocked = storeClosed || belowMinimum;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { paymentMethod: 'PIX' },
  });
  const selectedPayment = watch('paymentMethod');

  if (items.length === 0 && !placedRef.current) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormData) => {
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({
          productUuid: i.product.uuid,
          quantity: i.quantity,
          halfFlavorUuid: i.customization?.halfFlavor?.uuid,
          border: i.customization?.border,
        })),
        paymentMethod: data.paymentMethod,
        address: {
          street: data.street,
          number: data.number,
          complement: data.complement || undefined,
          neighborhood: data.neighborhood,
          city: data.city,
        },
        note: data.note || undefined,
      });
      placedRef.current = true;
      clear();
      navigate(`/pedidos/${order.uuid}`, { state: { placed: true }, replace: true });
    } catch (err: unknown) {
      // O servidor tambem valida loja aberta e pedido minimo: mostra o motivo real
      const message = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      toast.error(message ?? 'Nao foi possivel finalizar o pedido. Tente novamente.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Finalizar pedido</h1>

      {storeClosed && (
        <div className="flex items-center gap-3 rounded-2xl bg-red-100 px-4 py-3 text-sm
          font-medium text-red-800 dark:bg-red-500/15 dark:text-red-400">
          <DoorClosed className="h-5 w-5 shrink-0" aria-hidden />
          A loja esta fechada no momento. Volte mais tarde para finalizar seu pedido.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]"
      >
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h2 className="font-bold">Endereco de entrega</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
              <Input label="Rua" autoComplete="address-line1"
                error={errors.street?.message} {...register('street')} />
              <Input label="Numero" autoComplete="address-line2"
                error={errors.number?.message} {...register('number')} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Bairro" error={errors.neighborhood?.message}
                {...register('neighborhood')} />
              <Input label="Cidade" autoComplete="address-level2"
                error={errors.city?.message} {...register('city')} />
            </div>
            <Input label="Complemento (opcional)" placeholder="Apto, bloco, referencia..."
              error={errors.complement?.message} {...register('complement')} />
          </Card>

          <Card className="flex flex-col gap-4">
            <h2 className="font-bold">Forma de pagamento</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" role="radiogroup">
              {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4
                    transition-colors sm:flex-col sm:text-center
                    ${selectedPayment === value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'}`}
                >
                  <input
                    type="radio"
                    value={value}
                    className="sr-only"
                    {...register('paymentMethod')}
                  />
                  <Icon
                    className={`h-6 w-6 ${selectedPayment === value ? 'text-brand-500' : 'text-zinc-400'}`}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold">{label}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-3">
            <label htmlFor="note" className="font-bold">
              Observacoes <span className="text-sm font-normal text-zinc-500">(opcional)</span>
            </label>
            <textarea
              id="note"
              rows={3}
              placeholder="Ex.: tirar a cebola, campainha quebrada..."
              className="resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm
                outline-none transition-colors placeholder:text-zinc-400
                focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                dark:border-zinc-700 dark:bg-surface-dark-2 dark:text-zinc-100"
              {...register('note')}
            />
            {errors.note && (
              <span role="alert" className="text-xs text-red-500">{errors.note.message}</span>
            )}
          </Card>
        </div>

        <Card className="flex flex-col gap-4 lg:sticky lg:top-20">
          <h2 className="font-bold">Resumo do pedido</h2>
          <ul className="flex flex-col gap-2">
            {items.map(({ key, product, quantity, customization, unitPrice }) => (
              <li key={key} className="flex justify-between gap-2 text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {quantity}x {cartItemLabel(product, customization)}
                  {customization && customization.border !== 'NONE' && (
                    <span className="block text-xs text-zinc-400">
                      {BORDER_LABELS[customization.border]}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-medium">
                  {formatBRL(unitPrice * quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Taxa de entrega</span>
              <span>{formatBRL(deliveryFee)}</span>
            </div>
            <div className="mt-2 flex justify-between text-lg font-extrabold">
              <span>Total</span>
              <span className="text-brand-500">{formatBRL(subtotal + deliveryFee)}</span>
            </div>
          </div>
          {belowMinimum && !storeClosed && (
            <p className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800
              dark:bg-amber-500/15 dark:text-amber-400">
              Pedido minimo de {formatBRL(minOrder)} — faltam {formatBRL(minOrder - subtotal)}.
            </p>
          )}
          <Button type="submit" isLoading={isSubmitting} disabled={blocked} className="w-full">
            Confirmar pedido
          </Button>
        </Card>
      </form>
    </div>
  );
}
