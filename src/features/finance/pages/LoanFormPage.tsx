import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Banknote } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { queryKeys } from '../../../config/queryKeys';
import { parseCurrency } from '../../../lib/formatting/currency';
import { createLoan } from '../api/financeApi';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoanFormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: LoanFormData) {
    setError(null);
    try {
      await createLoan(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.loans });
      navigate('/financas/emprestimos');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Novo empréstimo"
        description="Cadastre um contrato de empréstimo para acompanhar parcelas e vencimentos."
      />
      {error ? <Alert error={error} /> : null}
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
          {isSubmitting ? 'Salvando...' : 'Salvar empréstimo'}
        </Button>
      </form>
    </section>
  );
}
