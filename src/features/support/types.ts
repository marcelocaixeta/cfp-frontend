export type SupportTicket = {
  id: number;
  assunto: string;
  categoria?: string | null;
  prioridade: 'low' | 'normal' | 'high';
  situacao: 'open' | 'waiting_user' | 'waiting_support' | 'resolved' | 'closed';
  messages?: SupportTicketMessage[];
  messages_count?: number;
  criado_em?: string;
};

export type SupportTicketMessage = {
  id: number;
  mensagem: string;
  user?: {
    id: number;
    nome?: string | null;
    email: string;
    perfil: 'admin' | 'usuario';
  } | null;
  criado_em?: string;
};
