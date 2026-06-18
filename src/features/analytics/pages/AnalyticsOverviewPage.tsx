import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { queryKeys } from '../../../config/queryKeys';
import { getCurrentWeekDueDates, markLoanInstallmentAsPaid } from '../../finance/api/financeApi';
import type { CurrentWeekDueDates } from '../../finance/types';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { getAnalyticsOverview } from '../api/analyticsApi';

function getTotalDueValue(data: CurrentWeekDueDates) {
  return (
    Number(data.totais.dividas_cartao_credito.valor ?? 0) +
    Number(data.totais.parcelas_emprestimos.valor ?? 0)
  );
}

export function AnalyticsOverviewPage() {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: getAnalyticsOverview,
  });

  const {
    data: dueDates,
    error: dueDatesError,
    isLoading: isDueDatesLoading,
  } = useQuery({
    queryKey: queryKeys.finance.currentWeekDueDates,
    queryFn: getCurrentWeekDueDates,
  });

  const payInstallmentMutation = useMutation({
    mutationFn: (loanInstallmentId: number) => markLoanInstallmentAsPaid(loanInstallmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.currentWeekDueDates }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.summary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview }),
      ]);
    },
  });

  const hasDueDates =
    Boolean(dueDates?.dividas_cartao_credito.length) || Boolean(dueDates?.parcelas_emprestimos.length);

  return (
    <section className="page-stack">
      <PageHeader
        title="Análises"
        description="Indicadores rápidos sobre finanças, BTC e suporte."
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data ? (
        <div className="kpi-grid">
          <Card>
            <span className="kpi-label">Dívidas de cartão</span>
            <strong className="kpi-value">{data.quantidade_dividas_cartao_credito}</strong>
            <span className="kpi-caption">Registros cadastrados</span>
          </Card>
          <Card>
            <span className="kpi-label">Empréstimos ativos</span>
            <strong className="kpi-value">{data.quantidade_emprestimos_ativos}</strong>
            <span className="kpi-caption">Contratos em andamento</span>
          </Card>
          <Card>
            <span className="kpi-label">Ativos BTC</span>
            <strong className="kpi-value">{data.quantidade_ativos_btc}</strong>
            <span className="kpi-caption">Itens acompanhados</span>
          </Card>
          <Card>
            <span className="kpi-label">Chamados abertos</span>
            <strong className="kpi-value">{data.quantidade_chamados_suporte_abertos}</strong>
            <span className="kpi-caption">Pendências de suporte</span>
          </Card>
        </div>
      ) : null}
      <Card>
        <div className="section-heading">
          <div>
            <span className="kpi-label">Semana corrente</span>
            <h2>Vencimentos da semana</h2>
          </div>
          <CalendarDays size={22} aria-hidden="true" />
        </div>
        {isDueDatesLoading ? <Skeleton lines={4} /> : null}
        {dueDatesError ? <Alert error={dueDatesError} /> : null}
        {payInstallmentMutation.error ? <Alert error={payInstallmentMutation.error} /> : null}
        {dueDates ? (
          <>
            <div className="kpi-grid due-dates-summary">
              <div className="btc-balance-metric">
                <span className="kpi-label">Período</span>
                <strong className="kpi-value due-dates-period">
                  {formatDate(dueDates.periodo.inicio)} - {formatDate(dueDates.periodo.fim)}
                </strong>
                <span className="kpi-caption">Vencimentos pendentes ou vencidos</span>
              </div>
              <div className="btc-balance-metric">
                <span className="kpi-label">Total da semana</span>
                <strong className="kpi-value">{formatCurrency(getTotalDueValue(dueDates))}</strong>
                <span className="kpi-caption">
                  {dueDates.totais.dividas_cartao_credito.count + dueDates.totais.parcelas_emprestimos.count} item(ns)
                </span>
              </div>
              <div className="btc-balance-metric">
                <span className="kpi-label">Cartão / empréstimos</span>
                <strong className="kpi-value due-dates-split">
                  {dueDates.totais.dividas_cartao_credito.count} / {dueDates.totais.parcelas_emprestimos.count}
                </strong>
                <span className="kpi-caption">
                  {formatCurrency(dueDates.totais.dividas_cartao_credito.valor)} /{' '}
                  {formatCurrency(dueDates.totais.parcelas_emprestimos.valor)}
                </span>
              </div>
            </div>
            {hasDueDates ? (
              <div className="due-dates-columns">
                <div className="due-dates-column">
                  <h3>Dívidas de cartão</h3>
                  {dueDates.dividas_cartao_credito.length ? (
                    <div className="responsive-list">
                      {dueDates.dividas_cartao_credito.map((debt) => (
                        <div className="due-date-row" key={`card-${debt.id}`}>
                          <div>
                            <strong>{debt.descricao}</strong>
                            <span>
                              {debt.cartao_credito?.nome ?? 'Cartão'} · parcela {debt.parcela_atual}/
                              {debt.quantidade_parcelas} · vence {formatDate(debt.data_vencimento)}
                            </span>
                          </div>
                          <div>
                            <strong>{formatCurrency(debt.valor)}</strong>
                            <span>Total {formatCurrency(debt.valor_total)}</span>
                          </div>
                          <StatusBadge status={debt.situacao} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Nenhuma dívida de cartão vencendo nesta semana.</p>
                  )}
                </div>
                <div className="due-dates-column">
                  <h3>Parcelas de empréstimos</h3>
                  {dueDates.parcelas_emprestimos.length ? (
                    <div className="responsive-list">
                      {dueDates.parcelas_emprestimos.map((installment) => (
                        <div className="due-date-row" key={`loan-${installment.id}`}>
                          <div>
                            <strong>{installment.credor_nome}</strong>
                            <span>
                              {installment.descricao ?? 'Empréstimo'} · parcela {installment.numero_parcela} · vence{' '}
                              {formatDate(installment.data_vencimento)}
                            </span>
                          </div>
                          <div>
                            <strong>{formatCurrency(installment.valor)}</strong>
                            <span>Parcela #{installment.numero_parcela}</span>
                          </div>
                          <div className="due-date-row__actions">
                            <StatusBadge status={installment.situacao} />
                            <Button
                              type="button"
                              variant="secondary"
                              icon={<CheckCircle2 size={16} aria-hidden="true" />}
                              disabled={
                                payInstallmentMutation.isPending &&
                                payInstallmentMutation.variables === installment.id
                              }
                              onClick={() => payInstallmentMutation.mutate(installment.id)}
                            >
                              {payInstallmentMutation.isPending &&
                              payInstallmentMutation.variables === installment.id
                                ? 'Salvando'
                                : 'Marcar pago'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Nenhuma parcela de empréstimo vencendo nesta semana.</p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Nenhum vencimento nesta semana"
                description="Dívidas de cartão e parcelas de empréstimos pendentes aparecerão aqui quando vencerem no período atual."
              />
            )}
          </>
        ) : null}
      </Card>
    </section>
  );
}
