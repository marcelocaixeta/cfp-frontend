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
