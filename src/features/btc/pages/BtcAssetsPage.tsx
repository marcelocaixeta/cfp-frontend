import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, WalletCards } from 'lucide-react';
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
import { formatBtc, formatNumber } from '../../../lib/formatting/number';
import { createBtcAsset, getBtcAssets } from '../api/btcApi';
import type { BtcAsset } from '../types';

const SATOSHIS_PER_BTC = 100_000_000;
const MAX_BTC_DECIMALS = 10;

function getAssetBtc(asset: BtcAsset) {
  return asset.quantidade_btc ?? asset.quantidade_satoshis / SATOSHIS_PER_BTC;
}

function parseDecimalInput(value: string) {
  const normalizedValue = value.trim().replace(',', '.');

  if (!normalizedValue) {
    return undefined;
  }

  if (!/^\d+(\.\d{1,10})?$/.test(normalizedValue)) {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

export function BtcAssetsPage() {
  const queryClient = useQueryClient();
  const [rotulo, setRotulo] = useState('');
  const [quantidadeBtc, setQuantidadeBtc] = useState('');
  const [precoMedioCompra, setPrecoMedioCompra] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.btc.assets,
    queryFn: getBtcAssets,
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationMessage(null);
    setSuccessMessage(null);
    setSubmitError(null);

    const trimmedLabel = rotulo.trim();
    const parsedBtcAmount = parseDecimalInput(quantidadeBtc);
    const parsedAveragePrice = parseDecimalInput(precoMedioCompra);
    const normalizedCurrency = moeda.trim().toUpperCase() || 'BRL';

    if (!trimmedLabel) {
      setValidationMessage('Informe um nome para identificar o ativo.');
      return;
    }

    if (parsedBtcAmount === undefined || !Number.isFinite(parsedBtcAmount) || parsedBtcAmount < 0) {
      setValidationMessage(`Informe a quantidade em BTC com vírgula ou ponto e até ${MAX_BTC_DECIMALS} casas decimais.`);
      return;
    }

    if (parsedAveragePrice !== undefined && (!Number.isFinite(parsedAveragePrice) || parsedAveragePrice < 0)) {
      setValidationMessage(`Informe um preço médio válido, com vírgula ou ponto e até ${MAX_BTC_DECIMALS} casas decimais.`);
      return;
    }

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setValidationMessage('Informe a moeda com três letras, como BRL ou USD.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedSatoshis = Math.round(parsedBtcAmount * SATOSHIS_PER_BTC);

      await createBtcAsset({
        rotulo: trimmedLabel,
        quantidade_satoshis: parsedSatoshis,
        preco_medio_compra: parsedAveragePrice,
        moeda: normalizedCurrency,
      });
      setRotulo('');
      setQuantidadeBtc('');
      setPrecoMedioCompra('');
      setMoeda('BRL');
      setSuccessMessage('Ativo BTC cadastrado com sucesso.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.btc.assets }),
        queryClient.invalidateQueries({ queryKey: queryKeys.btc.dashboard }),
      ]);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Ativos BTC"
        description="Cadastre manualmente seus ativos em BTC e acompanhe as posições vinculadas ao seu usuário."
      />
      <Card>
        <div className="section-heading">
          <div>
            <span className="kpi-label">Cadastro manual</span>
            <h2>Novo ativo BTC</h2>
          </div>
          <WalletCards size={22} aria-hidden="true" />
        </div>
        {validationMessage ? <Alert title="Dados inválidos" message={validationMessage} /> : null}
        {submitError ? <Alert error={submitError} /> : null}
        {successMessage ? (
          <div className="success-message" role="status">
            <Plus size={18} aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        ) : null}
        <form className="form btc-asset-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome do ativo</span>
            <input
              autoComplete="off"
              onChange={(event) => setRotulo(event.target.value)}
              placeholder="Carteira principal, corretora, hardware wallet..."
              type="text"
              value={rotulo}
            />
          </label>
          <label className="field">
            <span>Quantidade em BTC</span>
            <input
              autoComplete="off"
              inputMode="decimal"
              onChange={(event) => setQuantidadeBtc(event.target.value)}
              placeholder="Ex.: 0,01667365"
              type="text"
              value={quantidadeBtc}
            />
          </label>
          <label className="field">
            <span>Preço médio de compra</span>
            <input
              autoComplete="off"
              inputMode="decimal"
              onChange={(event) => setPrecoMedioCompra(event.target.value)}
              placeholder="Opcional"
              type="text"
              value={precoMedioCompra}
            />
          </label>
          <label className="field">
            <span>Moeda</span>
            <input
              autoCapitalize="characters"
              maxLength={3}
              onChange={(event) => setMoeda(event.target.value)}
              type="text"
              value={moeda}
            />
          </label>
          <Button disabled={isSubmitting} icon={<Plus size={18} />} type="submit">
            {isSubmitting ? 'Salvando...' : 'Cadastrar ativo'}
          </Button>
        </form>
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
