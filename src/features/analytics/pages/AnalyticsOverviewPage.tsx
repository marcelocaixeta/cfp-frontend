import { useState } from 'react';
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
import {
  getFinanceDueDates,
  markCreditCardDebtAsPaid,
  markHomeBillAsPaid,
  markLoanInstallmentAsPaid,
} from '../../finance/api/financeApi';
import type { FinanceDueDates, HomeBillType } from '../../finance/types';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { getAnalyticsOverview } from '../api/analyticsApi';

const homeBillTypeLabels: Record<HomeBillType, string> = {
  agua: 'Água',
  luz: 'Luz',
  telefone: 'Telefone',
};

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getTotalDueValue(data: FinanceDueDates) {
  return (
    Number(data.totais.dividas_cartao_credito.valor ?? 0) +
    Number(data.totais.contas_casa.valor ?? 0) +
    Number(data.totais.parcelas_emprestimos.valor ?? 0)
  );
}

export function AnalyticsOverviewPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(getCurrentMonth);
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: getAnalyticsOverview,
  });

  const {
    data: dueDates,
    error: dueDatesError,
    isLoading: isDueDatesLoading,
  } = useQuery({
    queryKey: queryKeys.finance.dueDates(month),
    queryFn: () => getFinanceDueDates(month),
  });

  const payInstallmentMutation = useMutation({
    mutationFn: (loanInstallmentId: number) => markLoanInstallmentAsPaid(loanInstallmentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dueDatesRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.summaryRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboardRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview }),
      ]);
    },
  });

  const payCreditCardDebtMutation = useMutation({
    mutationFn: (creditCardDebtId: number) => markCreditCardDebtAsPaid(creditCardDebtId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dueDatesRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.summaryRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.creditCardDebts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboardRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview }),
      ]);
    },
  });

  const payHomeBillMutation = useMutation({
    mutationFn: (homeBillId: number) => markHomeBillAsPaid(homeBillId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dueDatesRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.summaryRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.homeBills }),
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboardRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview }),
      ]);
    },
  });

  const hasDueDates =
    Boolean(dueDates?.dividas_cartao_credito.length) ||
    Boolean(dueDates?.contas_casa.length) ||
    Boolean(dueDates?.parcelas_emprestimos.length);

  return (
    <section className="page-stack">
      <PageHeader
        title="Análises"
        description="Indicadores rápidos sobre finanças, BTC e suporte."
        action={
          <label className="month-filter">
            <span>Mês</span>
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value || getCurrentMonth())}
            />
          </label>
        }
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      <Card>
        <div className="section-heading">
          <div>
            <span className="kpi-label">Mês selecionado</span>
            <h2>Vencimentos do mês</h2>
          </div>
          <CalendarDays size={22} aria-hidden="true" />
        </div>
        {isDueDatesLoading ? <Skeleton lines={4} /> : null}
        {dueDatesError ? <Alert error={dueDatesError} /> : null}
        {payCreditCardDebtMutation.error ? <Alert error={payCreditCardDebtMutation.error} /> : null}
        {payHomeBillMutation.error ? <Alert error={payHomeBillMutation.error} /> : null}
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
                <span className="kpi-label">Total do mês</span>
                <strong className="kpi-value">{formatCurrency(getTotalDueValue(dueDates))}</strong>
                <span className="kpi-caption">
                  {dueDates.totais.dividas_cartao_credito.count +
                    dueDates.totais.contas_casa.count +
                    dueDates.totais.parcelas_emprestimos.count} item(ns)
                </span>
              </div>
              <div className="btc-balance-metric">
                <span className="kpi-label">Cartão / contas / empréstimos</span>
                <strong className="kpi-value due-dates-split">
                  {dueDates.totais.dividas_cartao_credito.count} / {dueDates.totais.contas_casa.count} /{' '}
                  {dueDates.totais.parcelas_emprestimos.count}
                </strong>
                <span className="kpi-caption">
                  {formatCurrency(dueDates.totais.dividas_cartao_credito.valor)} /{' '}
                  {formatCurrency(dueDates.totais.contas_casa.valor)} /{' '}
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
                          <div className="due-date-row__actions">
                            <StatusBadge status={debt.situacao} />
                            <Button
                              type="button"
                              variant="secondary"
                              icon={<CheckCircle2 size={16} aria-hidden="true" />}
                              disabled={
                                payCreditCardDebtMutation.isPending &&
                                payCreditCardDebtMutation.variables === debt.id
                              }
                              onClick={() => payCreditCardDebtMutation.mutate(debt.id)}
                            >
                              {payCreditCardDebtMutation.isPending &&
                              payCreditCardDebtMutation.variables === debt.id
                                ? 'Salvando'
                                : 'Marcar pago'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Nenhuma dívida de cartão vencendo neste mês.</p>
                  )}
                </div>
                <div className="due-dates-column">
                  <h3>Contas de casa</h3>
                  {dueDates.contas_casa.length ? (
                    <div className="responsive-list">
                      {dueDates.contas_casa.map((bill) => (
                        <div className="due-date-row" key={`home-bill-${bill.id}`}>
                          <div>
                            <strong>{bill.descricao}</strong>
                            <span>
                              {homeBillTypeLabels[bill.tipo_conta]}
                              {bill.fornecedor_nome ? ` · ${bill.fornecedor_nome}` : ''} · vence{' '}
                              {formatDate(bill.data_vencimento)}
                            </span>
                          </div>
                          <div>
                            <strong>{formatCurrency(bill.valor)}</strong>
                            <span>Conta de casa</span>
                          </div>
                          <div className="due-date-row__actions">
                            <StatusBadge status={bill.situacao} />
                            <Button
                              type="button"
                              variant="secondary"
                              icon={<CheckCircle2 size={16} aria-hidden="true" />}
                              disabled={
                                payHomeBillMutation.isPending &&
                                payHomeBillMutation.variables === bill.id
                              }
                              onClick={() => payHomeBillMutation.mutate(bill.id)}
                            >
                              {payHomeBillMutation.isPending &&
                              payHomeBillMutation.variables === bill.id
                                ? 'Salvando'
                                : 'Marcar pago'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="muted">Nenhuma conta de casa vencendo neste mês.</p>
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
                    <p className="muted">Nenhuma parcela de empréstimo vencendo neste mês.</p>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Nenhum vencimento neste mês"
                description="Dívidas de cartão, contas de casa e parcelas de empréstimos pendentes aparecerão aqui quando vencerem no período selecionado."
              />
            )}
          </>
        ) : null}
      </Card>
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
    </section>
  );
}
