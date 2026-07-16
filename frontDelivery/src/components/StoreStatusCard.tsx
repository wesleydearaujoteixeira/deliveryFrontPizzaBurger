import { Bike, Clock, CircleDollarSign } from 'lucide-react';
import { useStoreStatus } from '@/hooks/useCatalog';
import { LogoMark } from '@/components/Logo';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatBRL } from '@/utils/currency';

/**
 * Card com a identidade da loja e o status em tempo real (aberto/fechado),
 * taxa de entrega, tempo estimado e pedido minimo. Controlado pelo admin.
 */
export function StoreStatusCard() {
  const { data: status, isLoading } = useStoreStatus();

  if (isLoading) return <Skeleton className="h-28 rounded-2xl" />;
  if (!status) return null;

  return (
    <section
      aria-label="Informacoes da loja"
      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-surface-dark-2 sm:p-5"
    >
      <LogoMark className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />

      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="truncate font-display text-lg font-extrabold sm:text-xl">
          Delivery <span className="text-brand-500">Pizza &amp; Burger</span>
        </h2>

        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <span
            aria-hidden
            className={`h-2.5 w-2.5 rounded-full ${status.open ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <span className={status.open ? 'text-green-500' : 'text-red-500'}>
            {status.open ? 'Aberto' : 'Fechado'}
          </span>
        </p>

        <div className="flex flex-wrap gap-2">
          <InfoChip icon={<Bike className="h-3.5 w-3.5" aria-hidden />}
            label={formatBRL(status.deliveryFee)} title="Taxa de entrega" />
          <InfoChip icon={<Clock className="h-3.5 w-3.5" aria-hidden />}
            label={`${status.etaMinMinutes}–${status.etaMaxMinutes}min`} title="Tempo estimado" />
          <InfoChip icon={<CircleDollarSign className="h-3.5 w-3.5" aria-hidden />}
            label={`Mín. ${formatBRL(status.minOrder)}`} title="Pedido minimo" />
        </div>
      </div>
    </section>
  );
}

function InfoChip({ icon, label, title }: { icon: React.ReactNode; label: string; title: string }) {
  return (
    <span
      title={title}
      className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs
        font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
    >
      {icon}
      {label}
    </span>
  );
}
