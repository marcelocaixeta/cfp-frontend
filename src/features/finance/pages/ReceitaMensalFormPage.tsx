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
import { createReceitaMensal } from '../api/financeApi';
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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ReceitaMensalFormValues, unknown, ReceitaMensalFormData>({
    defaultValues: {
      tipo_receita: 'salary',
      recorrente: true,
    },
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: ReceitaMensalFormData) {
    setError(null);
    try {
      await createReceitaMensal(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.receitasMensais });
      navigate('/financas/receitas-mensais');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Nova receita mensal"
        description="Cadastre um recebimento mensal como salário, freelance, investimento, etc."
      />
      {error ? <Alert error={error} /> : null}
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
          {isSubmitting ? 'Salvando...' : 'Salvar receita'}
        </Button>
      </form>
    </section>
  );
}
