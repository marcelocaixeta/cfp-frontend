import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { parseCurrency } from '../../../lib/formatting/currency';
import { createCreditCardDebt, getCreditCards } from '../api/financeApi';

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cardsData, isLoading: cardsLoading } = useQuery({
    queryKey: queryKeys.finance.creditCards,
    queryFn: getCreditCards,
  });

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<CreditCardDebtFormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: CreditCardDebtFormData) {
    setError(null);
    try {
      await createCreditCardDebt({
        credit_card_id: data.credit_card_id,
        descricao: data.descricao,
        valor_total: parseCurrency(data.valor_total),
        quantidade_parcelas: data.quantidade_parcelas,
        valor_parcela: parseCurrency(data.valor_parcela),
        primeira_data_vencimento: data.primeira_data_vencimento,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCardDebts });
      navigate('/financas/dividas-cartao');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Nova dívida"
        description="Cadastre uma compra parcelada ou dívida de cartão de crédito."
      />
      {error ? <Alert error={error} /> : null}
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
          {isSubmitting ? 'Salvando...' : 'Salvar dívida'}
        </Button>
      </form>
    </section>
  );
}
