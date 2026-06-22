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
import { createHomeBill, deleteHomeBill, getHomeBill, updateHomeBill } from '../api/financeApi';

const schema = z.object({
  tipo: z.enum(['agua', 'luz', 'telefone'], 'Selecione o tipo da conta.'),
  fornecedor_nome: z.string().min(1, 'Informe o fornecedor.'),
  descricao: z.string().min(1, 'Informe a descrição.'),
  valor: z.string().min(1, 'Informe o valor.').transform(parseCurrency),
  data_vencimento: z.string().min(1, 'Informe a data de vencimento.'),
});

type HomeBillFormData = z.infer<typeof schema>;

export function HomeBillFormPage() {
  const [error, setError] = useState<unknown>(null);
  const [deleteError, setDeleteError] = useState<unknown>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const homeBillId = Number(params.id);
  const isEditing = params.id !== undefined && Number.isInteger(homeBillId);

  const homeBillQuery = useQuery({
    queryKey: queryKeys.finance.homeBill(isEditing ? homeBillId : 0),
    queryFn: () => getHomeBill(homeBillId as number),
    enabled: isEditing,
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<HomeBillFormData>({
    defaultValues: {
      tipo: 'agua',
    },
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!isEditing || !homeBillQuery.data) return;

    reset({
      tipo: homeBillQuery.data.tipo,
      fornecedor_nome: homeBillQuery.data.fornecedor_nome ?? '',
      descricao: homeBillQuery.data.descricao ?? '',
      valor: homeBillQuery.data.valor ?? '',
      data_vencimento: homeBillQuery.data.data_vencimento?.slice(0, 10) ?? '',
    });
  }, [homeBillQuery.data, isEditing, reset]);

  async function onSubmit(data: HomeBillFormData) {
    setError(null);
    try {
      if (isEditing) {
        await updateHomeBill(homeBillId, data);
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.homeBill(homeBillId) });
      } else {
        await createHomeBill(data);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.homeBills });
      navigate('/financas/contas-casa');
    } catch (err) {
      setError(err);
    }
  }

  async function handleDelete() {
    if (!isEditing) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteHomeBill(homeBillId);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.homeBills });
      queryClient.removeQueries({ queryKey: queryKeys.finance.homeBill(homeBillId) });
      navigate('/financas/contas-casa');
    } catch (err) {
      setDeleteError(err);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title={isEditing ? 'Editar conta de casa' : 'Nova conta de casa'}
        description={isEditing ? 'Atualize os dados da conta.' : 'Cadastre uma conta de água, luz ou telefone.'}
      />
      {homeBillQuery.isLoading ? <Skeleton lines={4} /> : null}
      {homeBillQuery.error ? <Alert error={homeBillQuery.error} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteError ? <Alert error={deleteError} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Tipo de conta</span>
          <select {...register('tipo')}>
            <option value="agua">Água</option>
            <option value="luz">Luz</option>
            <option value="telefone">Telefone</option>
          </select>
          {errors.tipo ? <small>{errors.tipo.message}</small> : null}
        </label>
        <label className="field">
          <span>Fornecedor</span>
          <input autoComplete="off" type="text" {...register('fornecedor_nome')} />
          {errors.fornecedor_nome ? <small>{errors.fornecedor_nome.message}</small> : null}
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
          <span>Vencimento</span>
          <input autoComplete="off" type="date" {...register('data_vencimento')} />
          {errors.data_vencimento ? <small>{errors.data_vencimento.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<ReceiptText size={18} />} type="submit">
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Salvar conta'}
        </Button>
        {isEditing ? (
          <ConfirmDialog
            confirmLabel="Excluir conta"
            description="Esta conta de casa será excluída. Esta ação não pode ser desfeita."
            onConfirm={handleDelete}
            title="Excluir conta de casa?"
            trigger={(
              <button
                className="button button--danger"
                disabled={isDeleting || isSubmitting}
                type="button"
              >
                <Trash2 size={18} aria-hidden="true" />
                <span>{isDeleting ? 'Excluindo...' : 'Excluir conta'}</span>
              </button>
            )}
            variant="danger"
          />
        ) : null}
      </form>
    </section>
  );
}
