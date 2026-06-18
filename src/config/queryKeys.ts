export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
  },
  btc: {
    dashboard: ['btc', 'dashboard'] as const,
    assets: ['btc', 'assets'] as const,
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
  },
  finance: {
    dashboard: (month: string) => ['finance', 'dashboard', month] as const,
    summary: ['finance', 'summary'] as const,
    currentWeekDueDates: ['finance', 'currentWeekDueDates'] as const,
    creditCards: ['finance', 'creditCards'] as const,
    creditCardDebts: ['finance', 'creditCardDebts'] as const,
    homeBills: ['finance', 'homeBills'] as const,
    loans: ['finance', 'loans'] as const,
    receitasMensais: ['finance', 'receitasMensais'] as const,
  },
  settings: {
    current: ['settings', 'current'] as const,
  },
  support: {
    tickets: ['support', 'tickets'] as const,
    allTickets: ['support', 'tickets', 'all'] as const,
  },
};
