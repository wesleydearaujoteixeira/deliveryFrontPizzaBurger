import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';

/** Pagina de retorno do Google: os cookies ja foram emitidos pelo backend. */
export function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { refetchUser } = useAuth();

  useEffect(() => {
    // Aguarda o /me confirmar a sessao antes de navegar:
    // a home ja renderiza com o usuario logado, sem "flash" de deslogado
    let active = true;
    refetchUser().finally(() => {
      if (active) navigate('/', { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate, refetchUser]);

  return <Skeleton className="mx-auto mt-16 h-40 max-w-md" />;
}
