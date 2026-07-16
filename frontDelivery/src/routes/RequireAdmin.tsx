import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/AuthContext';

/** So ADMIN acessa; os demais voltam para a home (aninhado em RequireAuth). */
export function RequireAdmin() {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
