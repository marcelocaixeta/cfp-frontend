import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Receipt, Trash2 } from 'lucide-react';
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
import { createCreditCardDebt, deleteCreditCardDebt, getCreditCardDebt, getCreditCards, updateCreditCardDebt } from '../api/financeApi';

const schema = z.object({
  credit_card_id: z.number().positive('Selecione um cartão de crédito.'),
  descricao: z.string().min(1, 'Informe a descrição da dívida.'),
  valor_total: z.string().min(1, 'Informe o valor total.'),
  quantidade_parcelas: z.number().int().positive('Informe a quantidade de parcelas.'),
  valor_parcela: z.string().min(1, 'Informe o valor da parcela.'),
  primeira_data_vencimento: z.string().min(1, 'Informe a data do primeiro vencimento.'),
});

type CreditCardDebtFormData = z.infer<typeof schema>;

export function CreditCardDebtFormPage() {
  const [error, setError] = useState<unknown>(null);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const creditCardDebtId = Number(params.id);
  const isEditing = params.id !== undefined && Number.isInteger(creditCardDebtId);

  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: queryKeys.finance.creditCards,
    queryFn: getCreditCards,
  });
  const creditCardDebtQuery = useQuery({
    queryKey: queryKeys.finance.creditCardDebt(isEditing ? creditCardDebtId : 0),
    queryFn: () => getCreditCardDebt(creditCardDebtId),
    enabled: isEditing,
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreditCardDebtFormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isEditing || !creditCardDebtQuery.data) return;

    reset({
      credit_card_id:
        creditCardDebtQuery.data.cartao_credito_id ??
        creditCardDebtQuery.data.credit_card_id ??
        creditCardDebtQuery.data.cartao_credito?.id ??
        creditCardDebtQuery.data.credit_card?.id ??
        0,
      descricao: creditCardDebtQuery.data.descricao,
      valor_total: creditCardDebtQuery.data.valor_total ?? '',
      quantidade_parcelas: creditCardDebtQuery.data.quantidade_parcelas,
      valor_parcela: creditCardDebtQuery.data.valor_parcela ?? '',
      primeira_data_vencimento: creditCardDebtQuery.data.primeira_data_vencimento?.slice(0, 10) ?? '',
    });
  }, [creditCardDebtQuery.data, isEditing, reset]);

  function buildPayload(data: CreditCardDebtFormData) {
    return {
      cartao_credito_id: data.credit_card_id,
      descricao: data.descricao,
      valor_total: parseCurrency(data.valor_total),
      quantidade_parcelas: data.quantidade_parcelas,
      valor_parcela: parseCurrency(data.valor_parcela),
      primeira_data_vencimento: data.primeira_data_vencimento,
    };
  }

  async function onSubmit(data: CreditCardDebtFormData) {
    setError(null);
    try {
      if (isEditing) {
        await updateCreditCardDebt(creditCardDebtId, buildPayload(data));
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCardDebt(creditCardDebtId) });
      } else {
        await createCreditCardDebt(buildPayload(data));
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCardDebts });
      navigate('/financas/dividas-cartao');
    } catch (err) {
      setError(err);
    }
  }

  async function handleDelete() {
    if (!isEditing) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteCreditCardDebt(creditCardDebtId);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCardDebts });
      queryClient.removeQueries({ queryKey: queryKeys.finance.creditCardDebt(creditCardDebtId) });
      navigate('/financas/dividas-cartao');
    } catch (err) {
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title={isEditing ? 'Editar gasto do cartão' : 'Nova dívida'}
        description={isEditing ? 'Atualize os dados do gasto cadastrado no cartão.' : 'Cadastre uma compra parcelada ou dívida de cartão de crédito.'}
      />
      {creditCardDebtQuery.isLoading ? <Skeleton lines={4} /> : null}
      {creditCardDebtQuery.error ? <Alert error={creditCardDebtQuery.error} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteError ? <Alert error={deleteError} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Cartão de crédito</span>
          {cardsLoading ? (
            <Skeleton lines={1} />
          ) : (
            <select {...register('credit_card_id', { valueAsNumber: true })}>
              <option value="">Selecione um cartão</option>
              {cardsData?.data.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.nome}
                </option>
              ))}
            </select>
          )}
          {errors.credit_card_id ? <small>{errors.credit_card_id.message}</small> : null}
        </label>
        <label className="field">
          <span>Descrição</span>
          <input autoComplete="off" type="text" {...register('descricao')} />
          {errors.descricao ? <small>{errors.descricao.message}</small> : null}
        </label>
        <label className="field">
          <span>Valor total</span>
          <input autoComplete="off" inputMode="decimal" type="text" {...register('valor_total')} />
          {errors.valor_total ? <small>{errors.valor_total.message}</small> : null}
        </label>
        <label className="field">
          <span>Quantidade de parcelas</span>
          <input autoComplete="off" min="1" step="1" type="number" {...register('quantidade_parcelas', { valueAsNumber: true })} />
          {errors.quantidade_parcelas ? <small>{errors.quantidade_parcelas.message}</small> : null}
        </label>
        <label className="field">
          <span>Valor da parcela</span>
          <input autoComplete="off" inputMode="decimal" type="text" {...register('valor_parcela')} />
          {errors.valor_parcela ? <small>{errors.valor_parcela.message}</small> : null}
        </label>
        <label className="field">
          <span>Primeiro vencimento</span>
          <input autoComplete="off" type="date" {...register('primeira_data_vencimento')} />
          {errors.primeira_data_vencimento ? <small>{errors.primeira_data_vencimento.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<Receipt size={18} />} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar dívida'}
        </Button>
        {isEditing ? (
          <ConfirmDialog
            confirmLabel="Excluir gasto"
            description="Este gasto do cartão será excluído. Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            title="Excluir gasto do cartão?"
            trigger={(
              <button
                className="button button--danger"
                disabled={isDeleting || isSubmitting}
                type="button"
              >
                <Trash2 size={18} aria-hidden="true" />
                <span>{isDeleting ? 'Excluindo...' : 'Excluir gasto'}</span>
              </button>
            )}
            variant="danger"
          />
        ) : null}
      </form>
    </section>
  );
}
