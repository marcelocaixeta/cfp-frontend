import { useMemo, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { getFinanceSummary } from '../api/financeApi';
import type { FinanceDashboardChartItem } from '../types';

const CHART_COLORS = ['#16845b', '#c2413b'];
const COMPOSITION_COLORS = ['#c2413b', '#d78b17', '#1769aa'];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function toChartData(items: FinanceDashboardChartItem[]) {
  return items.map((item) => ({
    ...item,
    value: Number(item.valor),
  })).filter((item) => Number.isFinite(item.value) && item.value >= 0);
}

export function FinanceSummaryPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.summary(month),
    queryFn: () => getFinanceSummary(month),
  });
  const chartData = useMemo(() => toChartData(data?.controle_gastos_mensais.grafico.itens ?? []), [data]);
  const monthlyControl = data?.controle_gastos_mensais;

  return (
    <section className="page-stack">
      <PageHeader
        title="Controle de gastos mensais"
        description="Compare salário e gastos lançados no mês."
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
      {isLoading ? <Skeleton lines={6} /> : null}
      {error ? <Alert error={error} /> : null}
      {data ? (
        <>
          <div className="finance-dashboard">
            <Card className="finance-dashboard__chart-card">
              <div className="section-heading">
                <h2>Salário x gastos</h2>
                <span>{monthlyControl?.periodo.mes}</span>
              </div>
              {chartData.length ? (
                <div className="finance-dashboard__chart">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                      <XAxis dataKey="rotulo" tickLine={false} />
                      <YAxis tickFormatter={(value) => formatCurrency(String(value))} width={88} />
                      <Tooltip formatter={(value) => formatCurrency(String(value))} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((item, index) => (
                          <Cell key={item.chave} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted">Sem valores para exibir no gráfico neste mês.</p>
              )}
            </Card>

            <Card className="finance-dashboard__breakdown">
              <div className="section-heading">
                <h2>Composição dos gastos</h2>
                <span>{formatCurrency(monthlyControl?.total_gastos)}</span>
              </div>
              <div className="breakdown-list">
                {monthlyControl?.composicao_gastos.map((item, index) => (
                  <div className="breakdown-row" key={item.chave}>
                    <span className="breakdown-row__marker" style={{ background: COMPOSITION_COLORS[index % COMPOSITION_COLORS.length] }} />
                    <span>{item.rotulo}</span>
                    <strong>{formatCurrency(item.valor)}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="kpi-grid">
            <Card className="kpi-card--info">
              <span className="kpi-label">Salário do mês</span>
              <strong className="kpi-value">{formatCurrency(monthlyControl?.salario_liquido)}</strong>
              <span className="kpi-caption">Receitas do tipo salário</span>
            </Card>
            <Card className={monthlyControl?.gastando_mais_do_que_ganha ? 'kpi-card--danger' : 'kpi-card--success'}>
              <span className="kpi-label">Gastos do mês</span>
              <strong className="kpi-value">{formatCurrency(monthlyControl?.total_gastos)}</strong>
              <span className="kpi-caption">Pagos, pendentes e vencidos</span>
            </Card>
            <Card className={Number(monthlyControl?.saldo_previsto) >= 0 ? 'kpi-card--success' : 'kpi-card--danger'}>
              <span className="kpi-label">Saldo previsto</span>
              <strong className="kpi-value">{formatCurrency(monthlyControl?.saldo_previsto)}</strong>
              <span className="kpi-caption">Salário menos gastos do mês</span>
            </Card>
            <Card>
              <span className="kpi-label">Dívidas pendentes</span>
              <strong className="kpi-value">{formatCurrency(data.dividas_cartao_credito.total_pendente)}</strong>
              <span className="kpi-caption">{data.dividas_cartao_credito.count} registros</span>
            </Card>
            <Card>
              <span className="kpi-label">Dívidas vencidas</span>
              <strong className="kpi-value">{formatCurrency(data.dividas_cartao_credito.total_vencido)}</strong>
              <span className="kpi-caption">Cartões de crédito</span>
            </Card>
            <Card>
              <span className="kpi-label">Empréstimos ativos</span>
              <strong className="kpi-value">{formatCurrency(data.emprestimos.total_principal_ativo)}</strong>
              <span className="kpi-caption">Valor principal</span>
            </Card>
            <Card>
              <span className="kpi-label">Parcelas pendentes</span>
              <strong className="kpi-value">{formatCurrency(data.emprestimos.total_parcelas_pendentes)}</strong>
              <span className="kpi-caption">Em aberto</span>
            </Card>
          </div>
          <div className="quick-actions">
            <Link to="/financas/cartoes">Ver cartões</Link>
            <Link to="/financas/dividas-cartao">Ver dívidas</Link>
            <Link to="/financas/contas-casa">Ver contas de casa</Link>
            <Link to="/financas/emprestimos">Ver empréstimos</Link>
          </div>
        </>
      ) : null}
    </section>
  );
}
