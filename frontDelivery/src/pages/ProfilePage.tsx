import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera, TriangleAlert } from 'lucide-react';
import { profileService } from '@/services/profile.service';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // mesmo limite do backend
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  phone: z
    .string()
    .max(20, 'Telefone muito longo')
    .regex(/^[0-9()+\-\s]*$/, 'Use apenas numeros, espacos e ( ) + -')
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

function apiMessage(err: unknown, fallback: string) {
  const response = (err as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message ?? fallback;
}

export function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const { clear } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(''); // senha ou "EXCLUIR"
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  });

  if (!user) return null; // rota protegida: nunca acontece na pratica

  const isLocal = user.provider === 'LOCAL';
  const canDelete = user.role !== 'ADMIN';
  const deleteReady = isLocal ? deleteConfirm.length > 0 : deleteConfirm === 'EXCLUIR';

  const onPickAvatar = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Use uma imagem JPEG, PNG ou WebP');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('A imagem deve ter no maximo 5MB');
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    try {
      await profileService.update(
        { name: data.name, phone: data.phone || undefined },
        avatarFile ?? undefined,
      );
      await refetchUser();
      setAvatarFile(null);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(null);
      toast.success('Perfil atualizado!');
    } catch (err: unknown) {
      toast.error(apiMessage(err, 'Nao foi possivel salvar as alteracoes'));
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await profileService.deleteAccount(isLocal ? deleteConfirm : undefined);
      clear(); // carrinho nao sobrevive a conta
      queryClient.clear();
      toast.success('Conta excluida. Sentiremos sua falta!');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      toast.error(apiMessage(err, 'Nao foi possivel excluir a conta'));
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-extrabold">Minha conta</h1>

      <Card className="flex flex-col gap-6 p-6 sm:p-8">
        {/* Foto de perfil com troca */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Trocar foto de perfil"
            className="group relative shrink-0 rounded-full focus:outline-none
              focus:ring-2 focus:ring-brand-500/50"
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Nova foto de perfil"
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <Avatar name={user.name} src={user.avatarUrl} size={80} />
            )}
            <span
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center
                rounded-full bg-brand-500 text-white shadow-md transition-transform
                group-hover:scale-110"
            >
              <Camera className="h-4 w-4" aria-hidden />
            </span>
          </button>
          <div className="text-sm text-zinc-500">
            <p className="font-semibold text-zinc-700 dark:text-zinc-200">Foto de perfil</p>
            <p>JPEG, PNG ou WebP ate 5MB.</p>
            {avatarFile && (
              <p className="mt-1 font-medium text-brand-500">
                Nova foto selecionada — salve para aplicar.
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => onPickAvatar(e.target.files?.[0])}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input label="Nome" autoComplete="name"
            error={errors.name?.message} {...register('name')} />
          <Input label="Telefone" type="tel" autoComplete="tel" placeholder="(44) 99999-9999"
            error={errors.phone?.message} {...register('phone')} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email-fixo" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email-fixo"
              value={user.email}
              disabled
              className="cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 px-4
                py-3 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-surface-dark
                dark:text-zinc-400"
            />
            <span className="text-xs text-zinc-400">
              O email e o login da conta e nao pode ser alterado.
            </span>
          </div>
          <Button type="submit" isLoading={isSubmitting}>Salvar alteracoes</Button>
        </form>
      </Card>

      {/* Zona de perigo */}
      <Card className="mt-6 border border-red-200 p-6 sm:p-8 dark:border-red-900/50">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
          <div className="flex-1">
            <h2 className="font-bold text-red-600 dark:text-red-400">Excluir conta</h2>
            {canDelete ? (
              <>
                <p className="mt-1 text-sm text-zinc-500">
                  A exclusao e permanente: seus dados pessoais sao removidos e voce
                  perdera o acesso. Pedidos ja realizados sao mantidos de forma anonima.
                </p>
                <Button
                  variant="danger"
                  className="mt-4"
                  onClick={() => { setDeleteConfirm(''); setShowDelete(true); }}
                >
                  Excluir minha conta
                </Button>
              </>
            ) : (
              <p className="mt-1 text-sm text-zinc-500">
                Contas de administrador nao podem ser excluidas pelo aplicativo.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Confirmacao da exclusao */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusao da conta"
          onClick={() => !deleting && setShowDelete(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-surface-light p-6 shadow-card
              dark:bg-surface-dark-2 dark:shadow-card-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">Tem certeza?</h3>
            <p className="mt-2 text-sm text-zinc-500">
              {isLocal
                ? 'Para confirmar a exclusao definitiva, digite a sua senha.'
                : 'Para confirmar a exclusao definitiva, digite EXCLUIR abaixo.'}
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); if (deleteReady) onDelete(); }}
              className="mt-4 flex flex-col gap-4"
              noValidate
            >
              <Input
                label={isLocal ? 'Senha' : 'Confirmacao'}
                type={isLocal ? 'password' : 'text'}
                autoComplete={isLocal ? 'current-password' : 'off'}
                placeholder={isLocal ? undefined : 'EXCLUIR'}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={deleting}
                  onClick={() => setShowDelete(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  className="flex-1"
                  isLoading={deleting}
                  disabled={!deleteReady}
                >
                  Excluir conta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
