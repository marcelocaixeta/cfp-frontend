import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { AnalyticsOverviewPage } from '../../features/analytics/pages/AnalyticsOverviewPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { BtcAssetsPage } from '../../features/btc/pages/BtcAssetsPage';
import { BtcDashboardPage } from '../../features/btc/pages/BtcDashboardPage';
import { CreditCardDebtsPage } from '../../features/finance/pages/CreditCardDebtsPage';
import { CreditCardsPage } from '../../features/finance/pages/CreditCardsPage';
import { FinanceSummaryPage } from '../../features/finance/pages/FinanceSummaryPage';
import { LoansPage } from '../../features/finance/pages/LoansPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';
import { SupportTicketsPage } from '../../features/support/pages/SupportTicketsPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { PlaceholderPage } from '../../pages/PlaceholderPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/cadastro',
    element: <RegisterPage />,
  },
  {
    path: '/esqueci-senha',
    element: (
      <PlaceholderPage
        title="Recuperar senha"
        description="Fluxo preparado para quando o backend disponibilizar recuperação de senha."
      />
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <BtcDashboardPage /> },
          { path: '/btc/ativos', element: <BtcAssetsPage /> },
          { path: '/analises', element: <AnalyticsOverviewPage /> },
          { path: '/financas', element: <FinanceSummaryPage /> },
          { path: '/financas/cartoes', element: <CreditCardsPage /> },
          { path: '/financas/cartoes/novo', element: <PlaceholderPage title="Novo cartão" /> },
          { path: '/financas/cartoes/:id', element: <PlaceholderPage title="Detalhe do cartão" /> },
          { path: '/financas/dividas-cartao', element: <CreditCardDebtsPage /> },
          { path: '/financas/dividas-cartao/nova', element: <PlaceholderPage title="Nova dívida" /> },
          {
            path: '/financas/dividas-cartao/:id',
            element: <PlaceholderPage title="Detalhe da dívida" />,
          },
          { path: '/financas/emprestimos', element: <LoansPage /> },
          { path: '/financas/emprestimos/novo', element: <PlaceholderPage title="Novo empréstimo" /> },
          {
            path: '/financas/emprestimos/:id',
            element: <PlaceholderPage title="Detalhe do empréstimo" />,
          },
          { path: '/configuracoes', element: <SettingsPage /> },
          { path: '/suporte', element: <SupportTicketsPage /> },
          { path: '/suporte/novo', element: <PlaceholderPage title="Novo chamado" /> },
          { path: '/suporte/:id', element: <PlaceholderPage title="Detalhe do chamado" /> },
          { path: '/perfil', element: <PlaceholderPage title="Perfil" /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
