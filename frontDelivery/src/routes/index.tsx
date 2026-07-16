import { createBrowserRouter } from 'react-router';
import { MainLayout } from '@/layouts/MainLayout';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireAdmin } from '@/routes/RequireAdmin';

// Rotas com lazy loading: cada pagina vira um chunk separado no build
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    // Evita warning de hidratacao com rotas lazy; tela fica em branco so no 1o carregamento
    hydrateFallbackElement: <></>,
    children: [
      {
        // Conteudo do app: so renderiza com sessao valida
        element: <RequireAuth />,
        children: [
          {
            path: '/',
            lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }),
          },
          {
            path: '/checkout',
            lazy: async () => ({ Component: (await import('@/pages/CheckoutPage')).CheckoutPage }),
          },
          {
            path: '/pedidos',
            lazy: async () => ({ Component: (await import('@/pages/OrdersPage')).OrdersPage }),
          },
          {
            path: '/perfil',
            lazy: async () => ({ Component: (await import('@/pages/ProfilePage')).ProfilePage }),
          },
          {
            path: '/pedidos/:uuid',
            lazy: async () => ({
              Component: (await import('@/pages/OrderTrackingPage')).OrderTrackingPage,
            }),
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: '/admin',
                lazy: async () => ({ Component: (await import('@/pages/AdminPage')).AdminPage }),
              },
            ],
          },
        ],
      },
      {
        path: '/login',
        lazy: async () => ({ Component: (await import('@/pages/LoginPage')).LoginPage }),
      },
      {
        path: '/registro',
        lazy: async () => ({ Component: (await import('@/pages/RegisterPage')).RegisterPage }),
      },
      {
        path: '/auth/callback',
        lazy: async () => ({
          Component: (await import('@/pages/OAuthCallbackPage')).OAuthCallbackPage,
        }),
      },
    ],
  },
]);
