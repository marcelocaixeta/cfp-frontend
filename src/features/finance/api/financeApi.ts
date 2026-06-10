import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type { CreditCard, CreditCardDebt, FinanceSummary, Loan } from '../types';

export async function getFinanceSummary() {
  const response = await apiRequest<ApiEnvelope<FinanceSummary>>('/finance/summary');
  return response.data;
}

export async function getCreditCards() {
  const response = await apiRequest<PaginatedEnvelope<CreditCard>>('/finance/credit-cards');
  return response.data;
}

export async function getCreditCardDebts() {
  const response = await apiRequest<PaginatedEnvelope<CreditCardDebt>>('/finance/credit-card-debts');
  return response.data;
}

export async function getLoans() {
  const response = await apiRequest<PaginatedEnvelope<Loan>>('/finance/loans');
  return response.data;
}

export async function createLoan(data: {
  credor_nome: string;
  descricao?: string;
  valor_principal: string;
  quantidade_parcelas: number;
  valor_parcela: string;
  primeira_data_vencimento: string;
}) {
  const response = await apiRequest<ApiEnvelope<Loan>>('/finance/loans', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function createCreditCard(data: {
  nome: string;
  bandeira?: string;
  ultimos_quatro_digitos?: string;
  limite_valor?: string;
  dia_fechamento?: number | null;
  dia_vencimento?: number | null;
}) {
  const response = await apiRequest<ApiEnvelope<CreditCard>>('/finance/credit-cards', {
    method: 'POST',
    body: data,
  });
  return response.data;
}
