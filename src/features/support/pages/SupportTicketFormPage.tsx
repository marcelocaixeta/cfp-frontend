import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Ticket } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { queryKeys } from '../../../config/queryKeys';
import { createSupportTicket } from '../api/supportApi';

const schema = z.object({
  assunto: z.string().min(1, 'Informe o assunto do chamado.'),
  categoria: z.string().optional(),
  prioridade: z.enum(['low', 'normal', 'high']),
  mensagem: z.string().min(1, 'Escreva uma mensagem para o chamado.'),
});

type SupportTicketFormData = z.infer<typeof schema>;

export function SupportTicketFormPage() {
  const [error, setError] = useState<unknown>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<SupportTicketFormData>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: 'normal' },
  });

  async function onSubmit(data: SupportTicketFormData) {
    setError(null);
    try {
      await createSupportTicket({
        assunto: data.assunto,
        categoria: data.categoria || undefined,
        prioridade: data.prioridade,
        mensagem: data.mensagem,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets });
      navigate('/suporte');
    } catch (err) {
      setError(err);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Novo chamado"
        description="Abra um chamado de suporte para receber atendimento."
      />
      {error ? <Alert error={error} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Assunto</span>
          <input autoComplete="off" type="text" {...register('assunto')} />
          {errors.assunto ? <small>{errors.assunto.message}</small> : null}
        </label>
        <label className="field">
          <span>Categoria</span>
          <select {...register('categoria')}>
            <option value="">Selecione uma categoria</option>
            <option value="financeiro">Financeiro</option>
            <option value="tecnico">Técnico</option>
            <option value="duvida">Dúvida</option>
            <option value="sugestao">Sugestão</option>
            <option value="outro">Outro</option>
          </select>
          {errors.categoria ? <small>{errors.categoria.message}</small> : null}
        </label>
        <label className="field">
          <span>Prioridade</span>
          <select {...register('prioridade')}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
          {errors.prioridade ? <small>{errors.prioridade.message}</small> : null}
        </label>
        <label className="field">
          <span>Mensagem</span>
          <textarea rows={5} {...register('mensagem')} />
          {errors.mensagem ? <small>{errors.mensagem.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<Ticket size={18} />} type="submit">
          {isSubmitting ? 'Salvando...' : 'Abrir chamado'}
        </Button>
      </form>
    </section>
  );
}
