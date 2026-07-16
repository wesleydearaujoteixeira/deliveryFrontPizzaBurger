import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ImagePlus, PackagePlus, ReceiptText, Store, Trash2, UtensilsCrossed } from 'lucide-react';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useCreateProduct, useDeleteProduct } from '@/hooks/useAdminCatalog';
import { AdminOrdersPanel } from '@/components/AdminOrdersPanel';
import { AdminStorePanel } from '@/components/AdminStorePanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatBRL } from '@/utils/currency';
import type { Product } from '@/types';

const PRODUCT_TYPES: { value: Product['type']; label: string }[] = [
  { value: 'PIZZA', label: 'Pizza' },
  { value: 'BURGER', label: 'Hamburguer' },
  { value: 'DRINK', label: 'Bebida' },
  { value: 'DESSERT', label: 'Sobremesa' },
  { value: 'SIDE', label: 'Acompanhamento' },
  { value: 'COMBO', label: 'Combo' },
];

const schema = z.object({
  name: z.string().trim().min(2, 'Informe o nome').max(120),
  description: z.string().trim().min(5, 'Descreva o produto').max(600),
  type: z.enum(['PIZZA', 'BURGER', 'DRINK', 'DESSERT', 'SIDE', 'COMBO']),
  basePrice: z.number('Informe o preco').positive('Preco deve ser maior que zero'),
  categoryUuid: z.string().min(1, 'Escolha a categoria'),
});

type FormData = z.infer<typeof schema>;

const selectClass = `rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none
  transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
  dark:border-zinc-700 dark:bg-surface-dark-2 dark:text-zinc-100`;

export function AdminPage() {
  const [tab, setTab] = useState<'pedidos' | 'cardapio'>('pedidos');
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [image, setImage] = useState<File | undefined>();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createProduct.mutateAsync({ data, image });
      toast.success(`${data.name} cadastrado no cardapio`);
      reset();
      setImage(undefined);
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      toast.error('Nao foi possivel cadastrar o produto');
    }
  };

  const onDelete = async (product: Product) => {
    if (!window.confirm(`Remover "${product.name}" do cardapio?`)) return;
    try {
      await deleteProduct.mutateAsync(product.uuid);
      toast.success(`${product.name} removido`);
    } catch {
      toast.error('Nao foi possivel remover o produto');
    }
  };

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors
     ${active
       ? 'bg-brand-500 text-white'
       : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-surface-dark-2 dark:text-zinc-300 dark:hover:bg-zinc-800'}`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold">
        <Store className="h-6 w-6 text-brand-500" aria-hidden />
        Gestao da loja
      </h1>

      <AdminStorePanel />

      <div className="flex gap-2" role="tablist">
        <button role="tab" aria-selected={tab === 'pedidos'}
          className={tabClass(tab === 'pedidos')} onClick={() => setTab('pedidos')}>
          <ReceiptText className="h-4 w-4" aria-hidden /> Pedidos
        </button>
        <button role="tab" aria-selected={tab === 'cardapio'}
          className={tabClass(tab === 'cardapio')} onClick={() => setTab('cardapio')}>
          <PackagePlus className="h-4 w-4" aria-hidden /> Cardapio
        </button>
      </div>

      {tab === 'pedidos' && <AdminOrdersPanel />}

      {tab === 'cardapio' && (
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[420px_1fr]">
        <Card className="flex flex-col gap-4">
          <h2 className="font-bold">Novo produto</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input label="Nome" error={errors.name?.message} {...register('name')} />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Descricao
              </label>
              <textarea
                id="description"
                rows={3}
                className={`resize-none ${selectClass} placeholder:text-zinc-400`}
                {...register('description')}
              />
              {errors.description && (
                <span role="alert" className="text-xs text-red-500">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="type" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tipo
                </label>
                <select id="type" className={selectClass} {...register('type')}>
                  {PRODUCT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Preco (R$)"
                type="number"
                step="0.01"
                min="0.01"
                inputMode="decimal"
                error={errors.basePrice?.message}
                {...register('basePrice', { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="categoryUuid" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Categoria
              </label>
              <select id="categoryUuid" defaultValue="" className={selectClass} {...register('categoryUuid')}>
                <option value="" disabled>Selecione...</option>
                {categories?.map((c) => (
                  <option key={c.uuid} value={c.uuid}>{c.name}</option>
                ))}
              </select>
              {errors.categoryUuid && (
                <span role="alert" className="text-xs text-red-500">
                  {errors.categoryUuid.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="image" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Foto <span className="font-normal text-zinc-500">(JPEG, PNG ou WebP, ate 5MB)</span>
              </label>
              <label
                htmlFor="image"
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed
                  border-zinc-300 px-4 py-3 text-sm text-zinc-500 hover:border-brand-500
                  hover:text-brand-500 dark:border-zinc-600"
              >
                <ImagePlus className="h-4 w-4" aria-hidden />
                {image ? image.name : 'Escolher imagem...'}
              </label>
              <input
                ref={fileRef}
                id="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setImage(e.target.files?.[0])}
              />
            </div>

            <Button type="submit" isLoading={isSubmitting}>Cadastrar produto</Button>
          </form>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="font-bold">Produtos no cardapio</h2>
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          )}
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {products?.content.map((product) => (
              <li key={product.uuid} className="flex items-center gap-3 py-3">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <UtensilsCrossed className="h-5 w-5 text-zinc-400" aria-hidden />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-zinc-500">{formatBRL(product.basePrice)}</p>
                </div>
                <button
                  onClick={() => onDelete(product)}
                  aria-label={`Remover ${product.name}`}
                  className="rounded-xl p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500
                    dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          {products && products.content.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">Nenhum produto cadastrado.</p>
          )}
        </Card>
      </div>
      )}
    </div>
  );
}
