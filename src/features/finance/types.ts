export type FinanceSummary = {
  dividas_cartao_credito: {
    total_pendente: string;
    total_vencido: string;
    count: number;
  };
  emprestimos: {
    total_principal_ativo: string;
    total_parcelas_pendentes: string;
    total_parcelas_vencidas: string;
  };
};

export type CurrentWeekCreditCardDebtDueDate = {
  id: number;
  tipo: 'divida_cartao_credito';
  descricao: string;
  data_vencimento: string;
  valor: string;
  valor_total: string;
  parcela_atual: number;
  quantidade_parcelas: number;
  situacao: 'pending' | 'overdue';
  cartao_credito?: {
    id: number;
    nome: string;
  } | null;
};

export type CurrentWeekLoanInstallmentDueDate = {
  id: number;
  tipo: 'parcela_emprestimo';
  emprestimo_id: number;
  credor_nome: string;
  descricao?: string | null;
  data_vencimento: string;
  valor: string;
  numero_parcela: number;
  situacao: 'pending' | 'overdue';
};

export type CurrentWeekDueDates = {
  periodo: {
    inicio: string;
    fim: string;
  };
  dividas_cartao_credito: CurrentWeekCreditCardDebtDueDate[];
  parcelas_emprestimos: CurrentWeekLoanInstallmentDueDate[];
  totais: {
    dividas_cartao_credito: {
      count: number;
      valor: string;
    };
    parcelas_emprestimos: {
      count: number;
      valor: string;
    };
  };
};

export type CreditCard = {
  id: number;
  nome: string;
  bandeira?: string | null;
  ultimos_quatro_digitos?: string | null;
  limite_valor?: string | null;
  dia_fechamento?: number | null;
  dia_vencimento?: number | null;
  ativo: boolean;
};

export type CreditCardDebt = {
  id: number;
  descricao: string;
  valor_total: string;
  quantidade_parcelas: number;
  parcela_atual: number;
  valor_parcela: string;
  primeira_data_vencimento: string;
  situacao: 'pending' | 'paid' | 'overdue' | 'canceled';
  credit_card?: CreditCard | null;
};

export type HomeBillType = 'agua' | 'luz' | 'telefone';

export type HomeBill = {
  id: number;
  tipo: HomeBillType;
  fornecedor_nome?: string | null;
  descricao: string;
  valor: string;
  data_vencimento: string;
  situacao: 'pending' | 'paid' | 'overdue' | 'canceled';
};

export type Loan = {
  id: number;
  credor_nome: string;
  descricao?: string | null;
  valor_principal: string;
  quantidade_parcelas: number;
  valor_parcela: string;
  primeira_data_vencimento: string;
  situacao: 'active' | 'paid' | 'overdue' | 'canceled';
  installments_count?: number;
};
