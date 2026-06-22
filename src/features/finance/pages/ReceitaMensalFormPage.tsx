import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ReceiptText, Trash2 } from 'lucide-react';
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
import { createReceitaMensal, deleteReceitaMensal, getReceitaMensal, updateReceitaMensal } from '../api/financeApi';
import type { TipoReceita } from '../types';

const schema = z.object({
  descricao: z.string().min(1, 'Informe a descrição.'),
  valor: z.string().min(1, 'Informe o valor.').transform(parseCurrency),
  data_recebimento: z.string().min(1, 'Informe a data de recebimento.'),
  recorrente: z.boolean(),
  tipo_receita: z.enum(['salary', 'freelance', 'investment', 'other'], 'Selecione o tipo da receita.'),
  categoria_id: z.string().optional().nullable().transform((v) => (v ? Number(v) : null)),
  observacoes: z.string().optional().nullable(),
});

type ReceitaMensalFormValues = z.input<typeof schema>;
type ReceitaMensalFormData = z.output<typeof schema>;

const tipoReceitaOptions: { value: TipoReceita; label: string }[] = [
  { value: 'salary', label: 'Salário' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investimento' },
  { value: 'other', label: 'Outro' },
];

export function ReceitaMensalFormPage() {
  const [error, setError] = useState<unknown>(null);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const receitaMensalId = Number(params.id);
  const isEditing = params.id !== undefined && Number.isInteger(receitaMensalId);

  const receitaMensalQuery = useQuery({
    queryKey: queryKeys.finance.receitaMensal(isEditing ? receitaMensalId : 0),
    queryFn: () => getReceitaMensal(receitaMensalId),
    enabled: isEditing,
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ReceitaMensalFormValues, unknown, ReceitaMensalFormData>({
    defaultValues: {
      tipo_receita: 'salary',
      recorrente: true,
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isEditing || !receitaMensalQuery.data) return;

    reset({
      descricao: receitaMensalQuery.data.descricao,
      valor: receitaMensalQuery.data.valor ?? '',
      data_recebimento: receitaMensalQuery.data.data_recebimento?.slice(0, 10) ?? '',
      recorrente: receitaMensalQuery.data.recorrente,
      tipo_receita: receitaMensalQuery.data.tipo_receita,
      categoria_id: receitaMensalQuery.data.categoria_id ? String(receitaMensalQuery.data.categoria_id) : null,
      observacoes: receitaMensalQuery.data.observacoes ?? '',
    });
  }, [isEditing, receitaMensalQuery.data, reset]);

  async function onSubmit(data: ReceitaMensalFormData) {
    setError(null);
    try {
      if (isEditing) {
        await updateReceitaMensal(receitaMensalId, data);
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.receitaMensal(receitaMensalId) });
      } else {
        await createReceitaMensal(data);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.receitasMensais });
      navigate('/financas/receitas-mensais');
    } catch (err) {
      setError(err);
    }
  }

  async function handleDelete() {
    if (!isEditing) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteReceitaMensal(receitaMensalId);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.receitasMensais });
      queryClient.removeQueries({ queryKey: queryKeys.finance.receitaMensal(receitaMensalId) });
      navigate('/financas/receitas-mensais');
    } catch (err) {
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title={isEditing ? 'Editar receita mensal' : 'Nova receita mensal'}
        description={isEditing ? 'Atualize os dados da receita mensal.' : 'Cadastre um recebimento mensal como salário, freelance, investimento, etc.'}
      />
      {receitaMensalQuery.isLoading ? <Skeleton lines={4} /> : null}
      {receitaMensalQuery.error ? <Alert error={receitaMensalQuery.error} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteError ? <Alert error={deleteError} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Tipo de receita</span>
          <select {...register('tipo_receita')}>
            {tipoReceitaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.tipo_receita ? <small>{errors.tipo_receita.message}</small> : null}
        </label>
        <label className="field">
          <span>Descrição</span>
          <input autoComplete="off" type="text" {...register('descricao')} />
          {errors.descricao ? <small>{errors.descricao.message}</small> : null}
        </label>
        <label className="field">
          <span>Valor</span>
          <input autoComplete="off" inputMode="decimal" type="text" {...register('valor')} />
          {errors.valor ? <small>{errors.valor.message}</small> : null}
        </label>
        <label className="field">
          <span>Data de recebimento</span>
          <input autoComplete="off" type="date" {...register('data_recebimento')} />
          {errors.data_recebimento ? <small>{errors.data_recebimento.message}</small> : null}
        </label>
        <label className="field field--checkbox">
          <input
            type="checkbox"
            {...register('recorrente')}
          />
          <span>Recorrente</span>
        </label>
        <label className="field">
          <span>Observações</span>
          <textarea rows={3} {...register('observacoes')} />
          {errors.observacoes ? <small>{errors.observacoes.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<ReceiptText size={18} />} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar receita'}
        </Button>
        {isEditing ? (
          <ConfirmDialog
            confirmLabel="Excluir receita"
            description="Esta receita mensal será excluída. Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            title="Excluir receita mensal?"
            trigger={(
              <button
                className="button button--danger"
                disabled={isDeleting || isSubmitting}
                type="button"
              >
                <Trash2 size={18} aria-hidden="true" />
                <span>{isDeleting ? 'Excluindo...' : 'Excluir receita'}</span>
              </button>
            )}
            variant="danger"
          />
        ) : null}
      </form>
    </section>
  );
}
