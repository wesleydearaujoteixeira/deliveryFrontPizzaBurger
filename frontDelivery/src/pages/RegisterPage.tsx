import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/Logo';
import type { RegistrationPending } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.email('Email invalido'),
  password: z.string().min(8, 'Minimo de 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

/** Mensagem da API (ApiError.message) com fallback amigavel. */
function apiMessage(err: unknown, fallback: string) {
  const response = (err as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message ?? fallback;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();
  // Etapa 2 quando ha um cadastro pendente aguardando o codigo do e-mail
  const [pending, setPending] = useState<RegistrationPending | null>(null);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Contagem regressiva para liberar o botao "Reenviar codigo"
  useEffect(() => {
    if (!pending || cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [pending, cooldown]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.register(data);
      setPending(res);
      setCode('');
      setCooldown(res.resendCooldownSeconds);
      toast.success(`Codigo enviado para ${res.email}`);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 409) toast.error('Este email ja esta cadastrado');
      else toast.error(apiMessage(err, 'Erro ao criar conta'));
    }
  };

  const onConfirm = async () => {
    if (!pending || code.length !== 6) return;
    setConfirming(true);
    try {
      await authService.confirmRegistration({ email: pending.email, code });
      // Aguarda o /me: navegar antes faria o guard devolver para /login
      await refetchUser();
      toast.success('Conta criada! Seja bem-vindo.');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      toast.error(apiMessage(err, 'Nao foi possivel confirmar o codigo'));
      // Codigo expirado ou bloqueado por tentativas: volta para a etapa 1
      if (status === 410 || status === 429) setPending(null);
      else setCode('');
    } finally {
      setConfirming(false);
    }
  };

  const onResend = async () => {
    if (!pending || cooldown > 0) return;
    setResending(true);
    try {
      const res = await authService.resendRegistrationCode(pending.email);
      setPending(res);
      setCode('');
      setCooldown(res.resendCooldownSeconds);
      toast.success('Novo codigo enviado!');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      toast.error(apiMessage(err, 'Nao foi possivel reenviar o codigo'));
      if (status === 404) setPending(null);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-md sm:mt-8">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      {!pending ? (
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold">Criar conta</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <Input label="Nome" autoComplete="name"
              error={errors.name?.message} {...register('name')} />
            <Input label="Email" type="email" autoComplete="email"
              error={errors.email?.message} {...register('email')} />
            <Input label="Senha" type="password" autoComplete="new-password"
              error={errors.password?.message} {...register('password')} />
            <Button type="submit" isLoading={isSubmitting}>Receber codigo por email</Button>
          </form>

          <p className="text-center text-sm text-zinc-500">
            Ja tem conta?{' '}
            <Link to="/login" className="font-semibold text-brand-500 hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      ) : (
        <Card className="flex flex-col gap-5 p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold">Confirme seu email</h1>
          <p className="text-sm text-zinc-500">
            Enviamos um codigo de 6 digitos para{' '}
            <strong className="text-zinc-700 dark:text-zinc-200">{pending.email}</strong>.
            Ele expira em {Math.max(1, Math.round(pending.expiresInSeconds / 60))} minutos.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); onConfirm(); }}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Codigo de confirmacao"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl font-bold tracking-[0.5em]"
              autoFocus
            />
            <Button type="submit" isLoading={confirming} disabled={code.length !== 6}>
              Confirmar e criar conta
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="font-semibold text-zinc-500 hover:underline"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0 || resending}
              className="font-semibold text-brand-500 hover:underline disabled:cursor-not-allowed
                disabled:text-zinc-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Reenviar codigo (${cooldown}s)` : 'Reenviar codigo'}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
