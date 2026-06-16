import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { queryKeys } from '../../../config/queryKeys';
import { parseCurrency } from '../../../lib/formatting/currency';
import { createHomeBill } from '../api/financeApi';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<HomeBillFormData>({
    defaultValues: {
      tipo: 'agua',
    },
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: HomeBillFormData) {
    setError(null);
    try {
      await createHomeBill(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.homeBills });
      navigate('/financas/contas-casa');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Nova conta de casa"
        description="Cadastre uma conta de água, luz ou telefone."
      />
      {error ? <Alert error={error} /> : null}
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
          {isSubmitting ? 'Salvando...' : 'Salvar conta'}
        </Button>
      </form>
    </section>
  );
}
