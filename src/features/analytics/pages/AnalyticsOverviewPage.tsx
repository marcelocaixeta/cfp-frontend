import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { getAnalyticsOverview } from '../api/analyticsApi';

export function AnalyticsOverviewPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: getAnalyticsOverview,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Análises"
        description="Indicadores rápidos sobre finanças, BTC e suporte."
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data ? (
        <div className="kpi-grid">
          <Card>
            <span className="kpi-label">Dívidas de cartão</span>
            <strong className="kpi-value">{data.quantidade_dividas_cartao_credito}</strong>
            <span className="kpi-caption">Registros cadastrados</span>
          </Card>
          <Card>
            <span className="kpi-label">Empréstimos ativos</span>
            <strong className="kpi-value">{data.quantidade_emprestimos_ativos}</strong>
            <span className="kpi-caption">Contratos em andamento</span>
          </Card>
          <Card>
            <span className="kpi-label">Ativos BTC</span>
            <strong className="kpi-value">{data.quantidade_ativos_btc}</strong>
            <span className="kpi-caption">Itens acompanhados</span>
          </Card>
          <Card>
            <span className="kpi-label">Chamados abertos</span>
            <strong className="kpi-value">{data.quantidade_chamados_suporte_abertos}</strong>
            <span className="kpi-caption">Pendências de suporte</span>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
