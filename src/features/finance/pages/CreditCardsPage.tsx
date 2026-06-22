import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { IconButton } from '../../../components/ui/IconButton';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { deleteCreditCard, getCreditCardDebts, getCreditCards } from '../api/financeApi';
import type { CreditCardDebt } from '../types';

function getDebtCreditCardId(debt: CreditCardDebt) {
  return debt.cartao_credito_id ?? debt.credit_card_id ?? debt.credit_card?.id ?? debt.cartao_credito?.id ?? null;
}

export function CreditCardsPage() {
  const queryClient = useQueryClient();
  const [deleteBlockMessage, setDeleteBlockMessage] = useState<string | null>(null);
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.creditCards,
    queryFn: getCreditCards,
  });
  const debtsQuery = useQuery({
    queryKey: queryKeys.finance.creditCardDebts,
    queryFn: getCreditCardDebts,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCreditCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCards }),
  });

  function getLinkedDebtsCount(creditCardId: number) {
    return debtsQuery.data?.data.filter((debt) => getDebtCreditCardId(debt) === creditCardId).length ?? 0;
  }

  function showDeleteBlockMessage(creditCardId: number, creditCardName: string) {
    setDeleteBlockMessage(null);

    if (!debtsQuery.data) {
      setDeleteBlockMessage('Não foi possível verificar se este cartão possui gastos cadastrados. Tente novamente em instantes.');
      return;
    }

    const linkedDebtsCount = getLinkedDebtsCount(creditCardId);
    if (linkedDebtsCount > 0) {
      setDeleteBlockMessage(
        `O cartão "${creditCardName}" possui ${linkedDebtsCount} gasto(s) cadastrado(s). Exclua primeiro a despesa vinculada ao cartão para depois excluir o cartão.`,
      );
      return;
    }
  }

  function handleDelete(creditCardId: number) {
    deleteMutation.mutate(creditCardId);
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Cartões"
        description="Cartões de crédito usados para organizar limites, vencimentos e dívidas."
        action={<Link to="/financas/cartoes/novo"><Button icon={<Plus size={18} />} type="button">Novo cartão</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {debtsQuery.error ? <Alert error={debtsQuery.error} /> : null}
      {deleteMutation.error ? <Alert error={deleteMutation.error} /> : null}
      {deleteBlockMessage ? <Alert title="Cartão com gastos cadastrados" message={deleteBlockMessage} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((card) => {
            const linkedDebtsCount = getLinkedDebtsCount(card.id);
            const canDelete = Boolean(debtsQuery.data) && linkedDebtsCount === 0;
            const deleteLabel = linkedDebtsCount > 0
              ? `Excluir ${card.nome} bloqueado: há gastos cadastrados`
              : `Excluir ${card.nome}`;
            const deleteButton = (
              <button
                aria-label={deleteLabel}
                className="icon-button action-button action-button--delete"
                disabled={deleteMutation.isPending || debtsQuery.isLoading}
                title={deleteLabel}
                type="button"
              >
                <Trash2 size={17} aria-hidden="true" />
              </button>
            );

            return (
              <Card className="list-card credit-card-card" key={card.id}>
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
                <div className="list-card__actions" aria-label={`Ações para ${card.nome}`} role="group">
                  <Link
                    aria-label={`Editar ${card.nome}`}
                    className="icon-button action-button action-button--edit"
                    title={`Editar ${card.nome}`}
                    to={`/financas/cartoes/${card.id}`}
                  >
                    <Pencil size={17} aria-hidden="true" />
                  </Link>
                  {canDelete ? (
                    <ConfirmDialog
                      confirmLabel="Excluir cartão"
                      description={`O cartão "${card.nome}" será excluído. Esta ação não pode ser desfeita.`}
                      onConfirm={() => handleDelete(card.id)}
                      title="Excluir cartão?"
                      trigger={deleteButton}
                      variant="danger"
                    />
                  ) : (
                    <IconButton
                      className="action-button action-button--delete"
                      disabled={deleteMutation.isPending || debtsQuery.isLoading}
                      label={deleteLabel}
                      onClick={() => showDeleteBlockMessage(card.id, card.nome)}
                      type="button"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </IconButton>
                  )}
                </div>
              </Card>
            );
          })}
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
