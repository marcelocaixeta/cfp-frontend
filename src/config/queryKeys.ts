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
    dashboardRoot: ['finance', 'dashboard'] as const,
    dashboard: (month: string) => ['finance', 'dashboard', month] as const,
    summaryRoot: ['finance', 'summary'] as const,
    summary: (month: string) => ['finance', 'summary', month] as const,
    dueDatesRoot: ['finance', 'dueDates'] as const,
    dueDates: (month: string) => ['finance', 'dueDates', month] as const,
    creditCards: ['finance', 'creditCards'] as const,
    creditCard: (id: number) => ['finance', 'creditCards', id] as const,
    creditCardDebts: ['finance', 'creditCardDebts'] as const,
    creditCardDebt: (id: number) => ['finance', 'creditCardDebts', id] as const,
    homeBills: ['finance', 'homeBills'] as const,
    homeBill: (id: number) => ['finance', 'homeBills', id] as const,
    loans: ['finance', 'loans'] as const,
    loan: (id: number) => ['finance', 'loans', id] as const,
    receitasMensais: ['finance', 'receitasMensais'] as const,
    receitaMensal: (id: number) => ['finance', 'receitasMensais', id] as const,
  },
  settings: {
    current: ['settings', 'current'] as const,
  },
  support: {
    tickets: ['support', 'tickets'] as const,
    allTickets: ['support', 'tickets', 'all'] as const,
  },
};
