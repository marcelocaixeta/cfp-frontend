import { apiRequest } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type { SupportTicket } from '../types';

export async function getSupportTickets() {
  const response = await apiRequest<PaginatedEnvelope<SupportTicket>>('/support/tickets');
  return response.data;
}
