import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '../../components/layout/AppShell';
import { UserProfilesPage } from '../../features/admin/pages/UserProfilesPage';
import { AnalyticsOverviewPage } from '../../features/analytics/pages/AnalyticsOverviewPage';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage';
import { BtcAssetsPage } from '../../features/btc/pages/BtcAssetsPage';
import { CreditCardDebtFormPage } from '../../features/finance/pages/CreditCardDebtFormPage';
import { CreditCardDebtsPage } from '../../features/finance/pages/CreditCardDebtsPage';
import { CreditCardFormPage } from '../../features/finance/pages/CreditCardFormPage';
import { CreditCardsPage } from '../../features/finance/pages/CreditCardsPage';
import { FinanceDashboardPage } from '../../features/finance/pages/FinanceDashboardPage';
import { FinanceSummaryPage } from '../../features/finance/pages/FinanceSummaryPage';
import { HomeBillFormPage } from '../../features/finance/pages/HomeBillFormPage';
import { HomeBillsPage } from '../../features/finance/pages/HomeBillsPage';
import { LoanFormPage } from '../../features/finance/pages/LoanFormPage';
import { LoansPage } from '../../features/finance/pages/LoansPage';
import { ReceitaMensalFormPage } from '../../features/finance/pages/ReceitaMensalFormPage';
import { ReceitasMensaisPage } from '../../features/finance/pages/ReceitasMensaisPage';
import { SettingsPage } from '../../features/settings/pages/SettingsPage';
import { AdminSupportTicketsPage } from '../../features/support/pages/AdminSupportTicketsPage';
import { SupportTicketFormPage } from '../../features/support/pages/SupportTicketFormPage';
import { SupportTicketsPage } from '../../features/support/pages/SupportTicketsPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { PlaceholderPage } from '../../pages/PlaceholderPage';
import { AdminRoute } from './AdminRoute';
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
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/redefinir-senha',
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <FinanceDashboardPage /> },
          { path: '/btc/ativos', element: <BtcAssetsPage /> },
          { path: '/analises', element: <AnalyticsOverviewPage /> },
          { path: '/financas', element: <FinanceSummaryPage /> },
          { path: '/financas/cartoes', element: <CreditCardsPage /> },
          { path: '/financas/cartoes/novo', element: <CreditCardFormPage /> },
          { path: '/financas/cartoes/:id', element: <CreditCardFormPage /> },
          { path: '/financas/dividas-cartao', element: <CreditCardDebtsPage /> },
          { path: '/financas/dividas-cartao/nova', element: <CreditCardDebtFormPage /> },
          { path: '/financas/dividas-cartao/:id', element: <CreditCardDebtFormPage /> },
          { path: '/financas/contas-casa', element: <HomeBillsPage /> },
          { path: '/financas/contas-casa/nova', element: <HomeBillFormPage /> },
          { path: '/financas/contas-casa/:id', element: <HomeBillFormPage /> },
          { path: '/financas/emprestimos', element: <LoansPage /> },
          { path: '/financas/emprestimos/novo', element: <LoanFormPage /> },
          { path: '/financas/emprestimos/:id', element: <LoanFormPage /> },
          { path: '/financas/receitas-mensais', element: <ReceitasMensaisPage /> },
          { path: '/financas/receitas-mensais/nova', element: <ReceitaMensalFormPage /> },
          { path: '/financas/receitas-mensais/:id', element: <ReceitaMensalFormPage /> },
          { path: '/configuracoes', element: <SettingsPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin/perfis', element: <UserProfilesPage /> },
              { path: '/admin/suporte', element: <AdminSupportTicketsPage /> },
            ],
          },
          { path: '/suporte', element: <SupportTicketsPage /> },
          { path: '/suporte/novo', element: <SupportTicketFormPage /> },
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
