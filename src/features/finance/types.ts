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
