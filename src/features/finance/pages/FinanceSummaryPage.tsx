import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { getFinanceSummary } from '../api/financeApi';

export function FinanceSummaryPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.summary,
    queryFn: getFinanceSummary,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Resumo financeiro"
        description="Acompanhe dívidas de cartão, contas de casa, empréstimos e parcelas pendentes."
        action={<span className="sync-pill">Atualizado pela API</span>}
      />
      {isLoading ? <Skeleton lines={6} /> : null}
      {error ? <Alert error={error} /> : null}
      {data ? (
        <>
          <div className="kpi-grid">
            <Card>
              <span className="kpi-label">Dívidas pendentes</span>
              <strong className="kpi-value">{formatCurrency(data.dividas_cartao_credito.total_pendente)}</strong>
              <span className="kpi-caption">{data.dividas_cartao_credito.count} registros</span>
            </Card>
            <Card>
              <span className="kpi-label">Dívidas vencidas</span>
              <strong className="kpi-value">{formatCurrency(data.dividas_cartao_credito.total_vencido)}</strong>
              <span className="kpi-caption">Cartões de crédito</span>
            </Card>
            <Card>
              <span className="kpi-label">Empréstimos ativos</span>
              <strong className="kpi-value">{formatCurrency(data.emprestimos.total_principal_ativo)}</strong>
              <span className="kpi-caption">Valor principal</span>
            </Card>
            <Card>
              <span className="kpi-label">Parcelas pendentes</span>
              <strong className="kpi-value">{formatCurrency(data.emprestimos.total_parcelas_pendentes)}</strong>
              <span className="kpi-caption">Em aberto</span>
            </Card>
          </div>
          <div className="quick-actions">
            <Link to="/financas/cartoes">Ver cartões</Link>
            <Link to="/financas/dividas-cartao">Ver dívidas</Link>
            <Link to="/financas/contas-casa">Ver contas de casa</Link>
            <Link to="/financas/emprestimos">Ver empréstimos</Link>
          </div>
        </>
      ) : null}
    </section>
  );
}
