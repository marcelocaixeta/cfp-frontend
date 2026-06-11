export type SupportTicket = {
  id: number;
  assunto: string;
  categoria?: string | null;
  prioridade: 'low' | 'normal' | 'high';
  situacao: 'open' | 'waiting_user' | 'waiting_support' | 'resolved' | 'closed';
  messages_count?: number;
  criado_em?: string;
};

export type SupportTicketMessage = {
  id: number;
  mensagem: string;
  criado_em?: string;
};
