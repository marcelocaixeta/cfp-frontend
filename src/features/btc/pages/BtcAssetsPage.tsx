import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatBtc } from '../../../lib/formatting/number';
import { getBtcAddressBalance, getBtcAssets } from '../api/btcApi';
import { isValidBtcAddress } from '../lib/bitcoinAddress';

export function BtcAssetsPage() {
  const [address, setAddress] = useState('');
  const [hasSubmittedBalance, setHasSubmittedBalance] = useState(false);
  const [submittedAddress, setSubmittedAddress] = useState<string | undefined>(undefined);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.btc.assets,
    queryFn: getBtcAssets,
  });

  const {
    data: balance,
    error: balanceError,
    isFetching: isBalanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: queryKeys.btc.addressBalance(submittedAddress),
    queryFn: () => getBtcAddressBalance(submittedAddress),
    enabled: hasSubmittedBalance,
  });

  function handleBalanceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextAddress = address.trim() || undefined;

    if (nextAddress && !isValidBtcAddress(nextAddress)) {
      setValidationMessage('Informe um endereço Bitcoin válido. O endereço digitado não passou na validação de checksum.');
      return;
    }

    setValidationMessage(null);
    setHasSubmittedBalance(true);

    if (hasSubmittedBalance && nextAddress === submittedAddress) {
      refetchBalance();
      return;
    }

    setSubmittedAddress(nextAddress);
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Ativos BTC"
        description="Consulte o saldo de um endereço Bitcoin e acompanhe carteiras, corretoras e posições vinculadas ao seu usuário."
        action={<Button type="button">Novo ativo</Button>}
      />
      <Card>
        <form className="btc-balance-form" onSubmit={handleBalanceSubmit}>
          <label className="field">
            <span>Endereço Bitcoin</span>
            <input
              autoComplete="off"
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Use o endereço padrão do backend ou informe um endereço"
              type="text"
              value={address}
            />
          </label>
          <Button disabled={isBalanceLoading} icon={<Search size={18} />} type="submit">
            {isBalanceLoading ? 'Consultando...' : 'Consultar saldo'}
          </Button>
        </form>
        {validationMessage ? <Alert title="Endereço inválido" message={validationMessage} /> : null}
        {balanceError ? <Alert error={balanceError} /> : null}
        {balance && !validationMessage ? (
          <>
            <div className="kpi-grid btc-balance-grid">
              <div className="btc-balance-metric">
                <span className="kpi-label">Saldo total</span>
                <strong className="kpi-value">{formatBtc(balance.total_balance_btc)} BTC</strong>
                <span className="kpi-caption">{balance.total_balance_sats.toLocaleString('pt-BR')} sats</span>
              </div>
              <div className="btc-balance-metric">
                <span className="kpi-label">Confirmado</span>
                <strong className="kpi-value">{formatBtc(balance.confirmed_balance_btc)} BTC</strong>
                <span className="kpi-caption">{balance.transaction_count.confirmed} transação(ões)</span>
              </div>
              <div className="btc-balance-metric">
                <span className="kpi-label">Mempool</span>
                <strong className="kpi-value">{formatBtc(balance.mempool_balance_btc)} BTC</strong>
                <span className="kpi-caption">{balance.transaction_count.mempool} transação(ões)</span>
              </div>
            </div>
            <dl className="details-list btc-balance-details">
              <div>
                <dt>Endereço consultado</dt>
                <dd>{balance.address}</dd>
              </div>
              <div>
                <dt>Fonte</dt>
                <dd>{balance.source}</dd>
              </div>
            </dl>
          </>
        ) : null}
      </Card>
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
                <strong>{formatBtc(asset.quantidade_btc)} BTC</strong>
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
