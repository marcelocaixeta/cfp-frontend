import { apiRequest } from '../../../lib/api/apiClient';
import type { ApiEnvelope } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type { SupportTicket } from '../types';

export async function getSupportTickets() {
  const response = await apiRequest<PaginatedEnvelope<SupportTicket>>('/support/tickets');
  return response.data;
}

export async function createSupportTicket(data: {
  assunto: string;
  categoria?: string;
  prioridade: 'low' | 'normal' | 'high';
  mensagem: string;
}) {
  const response = await apiRequest<ApiEnvelope<SupportTicket>>('/support/tickets', {
    method: 'POST',
    body: data,
  });
  return response.data;
}
