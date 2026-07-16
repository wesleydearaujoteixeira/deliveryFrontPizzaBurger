import { Navigate, Outlet, useLocation } from 'react-router';
import { Pizza } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * Guarda de rota: o conteudo do app so e renderizado com sessao valida.
 * Sem usuario, redireciona para /login guardando a rota de origem.
 */
export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Enquanto o /me responde, nada do conteudo protegido aparece
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <Pizza className="h-10 w-10 animate-pulse text-brand-500" aria-hidden />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
