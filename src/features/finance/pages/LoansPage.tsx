import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { deleteLoan, getLoans } from '../api/financeApi';

export function LoansPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.loans,
    queryFn: getLoans,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.finance.loans }),
  });

  function handleDelete(loanId: number) {
    deleteMutation.mutate(loanId);
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Empréstimos"
        description="Contratos, parcelas e vencimentos."
        action={<Link to="/financas/emprestimos/novo"><Button icon={<Plus size={18} />} type="button">Novo empréstimo</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteMutation.error ? <Alert error={deleteMutation.error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((loan) => (
            <Card className="list-card loan-card" key={loan.id}>
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
              <div className="list-card__actions" aria-label={`Ações para ${loan.credor_nome}`} role="group">
                <Link
                  aria-label={`Editar ${loan.credor_nome}`}
                  className="icon-button action-button action-button--edit"
                  title={`Editar ${loan.credor_nome}`}
                  to={`/financas/emprestimos/${loan.id}`}
                >
                  <Pencil size={17} aria-hidden="true" />
                </Link>
                <ConfirmDialog
                  confirmLabel="Excluir empréstimo"
                  description={`O empréstimo de "${loan.credor_nome}" será excluído. Esta ação não pode ser desfeita.`}
                  onConfirm={() => handleDelete(loan.id)}
                  title="Excluir empréstimo?"
                  trigger={(
                    <button
                      aria-label={`Excluir ${loan.credor_nome}`}
                      className="icon-button action-button action-button--delete"
                      disabled={deleteMutation.isPending}
                      title={`Excluir ${loan.credor_nome}`}
                      type="button"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  )}
                  variant="danger"
                />
              </div>
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
