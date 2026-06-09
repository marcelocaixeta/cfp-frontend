import { useQuery } from '@tanstack/react-query';
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
import { getCreditCardDebts } from '../api/financeApi';

export function CreditCardDebtsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.creditCardDebts,
    queryFn: getCreditCardDebts,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Dívidas de cartão"
        description="Compras parceladas, valores pendentes e vencimentos por usuário."
        action={<Button type="button">Nova dívida</Button>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((debt) => (
            <Card className="list-card" key={debt.id}>
              <div>
                <strong>{debt.descricao}</strong>
                <span>
                  Parcela {debt.parcela_atual}/{debt.quantidade_parcelas} · vence {formatDate(debt.primeira_data_vencimento)}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(debt.valor_total)}</strong>
                <span>{formatCurrency(debt.valor_parcela)} por parcela</span>
              </div>
              <StatusBadge status={debt.situacao} />
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhuma dívida cadastrada"
          description="As dívidas de cartão aparecerão aqui quando forem criadas."
        />
      ) : null}
    </section>
  );
}
