import { Outlet, Link, useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { Moon, Sun, LogOut, ShoppingBag, ReceiptText, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Avatar } from '@/components/ui/Avatar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';
import { Location } from '@/components/Location';
import { Logo } from '@/components/Logo';

export function MainLayout() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const { count, openCart, clear } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    clear(); // carrinho nao sobrevive a troca de usuario
    queryClient.clear(); // nada em cache vaza para a tela de login
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" aria-label="Pagina inicial">
            <Logo />
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user && (
              <div className="flex items-center gap-1 sm:gap-2">
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    aria-label="Gestao do cardapio"
                    className="rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                )}

                <Link
                  to="/pedidos"
                  aria-label="Meus pedidos"
                  className="rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ReceiptText className="h-5 w-5" />
                </Link>

                <button
                  onClick={openCart}
                  aria-label={`Abrir carrinho (${count} itens)`}
                  className="relative rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {count > 0 && (
                    <span
                      className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center
                        justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white"
                    >
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </button>

                <Link
                  to="/perfil"
                  aria-label="Minha conta"
                  className="rounded-full transition hover:ring-2 hover:ring-brand-500/50
                    focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <Avatar name={user.name} src={user.avatarUrl} />
                </Link>

                <button
                  onClick={handleLogout}
                  aria-label="Sair"
                  className="rounded-xl p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <Location />

      <Footer />

      <CartDrawer />
    </div>
  );
}
