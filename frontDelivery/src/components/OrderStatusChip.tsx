import type { OrderStatus } from '@/types';
import { STATUS_LABEL } from '@/utils/orderStatus';

const STATUS_STYLE: Record<OrderStatus, string> = {
  RECEIVED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  PREPARING: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400',
  OVEN: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400',
  READY: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-400',
  OUT_FOR_DELIVERY: 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-400',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400',
};

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
