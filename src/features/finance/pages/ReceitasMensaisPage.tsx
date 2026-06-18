import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { getReceitasMensais } from '../api/financeApi';
import type { TipoReceita } from '../types';

const tipoReceitaLabels: Record<TipoReceita, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimento',
  other: 'Outro',
};

export function ReceitasMensaisPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.receitasMensais,
    queryFn: getReceitasMensais,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Salário e Ganhos Mensais"
        description="Acompanhe seus recebimentos mensais."
        action={<Link to="/financas/receitas-mensais/nova"><Button type="button">Nova receita</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((receita) => (
            <Card className="list-card" key={receita.id}>
              <div>
                <strong>{receita.descricao}</strong>
                <span>
                  {tipoReceitaLabels[receita.tipo_receita]} · {formatDate(receita.data_recebimento)}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(receita.valor)}</strong>
                <span>
                  {receita.recorrente ? <Badge tone="info">Recorrente</Badge> : <Badge tone="neutral">Eventual</Badge>}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhuma receita cadastrada"
          description="Cadastre seus ganhos mensais para acompanhar seus recebimentos."
        />
      ) : null}
    </section>
  );
}
