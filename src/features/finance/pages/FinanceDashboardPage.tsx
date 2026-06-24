import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { getFinanceDashboard } from '../api/financeApi';
import {
  financeTooltipContentStyle,
  financeTooltipCursor,
  financeTooltipItemStyle,
  financeTooltipLabelStyle,
} from '../chartTooltip';
import type { FinanceDashboardChartItem } from '../types';

const CHART_COLORS = ['#16845b', '#c2413b', '#1769aa', '#d78b17', '#6d5bd0', '#4f6f52'];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function toChartData(items: FinanceDashboardChartItem[]) {
  return items.map((item) => ({
    ...item,
    value: Number(item.valor),
  })).filter((item) => Number.isFinite(item.value) && item.value > 0);
}

export function FinanceDashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.finance.dashboard(month),
    queryFn: () => getFinanceDashboard(month),
  });
  const chartData = useMemo(() => toChartData(data?.grafico.itens ?? []), [data]);
  const chartColorsByKey = useMemo(
    () => new Map(chartData.map((item, index) => [item.chave, CHART_COLORS[index % CHART_COLORS.length]])),
    [chartData],
  );

  return (
    <section className="page-stack">
      <PageHeader
        title="Controle dos pagamentos do mês"
        description="Acompanhe o total a pagar, salário líquido e composição dos pagamentos."
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
                <h2>{data.grafico.titulo}</h2>
                <span>{data.periodo.mes}</span>
              </div>
              {chartData.length ? (
                <div className="finance-dashboard__chart">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={chartData} dataKey="value" nameKey="rotulo" innerRadius={54} outerRadius={104} paddingAngle={2}>
                        {chartData.map((item, index) => (
                          <Cell key={item.chave} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={financeTooltipContentStyle}
                        cursor={financeTooltipCursor}
                        formatter={(value) => formatCurrency(String(value))}
                        itemStyle={financeTooltipItemStyle}
                        labelStyle={financeTooltipLabelStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="muted">Sem valores para exibir no gráfico neste mês.</p>
              )}
            </Card>

            <Card className="finance-dashboard__breakdown">
              <div className="section-heading">
                <h2>Composição dos pagamentos</h2>
                <span>{formatCurrency(data.totais.total_a_pagar)}</span>
              </div>
              <div className="breakdown-list">
                {data.composicao_pagamentos.map((item, index) => (
                  <div className="breakdown-row" key={item.chave}>
                    <span
                      className="breakdown-row__marker"
                      style={{ background: chartColorsByKey.get(item.chave) ?? CHART_COLORS[(index + 1) % CHART_COLORS.length] }}
                    />
                    <span>{item.rotulo}</span>
                    <strong>{formatCurrency(item.valor)}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="kpi-grid finance-dashboard__totals">
            <Card className="kpi-card--danger">
              <span className="kpi-label">Total a pagar</span>
              <strong className="kpi-value">{formatCurrency(data.totais.total_a_pagar)}</strong>
              <span className="kpi-caption">Cartões, contas e parcelas em aberto</span>
            </Card>
            <Card className="kpi-card--info">
              <span className="kpi-label">Salário líquido</span>
              <strong className="kpi-value">{formatCurrency(data.totais.salario_liquido)}</strong>
              <span className="kpi-caption">Receitas do tipo salário</span>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  );
}
