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
    addressBalance: (address?: string) => ['btc', 'addressBalance', address ?? 'default'] as const,
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
  },
  finance: {
    summary: ['finance', 'summary'] as const,
    currentWeekDueDates: ['finance', 'currentWeekDueDates'] as const,
    creditCards: ['finance', 'creditCards'] as const,
    creditCardDebts: ['finance', 'creditCardDebts'] as const,
    loans: ['finance', 'loans'] as const,
  },
  settings: {
    current: ['settings', 'current'] as const,
  },
  support: {
    tickets: ['support', 'tickets'] as const,
  },
};
