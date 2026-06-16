import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { getLoans } from '../api/financeApi';

export function LoansPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.loans,
    queryFn: getLoans,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Empréstimos"
        description="Contratos, parcelas e vencimentos."
        action={<Link to="/financas/emprestimos/novo"><Button type="button">Novo empréstimo</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((loan) => (
            <Card className="list-card" key={loan.id}>
              <div>
                <strong>{loan.credor_nome}</strong>
                <span>{loan.descricao ?? `Primeiro vencimento ${formatDate(loan.primeira_data_vencimento)}`}</span>
              </div>
              <div>
                <strong>{formatCurrency(loan.valor_principal)}</strong>
                <span>
                  {loan.quantidade_parcelas}x de {formatCurrency(loan.valor_parcela)}
                </span>
              </div>
              <StatusBadge status={loan.situacao} />
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhum empréstimo cadastrado"
          description="Crie um empréstimo para acompanhar parcelas e vencimentos."
        />
      ) : null}
    </section>
  );
}
