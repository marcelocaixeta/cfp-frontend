import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCardIcon, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { z } from 'zod';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { parseCurrency } from '../../../lib/formatting/currency';
import { createCreditCard, deleteCreditCard, getCreditCard, getCreditCardDebts, updateCreditCard } from '../api/financeApi';
import type { CreditCardDebt } from '../types';

const schema = z.object({
  nome: z.string().min(1, 'Informe um nome para o cartão.'),
  bandeira: z.string().optional(),
  ultimos_quatro_digitos: z.string().optional(),
  limite_valor: z.string().optional(),
  dia_fechamento: z.string().optional(),
  dia_vencimento: z.string().optional(),
});

type CreditCardFormData = z.infer<typeof schema>;

function getDebtCreditCardId(debt: CreditCardDebt) {
  return debt.cartao_credito_id ?? debt.credit_card_id ?? debt.credit_card?.id ?? debt.cartao_credito?.id ?? null;
}

export function CreditCardFormPage() {
  const [error, setError] = useState<unknown>(null);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [deleteBlockMessage, setDeleteBlockMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const creditCardId = Number(params.id);
  const isEditing = params.id !== undefined && Number.isInteger(creditCardId);

  const creditCardQuery = useQuery({
    queryKey: queryKeys.finance.creditCard(isEditing ? creditCardId : 0),
    queryFn: () => getCreditCard(creditCardId),
    enabled: isEditing,
  });
  const debtsQuery = useQuery({
    queryKey: queryKeys.finance.creditCardDebts,
    queryFn: getCreditCardDebts,
    enabled: isEditing,
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreditCardFormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isEditing || !creditCardQuery.data) return;

    reset({
      nome: creditCardQuery.data.nome,
      bandeira: creditCardQuery.data.bandeira ?? '',
      ultimos_quatro_digitos: creditCardQuery.data.ultimos_quatro_digitos ?? '',
      limite_valor: creditCardQuery.data.limite_valor ?? '',
      dia_fechamento: creditCardQuery.data.dia_fechamento ? String(creditCardQuery.data.dia_fechamento) : '',
      dia_vencimento: creditCardQuery.data.dia_vencimento ? String(creditCardQuery.data.dia_vencimento) : '',
    });
  }, [creditCardQuery.data, isEditing, reset]);

  function buildPayload(data: CreditCardFormData) {
    return {
      nome: data.nome,
      bandeira: data.bandeira || undefined,
      ultimos_quatro_digitos: data.ultimos_quatro_digitos || undefined,
      limite_valor: data.limite_valor ? parseCurrency(data.limite_valor) : undefined,
      dia_fechamento: data.dia_fechamento ? Number(data.dia_fechamento) : null,
      dia_vencimento: data.dia_vencimento ? Number(data.dia_vencimento) : null,
    };
  }

  function getLinkedDebtsCount() {
    return debtsQuery.data?.data.filter((debt) => getDebtCreditCardId(debt) === creditCardId).length ?? 0;
  }

  async function onSubmit(data: CreditCardFormData) {
    setError(null);
    try {
      if (isEditing) {
        await updateCreditCard(creditCardId, buildPayload(data));
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCard(creditCardId) });
      } else {
        await createCreditCard(buildPayload(data));
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCards });
      navigate('/financas/cartoes');
    } catch (err) {
      setError(err);
    }
  }

  function showDeleteBlockMessage() {
    if (!isEditing) return;

    setDeleteError(null);
    setDeleteBlockMessage(null);

    if (!debtsQuery.data) {
      setDeleteBlockMessage('Não foi possível verificar se este cartão possui gastos cadastrados. Tente novamente em instantes.');
      return;
    }

    const linkedDebtsCount = getLinkedDebtsCount();
    if (linkedDebtsCount > 0) {
      setDeleteBlockMessage(
        `Este cartão possui ${linkedDebtsCount} gasto(s) cadastrado(s). Exclua primeiro a despesa vinculada ao cartão para depois excluir o cartão.`,
      );
      return;
    }
  }

  async function handleDelete() {
    if (!isEditing) return;
    setIsDeleting(true);
    try {
      await deleteCreditCard(creditCardId);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCards });
      queryClient.removeQueries({ queryKey: queryKeys.finance.creditCard(creditCardId) });
      navigate('/financas/cartoes');
    } catch (err) {
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  const linkedDebtsCount = isEditing ? getLinkedDebtsCount() : 0;
  const canDelete = isEditing && Boolean(debtsQuery.data) && linkedDebtsCount === 0;

  return (
    <section className="page-stack">
      <PageHeader
        title={isEditing ? 'Editar cartão' : 'Novo cartão'}
        description={isEditing ? 'Atualize os dados do cartão de crédito.' : 'Cadastre um cartão de crédito para organizar limites e vencimentos.'}
      />
      {creditCardQuery.isLoading ? <Skeleton lines={4} /> : null}
      {creditCardQuery.error ? <Alert error={creditCardQuery.error} /> : null}
      {debtsQuery.error ? <Alert error={debtsQuery.error} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteError ? <Alert error={deleteError} /> : null}
      {deleteBlockMessage ? <Alert title="Cartão com gastos cadastrados" message={deleteBlockMessage} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Nome</span>
          <input autoComplete="off" type="text" {...register('nome')} />
          {errors.nome ? <small>{errors.nome.message}</small> : null}
        </label>
        <label className="field">
          <span>Bandeira</span>
          <input autoComplete="off" placeholder="Visa, Mastercard, etc." type="text" {...register('bandeira')} />
          {errors.bandeira ? <small>{errors.bandeira.message}</small> : null}
        </label>
        <label className="field">
          <span>Últimos 4 dígitos</span>
          <input autoComplete="off" maxLength={4} placeholder="0000" type="text" {...register('ultimos_quatro_digitos')} />
          {errors.ultimos_quatro_digitos ? <small>{errors.ultimos_quatro_digitos.message}</small> : null}
        </label>
        <label className="field">
          <span>Limite</span>
          <input autoComplete="off" inputMode="decimal" type="text" {...register('limite_valor')} />
          {errors.limite_valor ? <small>{errors.limite_valor.message}</small> : null}
        </label>
        <label className="field">
          <span>Dia de fechamento</span>
          <input autoComplete="off" max={31} min={1} placeholder="1 a 31" type="number" {...register('dia_fechamento')} />
          {errors.dia_fechamento ? <small>{errors.dia_fechamento.message}</small> : null}
        </label>
        <label className="field">
          <span>Dia de vencimento</span>
          <input autoComplete="off" max={31} min={1} placeholder="1 a 31" type="number" {...register('dia_vencimento')} />
          {errors.dia_vencimento ? <small>{errors.dia_vencimento.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<CreditCardIcon size={18} />} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar cartão'}
        </Button>
        {isEditing ? (
          canDelete ? (
            <ConfirmDialog
              confirmLabel="Excluir cartão"
              description="Este cartão será excluído. Esta ação não pode ser desfeita."
              onConfirm={handleDelete}
              title="Excluir cartão?"
              trigger={(
                <button
                  className="button button--danger"
                  disabled={isDeleting || isSubmitting || debtsQuery.isLoading}
                  type="button"
                >
                  <Trash2 size={18} aria-hidden="true" />
                  <span>{isDeleting ? 'Excluindo...' : 'Excluir cartão'}</span>
                </button>
              )}
              variant="danger"
            />
          ) : (
            <Button
              disabled={isDeleting || isSubmitting || debtsQuery.isLoading}
              icon={<Trash2 size={18} />}
              onClick={showDeleteBlockMessage}
              type="button"
              variant="danger"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir cartão'}
            </Button>
          )
        ) : null}
      </form>
    </section>
  );
}
