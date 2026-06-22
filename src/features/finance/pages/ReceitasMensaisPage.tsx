import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { deleteReceitaMensal, getReceitasMensais } from '../api/financeApi';
import type { TipoReceita } from '../types';

const tipoReceitaLabels: Record<TipoReceita, string> = {
  salary: 'Salário',
  freelance: 'Freelance',
  investment: 'Investimento',
  other: 'Outro',
};

export function ReceitasMensaisPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.receitasMensais,
    queryFn: getReceitasMensais,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteReceitaMensal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.finance.receitasMensais }),
  });

  function handleDelete(receitaMensalId: number) {
    deleteMutation.mutate(receitaMensalId);
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Salário e Ganhos Mensais"
        description="Acompanhe seus recebimentos mensais."
        action={<Link to="/financas/receitas-mensais/nova"><Button icon={<Plus size={18} />} type="button">Nova receita</Button></Link>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {deleteMutation.error ? <Alert error={deleteMutation.error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((receita) => (
            <Card className="list-card" key={receita.id}>
              <div>
                <strong>{receita.descricao}</strong>
                <span>
                  {tipoReceitaLabels[receita.tipo_receita]} · {formatDate(receita.data_recebimento)}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(receita.valor)}</strong>
                <span>
                  {receita.recorrente ? <Badge tone="info">Recorrente</Badge> : <Badge tone="neutral">Eventual</Badge>}
                </span>
              </div>
              <div className="list-card__actions" aria-label={`Ações para ${receita.descricao}`} role="group">
                <Link
                  aria-label={`Editar ${receita.descricao}`}
                  className="icon-button action-button action-button--edit"
                  title={`Editar ${receita.descricao}`}
                  to={`/financas/receitas-mensais/${receita.id}`}
                >
                  <Pencil size={17} aria-hidden="true" />
                </Link>
                <ConfirmDialog
                  confirmLabel="Excluir receita"
                  description={`A receita "${receita.descricao}" será excluída. Esta ação não pode ser desfeita.`}
                  onConfirm={() => handleDelete(receita.id)}
                  title="Excluir receita mensal?"
                  trigger={(
                    <button
                      aria-label={`Excluir ${receita.descricao}`}
                      className="icon-button action-button action-button--delete"
                      disabled={deleteMutation.isPending}
                      title={`Excluir ${receita.descricao}`}
                      type="button"
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  )}
                  variant="danger"
                />
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Nenhuma receita cadastrada"
          description="Cadastre seus ganhos mensais para acompanhar seus recebimentos."
        />
      ) : null}
    </section>
  );
}
