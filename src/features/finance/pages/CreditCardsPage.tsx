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
import { getCreditCards } from '../api/financeApi';

export function CreditCardsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.creditCards,
    queryFn: getCreditCards,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Cartões"
        description="Cartões de crédito usados para organizar limites, vencimentos e dívidas."
        action={<Link to="/financas/cartoes/novo"><Button type="button">Novo cartão</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((card) => (
            <Card className="list-card" key={card.id}>
              <div>
                <strong>{card.nome}</strong>
                <span>
                  {card.bandeira ?? 'Cartão'} {card.ultimos_quatro_digitos ? `final ${card.ultimos_quatro_digitos}` : ''}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(card.limite_valor)}</strong>
                <span>
                  Fecha dia {card.dia_fechamento ?? '-'} · vence dia {card.dia_vencimento ?? '-'}
                </span>
              </div>
              <StatusBadge status={card.ativo ? 'active' : 'canceled'} />
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhum cartão cadastrado"
          description="Cadastre cartões para vincular dívidas e acompanhar vencimentos."
        />
      ) : null}
    </section>
  );
}
