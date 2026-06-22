import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Droplets,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { deleteHomeBill, getHomeBills } from '../api/financeApi';
import type { HomeBillType } from '../types';

const billTypeLabels: Record<HomeBillType, string> = {
  agua: 'Água',
  luz: 'Luz',
  telefone: 'Telefone',
};

const billTypeIcons: Record<HomeBillType, LucideIcon> = {
  agua: Droplets,
  luz: Zap,
  telefone: Phone,
};

export function HomeBillsPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.homeBills,
    queryFn: getHomeBills,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteHomeBill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.finance.homeBills }),
  });

  function handleDelete(homeBillId: number) {
    deleteMutation.mutate(homeBillId);
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Contas de casa"
        description="Contas de água, luz e telefone."
        action={<Link to="/financas/contas-casa/nova"><Button icon={<Plus size={18} />} type="button">Nova conta</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteMutation.error ? <Alert error={deleteMutation.error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((bill) => {
            const BillTypeIcon = billTypeIcons[bill.tipo];
            const billName = bill.fornecedor_nome ?? bill.descricao;

            return (
              <Card className="list-card home-bill-card" key={bill.id}>
                <div>
                  <strong>{billName}</strong>
                  <span className="home-bill-card__meta">
                    <BillTypeIcon size={16} aria-hidden="true" />
                    {billTypeLabels[bill.tipo]} · vence {formatDate(bill.data_vencimento)}
                  </span>
                </div>
                <div>
                  <strong>{formatCurrency(bill.valor)}</strong>
                  <span>{bill.descricao}</span>
                </div>
                <StatusBadge status={bill.situacao} />
                <div className="list-card__actions" aria-label={`Ações para ${billName}`} role="group">
                  <Link
                    aria-label={`Editar ${billName}`}
                    className="icon-button action-button action-button--edit"
                    title={`Editar ${billName}`}
                    to={`/financas/contas-casa/${bill.id}`}
                  >
                    <Pencil size={17} aria-hidden="true" />
                  </Link>
                  <ConfirmDialog
                    confirmLabel="Excluir conta"
                    description={`A conta "${billName}" será excluída. Esta ação não pode ser desfeita.`}
                    onConfirm={() => handleDelete(bill.id)}
                    title="Excluir conta de casa?"
                    trigger={(
                      <button
                        aria-label={`Excluir ${billName}`}
                        className="icon-button action-button action-button--delete"
                        disabled={deleteMutation.isPending}
                        title={`Excluir ${billName}`}
                        type="button"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    )}
                    variant="danger"
                  />
                </div>
              </Card>
            );
          })}
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
