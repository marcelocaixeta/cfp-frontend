import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCardIcon } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { queryKeys } from '../../../config/queryKeys';
import { parseCurrency } from '../../../lib/formatting/currency';
import { createCreditCard } from '../api/financeApi';

const schema = z.object({
  nome: z.string().min(1, 'Informe um nome para o cartão.'),
  bandeira: z.string().optional(),
  ultimos_quatro_digitos: z.string().optional(),
  limite_valor: z.string().optional(),
  dia_fechamento: z.string().optional(),
  dia_vencimento: z.string().optional(),
});

type CreditCardFormData = z.infer<typeof schema>;

export function CreditCardFormPage() {
  const [error, setError] = useState<unknown>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<CreditCardFormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: CreditCardFormData) {
    setError(null);
    try {
      await createCreditCard({
        nome: data.nome,
        bandeira: data.bandeira || undefined,
        ultimos_quatro_digitos: data.ultimos_quatro_digitos || undefined,
        limite_valor: data.limite_valor ? parseCurrency(data.limite_valor) : undefined,
        dia_fechamento: data.dia_fechamento ? Number(data.dia_fechamento) : null,
        dia_vencimento: data.dia_vencimento ? Number(data.dia_vencimento) : null,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCards });
      navigate('/financas/cartoes');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Novo cartão"
        description="Cadastre um cartão de crédito para organizar limites e vencimentos."
      />
      {error ? <Alert error={error} /> : null}
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
          {isSubmitting ? 'Salvando...' : 'Salvar cartão'}
        </Button>
      </form>
    </section>
  );
}
