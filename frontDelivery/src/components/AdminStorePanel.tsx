import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DoorClosed, DoorOpen } from 'lucide-react';
import { useStoreStatus } from '@/hooks/useCatalog';
import { useUpdateStoreStatus } from '@/hooks/useAdminCatalog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/** Painel do admin: abrir/fechar a loja e editar taxa, tempo estimado e pedido minimo. */
export function AdminStorePanel() {
  const { data: status, isLoading } = useStoreStatus();
  const update = useUpdateStoreStatus();

  const [deliveryFee, setDeliveryFee] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [etaMin, setEtaMin] = useState('');
  const [etaMax, setEtaMax] = useState('');

  // preenche o formulario quando o status chega do servidor
  useEffect(() => {
    if (!status) return;
    setDeliveryFee(String(status.deliveryFee));
    setMinOrder(String(status.minOrder));
    setEtaMin(String(status.etaMinMinutes));
    setEtaMax(String(status.etaMaxMinutes));
  }, [status]);

  if (isLoading) return <Skeleton className="h-40 rounded-2xl" />;
  if (!status) return null;

  const toggleOpen = async () => {
    try {
      const updated = await update.mutateAsync({ open: !status.open });
      toast.success(updated.open ? 'Loja aberta! 🍕' : 'Loja fechada');
    } catch {
      toast.error('Nao foi possivel alterar o status da loja');
    }
  };

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(deliveryFee);
    const min = Number(minOrder);
    const eMin = Number(etaMin);
    const eMax = Number(etaMax);
    if ([fee, min, eMin, eMax].some((n) => Number.isNaN(n) || n < 0)) {
      toast.error('Preencha os campos com valores validos');
      return;
    }
    if (eMax < eMin) {
      toast.error('Tempo maximo deve ser maior que o minimo');
      return;
    }
    try {
      await update.mutateAsync({
        deliveryFee: fee,
        minOrder: min,
        etaMinMinutes: eMin,
        etaMaxMinutes: eMax,
      });
      toast.success('Informacoes da loja atualizadas');
    } catch {
      toast.error('Nao foi possivel salvar as informacoes');
    }
  };

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={`h-3 w-3 rounded-full ${status.open ? 'bg-green-500' : 'bg-red-500'}`}
          />
          <p className="font-bold">
            Loja{' '}
            <span className={status.open ? 'text-green-500' : 'text-red-500'}>
              {status.open ? 'aberta' : 'fechada'}
            </span>
          </p>
        </div>

        <Button
          type="button"
          variant={status.open ? 'danger' : 'primary'}
          onClick={toggleOpen}
          isLoading={update.isPending}
          className={status.open ? '' : '!bg-green-600 !shadow-green-600/25 hover:!bg-green-700'}
        >
          {status.open ? (
            <><DoorClosed className="h-4 w-4" aria-hidden /> Fechar loja</>
          ) : (
            <><DoorOpen className="h-4 w-4" aria-hidden /> Abrir loja</>
          )}
        </Button>
      </div>

      <form onSubmit={saveInfo} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Input
          label="Taxa de entrega (R$)"
          type="number" step="0.01" min="0" inputMode="decimal"
          value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)}
        />
        <Input
          label="Pedido mínimo (R$)"
          type="number" step="0.01" min="0" inputMode="decimal"
          value={minOrder} onChange={(e) => setMinOrder(e.target.value)}
        />
        <Input
          label="Tempo mín. (min)"
          type="number" step="1" min="0" inputMode="numeric"
          value={etaMin} onChange={(e) => setEtaMin(e.target.value)}
        />
        <Input
          label="Tempo máx. (min)"
          type="number" step="1" min="0" inputMode="numeric"
          value={etaMax} onChange={(e) => setEtaMax(e.target.value)}
        />
        <div className="col-span-2 sm:col-span-4">
          <Button type="submit" isLoading={update.isPending}>Salvar informações</Button>
        </div>
      </form>
    </Card>
  );
}
