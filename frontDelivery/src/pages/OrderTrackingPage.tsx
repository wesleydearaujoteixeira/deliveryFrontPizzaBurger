import { Link, useLocation, useParams } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  ChefHat,
  Flame,
  MapPin,
  PackageCheck,
  ReceiptText,
  Timer,
  XCircle,
} from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { OrderStatusChip } from '@/components/OrderStatusChip';
import { formatBRL } from '@/utils/currency';
import { ORDER_STEPS, PAYMENT_LABEL, STATUS_LABEL } from '@/utils/orderStatus';
import type { OrderStatus } from '@/types';

const STEP_ICON: Record<string, typeof ChefHat> = {
  RECEIVED: ReceiptText,
  PREPARING: ChefHat,
  OVEN: Flame,
  READY: PackageCheck,
  OUT_FOR_DELIVERY: Bike,
  DELIVERED: CheckCircle2,
};

/** O que esta acontecendo agora, na etapa atual. */
const STEP_HINT: Partial<Record<OrderStatus, string>> = {
  RECEIVED: 'Aguardando a loja confirmar seu pedido...',
  PREPARING: 'A cozinha esta preparando seu pedido...',
  OVEN: 'Quase la, finalizando o preparo...',
  READY: 'Aguardando o entregador retirar o pedido...',
  OUT_FOR_DELIVERY: 'O entregador esta a caminho...',
};

function remainingMinutes(estimatedDeliveryAt: string): number {
  return Math.max(0, Math.round((new Date(estimatedDeliveryAt).getTime() - Date.now()) / 60_000));
}

export function OrderTrackingPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const location = useLocation();
  const justPlaced = (location.state as { placed?: boolean } | null)?.placed ?? false;
  const { data: order, isLoading, isError } = useOrder(uuid);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-72" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-medium">Pedido nao encontrado</p>
        <Link to="/pedidos">
          <Button variant="secondary">
            <ArrowLeft className="h-4 w-4" /> Meus pedidos
          </Button>
        </Link>
      </div>
    );
  }

  const currentStep = ORDER_STEPS.indexOf(order.status);
  const cancelled = order.status === 'CANCELLED';

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      {justPlaced && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-2 rounded-2xl bg-gradient-to-br
            from-emerald-500 to-emerald-600 p-6 text-center text-white sm:p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 15 }}
          >
            <CheckCircle2 className="h-14 w-14" aria-hidden />
          </motion.div>
          <h1 className="text-2xl font-extrabold">Pedido confirmado!</h1>
          <p className="text-sm text-white/85">
            Ja mandamos para a cozinha. Acompanhe o preparo em tempo real abaixo.
          </p>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {!justPlaced && (
            <Link
              to="/pedidos"
              aria-label="Voltar para meus pedidos"
              className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h2 className="text-xl font-extrabold">
            Pedido #{order.uuid.slice(0, 8).toUpperCase()}
          </h2>
        </div>
        <OrderStatusChip status={order.status} />
      </div>

      {order.estimatedDeliveryAt && !cancelled && order.status !== 'DELIVERED' && (
        <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
          <Timer className="h-5 w-5 shrink-0 text-brand-500" aria-hidden />
          <p className="text-sm">
            <span className="font-semibold">
              Previsao de entrega:{' '}
              {new Date(order.estimatedDeliveryAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit', minute: '2-digit',
              })}
            </span>{' '}
            <span className="text-zinc-500">
              (~{remainingMinutes(order.estimatedDeliveryAt)} min restantes)
            </span>
          </p>
        </div>
      )}

      {cancelled ? (
        <Card className="flex items-center gap-3 border border-red-200 dark:border-red-900">
          <XCircle className="h-8 w-8 shrink-0 text-red-500" aria-hidden />
          <div>
            <p className="font-bold">Pedido cancelado</p>
            <p className="text-sm text-zinc-500">
              Se voce nao solicitou o cancelamento, entre em contato com a loja.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <ol className="flex flex-col">
            {ORDER_STEPS.map((step, index) => {
              const done = index < currentStep;
              const current = index === currentStep;
              const Icon = STEP_ICON[step];
              return (
                <li key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full
                        ${done || current
                          ? 'bg-brand-500 text-white'
                          : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}
                    >
                      {current && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-brand-500/40" />
                      )}
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    {index < ORDER_STEPS.length - 1 && (
                      <span
                        className={`h-8 w-0.5 ${done ? 'bg-brand-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                      />
                    )}
                  </div>
                  <div className="pb-4 pt-2">
                    <p
                      className={`text-sm font-semibold
                        ${current
                          ? 'text-brand-500'
                          : done
                            ? ''
                            : 'text-zinc-400 dark:text-zinc-500'}`}
                    >
                      {STATUS_LABEL[step as OrderStatus]}
                    </p>
                    {current && STEP_HINT[order.status] && (
                      <p className="text-xs text-zinc-500">{STEP_HINT[order.status]}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <h3 className="font-bold">Itens</h3>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.productUuid} className="flex items-center gap-3">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-zinc-500">
                  {item.quantity}x {formatBRL(item.unitPrice)}
                </p>
              </div>
              <span className="text-sm font-bold">{formatBRL(item.totalPrice)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-zinc-200 pt-3 text-sm dark:border-zinc-700">
          <div className="flex justify-between text-zinc-500">
            <span>Subtotal</span>
            <span>{formatBRL(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-zinc-500">
            <span>Taxa de entrega</span>
            <span>{formatBRL(order.deliveryFee)}</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-extrabold">
            <span>Total</span>
            <span className="text-brand-500">{formatBRL(order.total)}</span>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <h3 className="font-bold">Entrega</h3>
        <p className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
          <span>
            {order.address.street}, {order.address.number}
            {order.address.complement ? ` - ${order.address.complement}` : ''}
            <br />
            {order.address.neighborhood}, {order.address.city}
          </span>
        </p>
        <p className="text-sm text-zinc-500">
          Pagamento: <span className="font-medium">{PAYMENT_LABEL[order.paymentMethod]}</span>
        </p>
        {order.note && <p className="text-sm text-zinc-500">Observacoes: {order.note}</p>}
      </Card>
    </div>
  );
}
