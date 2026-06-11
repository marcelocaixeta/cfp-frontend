import { CheckCircle2, MessageSquareReply } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { queryKeys } from '../../../config/queryKeys';
import { formatDate } from '../../../lib/formatting/date';
import type { SupportTicket } from '../types';
import { createSupportTicketMessage, getAllSupportTickets, resolveSupportTicket } from '../api/supportApi';

function AdminTicketCard({ ticket }: { ticket: SupportTicket }) {
  const queryClient = useQueryClient();
  const [mensagem, setMensagem] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  const isResolved = ticket.situacao === 'resolved' || ticket.situacao === 'closed';
  const trimmedMessage = mensagem.trim();

  async function refreshTickets() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.support.allTickets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.support.tickets }),
    ]);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!trimmedMessage) {
      setError(new Error('Escreva uma resposta antes de enviar.'));
      return;
    }

    setIsSendingMessage(true);

    try {
      await createSupportTicketMessage(ticket.id, trimmedMessage);
      setMensagem('');
      setSuccessMessage('Resposta enviada ao chamado.');
      await refreshTickets();
    } catch (err) {
      setError(err);
    } finally {
      setIsSendingMessage(false);
    }
  }

  async function handleResolve() {
    setError(null);
    setSuccessMessage(null);
    setIsResolving(true);

    try {
      await resolveSupportTicket(ticket.id);
      setSuccessMessage('Chamado marcado como resolvido.');
      await refreshTickets();
    } catch (err) {
      setError(err);
    } finally {
      setIsResolving(false);
    }
  }

  return (
    <Card className="support-admin-card">
      <div className="support-admin-card__summary">
        <div>
          <span className="kpi-label">Chamado #{ticket.id}</span>
          <h2>{ticket.assunto}</h2>
          <span className="muted">
            {ticket.categoria ?? 'Geral'} · {ticket.messages_count ?? 0} mensagem(ns)
          </span>
        </div>
        <div className="support-admin-card__badges">
          <StatusBadge status={ticket.prioridade} />
          <StatusBadge status={ticket.situacao} />
        </div>
      </div>

      <dl className="support-admin-card__meta">
        <div>
          <dt>Criado em</dt>
          <dd>{formatDate(ticket.criado_em)}</dd>
        </div>
      </dl>

      {error ? <Alert error={error} /> : null}
      {successMessage ? (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      ) : null}

      <form className="form" onSubmit={handleSendMessage}>
        <label className="field">
          <span>Resposta do suporte</span>
          <textarea
            disabled={isResolved}
            onChange={(event) => setMensagem(event.target.value)}
            rows={4}
            value={mensagem}
          />
        </label>
        <div className="support-admin-card__actions">
          <Button
            disabled={isResolved || isSendingMessage || !trimmedMessage}
            icon={<MessageSquareReply size={18} />}
            type="submit"
            variant="secondary"
          >
            {isSendingMessage ? 'Enviando...' : 'Responder'}
          </Button>
          <Button
            disabled={isResolved || isResolving}
            icon={<CheckCircle2 size={18} />}
            onClick={handleResolve}
            type="button"
          >
            {isResolving ? 'Resolvendo...' : 'Resolver chamado'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function AdminSupportTicketsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.support.allTickets,
    queryFn: getAllSupportTickets,
  });
  const openTickets = data?.data.filter((ticket) => ticket.situacao !== 'resolved' && ticket.situacao !== 'closed') ?? [];

  return (
    <section className="page-stack">
      <PageHeader
        title="Chamados de suporte"
        description="Atendimento administrativo para responder e resolver chamados."
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {openTickets.length ? (
        <div className="support-admin-list">
          {openTickets.map((ticket) => (
            <AdminTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : null}
      {data && !openTickets.length ? (
        <EmptyState
          title="Nenhum chamado aberto"
          description="Os chamados abertos pelos usuários aparecerão aqui para atendimento."
        />
      ) : null}
    </section>
  );
}
