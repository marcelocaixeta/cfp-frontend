import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, Trash2 } from 'lucide-react';
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
import { createLoan, deleteLoan, getLoan, updateLoan } from '../api/financeApi';

const schema = z.object({
  credor_nome: z.string().min(1, 'Informe o nome do credor.'),
  descricao: z.string().optional(),
  valor_principal: z.string().min(1, 'Informe o valor principal.').transform(parseCurrency),
  quantidade_parcelas: z.number().int().positive('Informe a quantidade de parcelas.'),
  valor_parcela: z.string().min(1, 'Informe o valor da parcela.').transform(parseCurrency),
  primeira_data_vencimento: z.string().min(1, 'Informe a data do primeiro vencimento.'),
});

type LoanFormData = z.infer<typeof schema>;

export function LoanFormPage() {
  const [error, setError] = useState<unknown>(null);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const loanId = Number(params.id);
  const isEditing = params.id !== undefined && Number.isInteger(loanId);

  const loanQuery = useQuery({
    queryKey: queryKeys.finance.loan(isEditing ? loanId : 0),
    queryFn: () => getLoan(loanId),
    enabled: isEditing,
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<LoanFormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isEditing || !loanQuery.data) return;

    reset({
      credor_nome: loanQuery.data.credor_nome,
      descricao: loanQuery.data.descricao ?? '',
      valor_principal: loanQuery.data.valor_principal ?? '',
      quantidade_parcelas: loanQuery.data.quantidade_parcelas,
      valor_parcela: loanQuery.data.valor_parcela ?? '',
      primeira_data_vencimento: loanQuery.data.primeira_data_vencimento?.slice(0, 10) ?? '',
    });
  }, [isEditing, loanQuery.data, reset]);

  async function onSubmit(data: LoanFormData) {
    setError(null);
    try {
      if (isEditing) {
        await updateLoan(loanId, data);
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.loan(loanId) });
      } else {
        await createLoan(data);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.loans });
      navigate('/financas/emprestimos');
    } catch (err) {
      setError(err);
    }
  }

  async function handleDelete() {
    if (!isEditing) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteLoan(loanId);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.loans });
      queryClient.removeQueries({ queryKey: queryKeys.finance.loan(loanId) });
      navigate('/financas/emprestimos');
    } catch (err) {
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title={isEditing ? 'Editar empréstimo' : 'Novo empréstimo'}
        description={isEditing ? 'Atualize os dados do contrato.' : 'Cadastre um contrato de empréstimo para acompanhar parcelas e vencimentos.'}
      />
      {loanQuery.isLoading ? <Skeleton lines={4} /> : null}
      {loanQuery.error ? <Alert error={loanQuery.error} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteError ? <Alert error={deleteError} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Credor</span>
          <input autoComplete="off" type="text" {...register('credor_nome')} />
          {errors.credor_nome ? <small>{errors.credor_nome.message}</small> : null}
        </label>
        <label className="field">
          <span>Descrição</span>
          <input autoComplete="off" type="text" {...register('descricao')} />
          {errors.descricao ? <small>{errors.descricao.message}</small> : null}
        </label>
        <label className="field">
          <span>Valor principal</span>
          <input autoComplete="off" inputMode="decimal" type="text" {...register('valor_principal')} />
          {errors.valor_principal ? <small>{errors.valor_principal.message}</small> : null}
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
        <Button disabled={isSubmitting} icon={<Banknote size={18} />} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar empréstimo'}
        </Button>
        {isEditing ? (
          <ConfirmDialog
            confirmLabel="Excluir empréstimo"
            description="Este empréstimo será excluído. Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            title="Excluir empréstimo?"
            trigger={(
              <button
                className="button button--danger"
                disabled={isDeleting || isSubmitting}
                type="button"
              >
                <Trash2 size={18} aria-hidden="true" />
                <span>{isDeleting ? 'Excluindo...' : 'Excluir empréstimo'}</span>
              </button>
            )}
            variant="danger"
          />
        ) : null}
      </form>
    </section>
  );
}
