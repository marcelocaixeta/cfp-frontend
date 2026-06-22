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
import { deleteCreditCardDebt, getCreditCardDebts } from '../api/financeApi';
import type { CreditCardDebt } from '../types';

function formatCreditCardLabel(debt: CreditCardDebt) {
  const card = debt.credit_card ?? debt.cartao_credito;

  if (!card) {
    return 'Cartão';
  }

  const brand = card.bandeira ?? card.nome;
  const lastDigits = card.ultimos_quatro_digitos ? ` final ${card.ultimos_quatro_digitos}` : '';

  return `${brand}${lastDigits}`;
}

export function CreditCardDebtsPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.creditCardDebts,
    queryFn: getCreditCardDebts,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCreditCardDebt,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCardDebts }),
  });

  function handleDelete(creditCardDebtId: number) {
    deleteMutation.mutate(creditCardDebtId);
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Dívidas de cartão"
        description="Compras parceladas, valores pendentes e vencimentos por usuário."
        action={<Link to="/financas/dividas-cartao/nova"><Button icon={<Plus size={18} />} type="button">Novo Gasto com o Cartão</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteMutation.error ? <Alert error={deleteMutation.error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((debt) => (
            <Card className="list-card credit-card-debt-card" key={debt.id}>
              <div>
                <strong>{debt.descricao}</strong>
                <span>
                  Parcela {debt.parcela_atual}/{debt.quantidade_parcelas} · {formatCreditCardLabel(debt)} · vence{' '}
                  {formatDate(debt.primeira_data_vencimento)}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(debt.valor_total)}</strong>
                <span>{formatCurrency(debt.valor_parcela)} por parcela</span>
              </div>
              <StatusBadge status={debt.situacao} />
              <div className="list-card__actions" aria-label={`Ações para ${debt.descricao}`} role="group">
                <Link
                  aria-label={`Editar ${debt.descricao}`}
                  className="icon-button action-button action-button--edit"
                  title={`Editar ${debt.descricao}`}
                  to={`/financas/dividas-cartao/${debt.id}`}
                >
                  <Pencil size={17} aria-hidden="true" />
                </Link>
                <ConfirmDialog
                  confirmLabel="Excluir gasto"
                  description={`O gasto "${debt.descricao}" será excluído. Esta ação não pode ser desfeita.`}
                  onConfirm={() => handleDelete(debt.id)}
                  title="Excluir gasto do cartão?"
                  trigger={(
                    <button
                      aria-label={`Excluir ${debt.descricao}`}
                      className="icon-button action-button action-button--delete"
                      disabled={deleteMutation.isPending}
                      title={`Excluir ${debt.descricao}`}
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
          title="Nenhuma dívida cadastrada"
          description="As dívidas de cartão aparecerão aqui quando forem criadas."
        />
      ) : null}
    </section>
  );
}
