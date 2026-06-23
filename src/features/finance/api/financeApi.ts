import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type {
  CreditCard,
  CreditCardDebt,
  FinanceDashboard,
  FinanceDueDates,
  FinanceSummary,
  HomeBill,
  HomeBillType,
  Loan,
  LoanInstallment,
  ReceitaMensal,
  TipoReceita,
} from '../types';

type HomeBillPayload = {
  tipo: HomeBillType;
  fornecedor_nome: string;
  descricao: string;
  valor: string;
  data_vencimento: string;
};

type LoanPayload = {
  credor_nome: string;
  descricao?: string;
  valor_principal: string;
  quantidade_parcelas: number;
  valor_parcela: string;
  primeira_data_vencimento: string;
};

type CreditCardPayload = {
  nome: string;
  bandeira?: string;
  ultimos_quatro_digitos?: string;
  limite_valor?: string;
  dia_fechamento?: number | null;
  dia_vencimento?: number | null;
};

type CreditCardDebtPayload = {
  cartao_credito_id: number;
  descricao: string;
  valor_total: string;
  quantidade_parcelas: number;
  valor_parcela: string;
  primeira_data_vencimento: string;
};

type ReceitaMensalPayload = {
  descricao: string;
  valor: string;
  data_recebimento: string;
  recorrente: boolean;
  tipo_receita: TipoReceita;
  categoria_id?: number | null;
  observacoes?: string | null;
};

type FinanceDueDatesResponse = Omit<FinanceDueDates, 'contas_casa' | 'totais'> & {
  contas_casa?: FinanceDueDates['contas_casa'];
  totais: Omit<FinanceDueDates['totais'], 'contas_casa'> & {
    contas_casa?: FinanceDueDates['totais']['contas_casa'];
  };
};

function normalizeFinanceDueDates(data: FinanceDueDatesResponse): FinanceDueDates {
  return {
    ...data,
    contas_casa: data.contas_casa ?? [],
    totais: {
      ...data.totais,
      contas_casa: data.totais.contas_casa ?? {
        count: 0,
        valor: '0',
      },
    },
  };
}

export async function getFinanceSummary(month?: string) {
  const query = month ? `?mes=${encodeURIComponent(month)}` : '';
  const response = await apiRequest<ApiEnvelope<FinanceSummary>>(`/finance/summary${query}`);
  return response.data;
}

export async function getFinanceDashboard(month?: string) {
  const query = month ? `?mes=${encodeURIComponent(month)}` : '';
  const response = await apiRequest<ApiEnvelope<FinanceDashboard>>(`/finance/dashboard${query}`);
  return response.data;
}

export async function getFinanceDueDates(month?: string) {
  const query = month ? `?mes=${encodeURIComponent(month)}` : '';
  const response = await apiRequest<ApiEnvelope<FinanceDueDatesResponse>>(`/finance/current-week-due-dates${query}`);
  return normalizeFinanceDueDates(response.data);
}

export async function getCreditCards() {
  const response = await apiRequest<PaginatedEnvelope<CreditCard>>('/finance/credit-cards');
  return response.data;
}

export async function getCreditCard(creditCardId: number) {
  const response = await apiRequest<ApiEnvelope<CreditCard>>(`/finance/credit-cards/${creditCardId}`);
  return response.data;
}

export async function getCreditCardDebts() {
  const response = await apiRequest<PaginatedEnvelope<CreditCardDebt>>('/finance/credit-card-debts');
  return response.data;
}

export async function getCreditCardDebt(creditCardDebtId: number) {
  const response = await apiRequest<ApiEnvelope<CreditCardDebt>>(`/finance/credit-card-debts/${creditCardDebtId}`);
  return response.data;
}

export async function markCreditCardDebtAsPaid(creditCardDebtId: number) {
  const response = await apiRequest<ApiEnvelope<CreditCardDebt>>(`/finance/credit-card-debts/${creditCardDebtId}`, {
    method: 'PATCH',
    body: {
      situacao: 'paid',
    },
  });
  return response.data;
}

export async function getHomeBills() {
  const response = await apiRequest<PaginatedEnvelope<HomeBill>>('/finance/home-bills');
  return response.data;
}

export async function getHomeBill(homeBillId: number) {
  const response = await apiRequest<ApiEnvelope<HomeBill>>(`/finance/home-bills/${homeBillId}`);
  return response.data;
}

export async function markHomeBillAsPaid(homeBillId: number) {
  const response = await apiRequest<ApiEnvelope<HomeBill>>(`/finance/home-bills/${homeBillId}`, {
    method: 'PATCH',
    body: {
      situacao: 'paid',
    },
  });
  return response.data;
}

export async function getLoans() {
  const response = await apiRequest<PaginatedEnvelope<Loan>>('/finance/loans');
  return response.data;
}

export async function getLoan(loanId: number) {
  const response = await apiRequest<ApiEnvelope<Loan>>(`/finance/loans/${loanId}`);
  return response.data;
}

export async function createLoan(data: LoanPayload) {
  const response = await apiRequest<ApiEnvelope<Loan>>('/finance/loans', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateLoan(loanId: number, data: LoanPayload) {
  const response = await apiRequest<ApiEnvelope<Loan>>(`/finance/loans/${loanId}`, {
    method: 'PATCH',
    body: data,
  });
  return response.data;
}

export async function deleteLoan(loanId: number) {
  await apiRequest<void>(`/finance/loans/${loanId}`, {
    method: 'DELETE',
  });
}

export async function markLoanInstallmentAsPaid(loanInstallmentId: number, data?: { pago_em?: string }) {
  const response = await apiRequest<ApiEnvelope<LoanInstallment>>(`/finance/loan-installments/${loanInstallmentId}/pay`, {
    method: 'PATCH',
    body: data ?? {},
  });
  return response.data;
}

export async function createCreditCard(data: CreditCardPayload) {
  const response = await apiRequest<ApiEnvelope<CreditCard>>('/finance/credit-cards', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateCreditCard(creditCardId: number, data: CreditCardPayload) {
  const response = await apiRequest<ApiEnvelope<CreditCard>>(`/finance/credit-cards/${creditCardId}`, {
    method: 'PATCH',
    body: data,
  });
  return response.data;
}

export async function deleteCreditCard(creditCardId: number) {
  await apiRequest<void>(`/finance/credit-cards/${creditCardId}`, {
    method: 'DELETE',
  });
}

export async function createCreditCardDebt(data: CreditCardDebtPayload) {
  const response = await apiRequest<ApiEnvelope<CreditCardDebt>>('/finance/credit-card-debts', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateCreditCardDebt(creditCardDebtId: number, data: CreditCardDebtPayload) {
  const response = await apiRequest<ApiEnvelope<CreditCardDebt>>(`/finance/credit-card-debts/${creditCardDebtId}`, {
    method: 'PATCH',
    body: data,
  });
  return response.data;
}

export async function deleteCreditCardDebt(creditCardDebtId: number) {
  await apiRequest<void>(`/finance/credit-card-debts/${creditCardDebtId}`, {
    method: 'DELETE',
  });
}

export async function createHomeBill(data: HomeBillPayload) {
  const response = await apiRequest<ApiEnvelope<HomeBill>>('/finance/home-bills', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateHomeBill(homeBillId: number, data: HomeBillPayload) {
  const response = await apiRequest<ApiEnvelope<HomeBill>>(`/finance/home-bills/${homeBillId}`, {
    method: 'PATCH',
    body: data,
  });
  return response.data;
}

export async function deleteHomeBill(homeBillId: number) {
  await apiRequest<void>(`/finance/home-bills/${homeBillId}`, {
    method: 'DELETE',
  });
}

export async function getReceitasMensais() {
  const response = await apiRequest<PaginatedEnvelope<ReceitaMensal>>('/finance/receitas-mensais');
  return response.data;
}

export async function getReceitaMensal(receitaMensalId: number) {
  const response = await apiRequest<ApiEnvelope<ReceitaMensal>>(`/finance/receitas-mensais/${receitaMensalId}`);
  return response.data;
}

export async function createReceitaMensal(data: ReceitaMensalPayload) {
  const response = await apiRequest<ApiEnvelope<ReceitaMensal>>('/finance/receitas-mensais', {
    method: 'POST',
    body: data,
  });
  return response.data;
}

export async function updateReceitaMensal(receitaMensalId: number, data: ReceitaMensalPayload) {
  const response = await apiRequest<ApiEnvelope<ReceitaMensal>>(`/finance/receitas-mensais/${receitaMensalId}`, {
    method: 'PATCH',
    body: data,
  });
  return response.data;
}

export async function deleteReceitaMensal(receitaMensalId: number) {
  await apiRequest<void>(`/finance/receitas-mensais/${receitaMensalId}`, {
    method: 'DELETE',
  });
}
