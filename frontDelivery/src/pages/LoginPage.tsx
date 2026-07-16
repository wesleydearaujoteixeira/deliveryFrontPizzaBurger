import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { GoogleIcon } from '@/components/ui/GoogleIcon';
import { Logo } from '@/components/Logo';

const schema = z.object({
  email: z.email('Email invalido'),
  password: z.string().min(8, 'Minimo de 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetchUser } = useAuth();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  // Ja autenticado: nao mostra o formulario de novo
  if (user) return <Navigate to={from} replace />;

  const onSubmit = async (data: FormData) => {
    try {
      await authService.login(data);
      // Aguarda o /me: navegar antes faria o guard devolver para /login
      await refetchUser();
      navigate(from, { replace: true });
    } catch {
      toast.error('Email ou senha incorretos');
    }
  };

  return (
    <div className="mx-auto mt-4 max-w-md sm:mt-8">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <Card className="flex flex-col gap-5 p-6 sm:p-8 ">
        <h1 className="text-2xl font-extrabold ">Entrar</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input label="Email" type="email" autoComplete="email"
            error={errors.email?.message} {...register('email')} />
          <Input label="Senha" type="password" autoComplete="current-password"
            error={errors.password?.message} {...register('password')} />
        <Button className="cursor-pointer" type="submit" isLoading={isSubmitting}>Entrar</Button>
        </form>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" /> ou
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <Button
          className="cursor-pointer"
          variant="secondary"
          onClick={() => authService.loginWithGoogle()}
          aria-label="Continuar com Google"
        >
          <GoogleIcon />
          <span className="hidden sm:inline"> Google </span>
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Nao tem conta?{' '}
          <Link to="/registro" className="font-semibold text-brand-500 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
