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
import { getHomeBills } from '../api/financeApi';
import type { HomeBillType } from '../types';

const billTypeLabels: Record<HomeBillType, string> = {
  agua: 'Água',
  luz: 'Luz',
  telefone: 'Telefone',
};

export function HomeBillsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.homeBills,
    queryFn: getHomeBills,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Contas de casa"
        description="Contas de água, luz e telefone."
        action={<Link to="/financas/contas-casa/nova"><Button type="button">Nova conta</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((bill) => (
            <Card className="list-card" key={bill.id}>
              <div>
                <strong>{bill.fornecedor_nome ?? bill.descricao}</strong>
                <span>
                  {billTypeLabels[bill.tipo]} · vence {formatDate(bill.data_vencimento)}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(bill.valor)}</strong>
                <span>{bill.descricao}</span>
              </div>
              <StatusBadge status={bill.situacao} />
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhuma conta cadastrada"
          description="Cadastre contas de água, luz e telefone para acompanhar vencimentos."
        />
      ) : null}
    </section>
  );
}
