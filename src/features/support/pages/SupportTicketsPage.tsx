import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { queryKeys } from '../../../config/queryKeys';
import { formatDate } from '../../../lib/formatting/date';
import { getSupportTickets } from '../api/supportApi';

export function SupportTicketsPage() {
  const navigate = useNavigate();

  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.support.tickets,
    queryFn: getSupportTickets,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Suporte"
        description="Chamados abertos, histórico de atendimento e prioridades."
        action={<Button onClick={() => navigate('/suporte/novo')} type="button">Novo chamado</Button>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((ticket) => (
            <Card className="list-card" key={ticket.id}>
              <div>
                <strong>{ticket.assunto}</strong>
                <span>
                  {ticket.categoria ?? 'Geral'} · {ticket.messages_count ?? 0} mensagem(ns)
                </span>
              </div>
              <div>
                <strong>Prioridade</strong>
                <span>{ticket.prioridade}</span>
              </div>
              <div>
                <span>{formatDate(ticket.criado_em)}</span>
                <StatusBadge status={ticket.situacao} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhum chamado aberto"
          description="Quando precisar de ajuda, abra um chamado para acompanhar o atendimento."
        />
      ) : null}
    </section>
  );
}
