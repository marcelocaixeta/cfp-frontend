import {
  BarChart3,
  Bitcoin,
  CreditCard,
  Headphones,
  HousePlug,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  UserCog,
  UserRound,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { env } from '../../config/env';
import { useTheme } from '../../app/providers/useTheme';
import { useAuth } from '../../features/auth/useAuth';
import { IconButton } from '../ui/IconButton';

type NavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  children?: string[];
  parentPath?: string;
};

const navItems: NavigationItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analises', label: 'Análises', icon: BarChart3 },
  {
    to: '/financas',
    label: 'Resumo financeiro',
    icon: WalletCards,
    children: ['/financas/cartoes', '/financas/dividas-cartao', '/financas/contas-casa', '/financas/emprestimos'],
  },
  { to: '/financas/cartoes', label: 'Cartões', icon: CreditCard, parentPath: '/financas' },
  {
    to: '/financas/dividas-cartao',
    label: 'Gastos com o cartão de crédito',
    icon: CreditCard,
    parentPath: '/financas',
  },
  { to: '/financas/contas-casa', label: 'Contas de casa', icon: HousePlug, parentPath: '/financas' },
  { to: '/financas/emprestimos', label: 'Empréstimos', icon: WalletCards, parentPath: '/financas' },
  { to: '/btc/ativos', label: 'Ativos', icon: Bitcoin },
  { to: '/suporte', label: 'Suporte', icon: Headphones },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

const adminNavItems: NavigationItem[] = [
  { to: '/admin/perfis', label: 'Perfis', icon: UserCog },
  { to: '/admin/suporte', label: 'Atender suporte', icon: Headphones },
];

function isRouteMatch(pathname: string, itemPath: string) {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

function isNavItemActive(pathname: string, item: NavigationItem) {
  if (item.children?.some((childPath) => isRouteMatch(pathname, childPath))) {
    return false;
  }

  return isRouteMatch(pathname, item.to);
}

function Navigation({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const visibleItems = isAdmin ? [...navItems, ...adminNavItems] : navItems;
  const activeItem = visibleItems
    .filter((item) => isNavItemActive(pathname, item))
    .sort((currentItem, nextItem) => nextItem.to.length - currentItem.to.length)[0];

  return (
    <nav className="side-nav" aria-label="Navegação principal">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const className = activeItem?.to === item.to ? 'side-nav__link active' : 'side-nav__link';

        return (
          <Link
            aria-current={activeItem?.to === item.to ? 'page' : undefined}
            className={className}
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { logout, user } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isAdmin = user?.perfil === 'admin';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">C</span>
          <span>{env.appName}</span>
        </div>
        <Navigation isAdmin={isAdmin} />
      </aside>

      <div className="app-shell__main">
        <header className="topbar">
          <IconButton className="topbar__menu" label="Abrir menu" onClick={() => setIsDrawerOpen(true)}>
            <Menu size={20} />
          </IconButton>
          <div className="topbar__title">Controle Financeiro Pessoal</div>
          <div className="topbar__actions">
            <IconButton label={resolvedTheme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'} onClick={toggleTheme}>
              {resolvedTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </IconButton>
            <NavLink className="user-chip" to="/perfil">
              <UserRound size={17} aria-hidden="true" />
              <span>{user?.nome ?? user?.email ?? 'Perfil'}</span>
            </NavLink>
            <IconButton label="Sair" onClick={logout}>
              <LogOut size={19} />
            </IconButton>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>

      {isDrawerOpen ? (
        <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="drawer__backdrop" onClick={() => setIsDrawerOpen(false)} />
          <div className="drawer__panel">
            <div className="drawer__header">
              <div className="brand">
                <span className="brand__mark">C</span>
                <span>{env.appName}</span>
              </div>
              <IconButton label="Fechar menu" onClick={() => setIsDrawerOpen(false)}>
                <X size={20} />
              </IconButton>
            </div>
            <Navigation isAdmin={isAdmin} onNavigate={() => setIsDrawerOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
