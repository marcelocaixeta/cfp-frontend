import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatDate } from '../../../lib/formatting/date';
import { formatBtc, formatNumber } from '../../../lib/formatting/number';
import { getBtcDashboard } from '../api/btcApi';
import type { BtcAsset } from '../types';

const SATOSHIS_PER_BTC = 100_000_000;

function getAssetBtc(asset: BtcAsset) {
  return asset.quantidade_btc ?? asset.quantidade_satoshis / SATOSHIS_PER_BTC;
}

export function BtcDashboardPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.btc.dashboard,
    queryFn: getBtcDashboard,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Dashboard BTC"
        description="Visão consolidada dos seus ativos em Bitcoin e da cotação mais recente registrada."
        action={
          <Link to="/btc/ativos">
            <Button type="button" variant="secondary">Gerenciar ativos</Button>
          </Link>
        }
      />
      {isLoading ? <Skeleton lines={6} /> : null}
      {error ? <Alert error={error} /> : null}
      {data ? (
        <>
          <div className="kpi-grid">
            <Card>
              <span className="kpi-label">Preço BTC</span>
              <strong className="kpi-value">{formatCurrency(data.preco_mais_recente?.preco, data.moeda)}</strong>
              <span className="kpi-caption">Fonte: {data.preco_mais_recente?.provedor ?? 'sem captura'}</span>
            </Card>
            <Card>
              <span className="kpi-label">Total BTC</span>
              <strong className="kpi-value">{formatBtc(data.total_btc)}</strong>
              <span className="kpi-caption">{data.ativos.length} ativo(s) cadastrado(s)</span>
            </Card>
            <Card>
              <span className="kpi-label">Valor estimado</span>
              <strong className="kpi-value">{data.valor_estimado ? formatCurrency(data.valor_estimado, data.moeda) : '-'}</strong>
              <span className="kpi-caption">Última captura: {formatDate(data.preco_mais_recente?.capturado_em)}</span>
            </Card>
          </div>
          {data.ativos.length ? (
            <div className="responsive-list">
              {data.ativos.map((asset) => (
                <Card className="list-card" key={asset.id}>
                  <div>
                    <strong>{asset.rotulo}</strong>
                    <span>{asset.moeda}</span>
                  </div>
                  <div>
                    <strong>{formatNumber(asset.quantidade_satoshis, 0)} sats</strong>
                    <span>{formatBtc(getAssetBtc(asset))} BTC</span>
                  </div>
                  <div>
                    <strong>Preço médio</strong>
                    <span>{asset.preco_medio_compra ? formatCurrency(asset.preco_medio_compra, asset.moeda) : '-'}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum ativo BTC cadastrado"
              description="Cadastre suas carteiras ou corretoras para acompanhar quantidade e valor estimado."
              action={
                <Link to="/btc/ativos">
                  <Button type="button">Cadastrar ativo</Button>
                </Link>
              }
            />
          )}
        </>
      ) : null}
    </section>
  );
}
