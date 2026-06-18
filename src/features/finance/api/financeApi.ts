import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type { CreditCard, CreditCardDebt, CurrentWeekDueDates, FinanceDashboard, FinanceSummary, HomeBill, HomeBillType, Loan, LoanInstallment, ReceitaMensal, TipoReceita } from '../types';

export async function getFinanceSummary() {
  const response = await apiRequest<ApiEnvelope<FinanceSummary>>('/finance/summary');
  return response.data;
}

export async function getFinanceDashboard(month?: string) {
  const query = month ? `?mes=${encodeURIComponent(month)}` : '';
  const response = await apiRequest<ApiEnvelope<FinanceDashboard>>(`/finance/dashboard${query}`);
  return response.data;
}

export async function getCurrentWeekDueDates() {
  const response = await apiRequest<ApiEnvelope<CurrentWeekDueDates>>('/finance/current-week-due-dates');
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

export async function getHomeBills() {
  const response = await apiRequest<PaginatedEnvelope<HomeBill>>('/finance/home-bills');
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

export async function markLoanInstallmentAsPaid(loanInstallmentId: number, data?: { pago_em?: string }) {
  const response = await apiRequest<ApiEnvelope<LoanInstallment>>(`/finance/loan-installments/${loanInstallmentId}/pay`, {
    method: 'PATCH',
    body: data ?? {},
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

export async function createCreditCardDebt(data: {
  credit_card_id: number;
  descricao: string;
  valor_total: string;
  quantidade_parcelas: number;
  valor_parcela: string;
  primeira_data_vencimento: string;
}) {
  const response = await apiRequest<ApiEnvelope<CreditCardDebt>>('/finance/credit-card-debts', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function createHomeBill(data: {
  tipo: HomeBillType;
  fornecedor_nome: string;
  descricao: string;
  valor: string;
  data_vencimento: string;
}) {
  const response = await apiRequest<ApiEnvelope<HomeBill>>('/finance/home-bills', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function getReceitasMensais() {
  const response = await apiRequest<PaginatedEnvelope<ReceitaMensal>>('/finance/receitas-mensais');
  return response.data;
}

export async function createReceitaMensal(data: {
  descricao: string;
  valor: string;
  data_recebimento: string;
  recorrente: boolean;
  tipo_receita: TipoReceita;
  categoria_id?: number | null;
  observacoes?: string | null;
}) {
  const response = await apiRequest<ApiEnvelope<ReceitaMensal>>('/finance/receitas-mensais', {
    method: 'POST',
    body: data,
  });
  return response.data;
}
