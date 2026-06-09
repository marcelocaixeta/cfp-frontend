import { Badge } from './Badge';

const labels: Record<string, string> = {
  active: 'Ativo',
  canceled: 'Cancelado',
  closed: 'Fechado',
  high: 'Alta',
  low: 'Baixa',
  normal: 'Normal',
  open: 'Aberto',
  overdue: 'Vencido',
  paid: 'Pago',
  pending: 'Pendente',
  resolved: 'Resolvido',
  waiting_support: 'Aguardando suporte',
  waiting_user: 'Aguardando usuário',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = ['paid', 'active', 'resolved'].includes(status)
    ? 'success'
    : ['pending', 'waiting_support', 'waiting_user', 'normal'].includes(status)
      ? 'warning'
      : ['overdue', 'canceled', 'closed', 'high'].includes(status)
        ? 'danger'
        : 'neutral';

  return <Badge tone={tone}>{labels[status] ?? status}</Badge>;
}
