export type UserSettings = {
  id: number;
  moeda_padrao: string;
  fuso_horario: string;
  preferencias_dashboard?: Record<string, unknown>;
  preferencias_notificacao?: Record<string, unknown>;
};
