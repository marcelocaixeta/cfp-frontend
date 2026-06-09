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
import { formatNumber } from '../../../lib/formatting/number';
import { getBtcAssets } from '../api/btcApi';

export function BtcAssetsPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.btc.assets,
    queryFn: getBtcAssets,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Ativos BTC"
        description="Carteiras, corretoras e posições em Bitcoin vinculadas ao seu usuário."
        action={<Button type="button">Novo ativo</Button>}
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((asset) => (
            <Card className="list-card" key={asset.id}>
              <div>
                <strong>{asset.rotulo}</strong>
                <span>{asset.moeda}</span>
              </div>
              <div>
                <strong>{formatNumber(asset.quantidade_btc, 8)} BTC</strong>
                <span>Preço médio {formatCurrency(asset.preco_medio_compra, asset.moeda)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {data && !data.data.length ? (
        <EmptyState
          title="Sem ativos por enquanto"
          description="Quando você cadastrar ativos BTC, eles aparecerão aqui."
          action={<Link to="/dashboard">Voltar ao dashboard</Link>}
        />
      ) : null}
    </section>
  );
}
