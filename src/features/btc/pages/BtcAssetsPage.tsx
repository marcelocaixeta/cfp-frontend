import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, WalletCards } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { formatCurrency } from '../../../lib/formatting/currency';
import { formatBtc, formatNumber } from '../../../lib/formatting/number';
import { createBtcAsset, deleteBtcAsset, getBtcAssets } from '../api/btcApi';
import type { BtcAsset } from '../types';

const SATOSHIS_PER_BTC = 100_000_000;
const MAX_BTC_DECIMALS = 10;
const MAX_MONEY_DECIMALS = 2;

type AssetType = NonNullable<BtcAsset['tipo_ativo']>;

const assetTypeOptions: Array<{ value: AssetType; label: string }> = [
  { value: 'BTC', label: 'BTC' },
  { value: 'RENDA_FIXA', label: 'Renda Fixa' },
  { value: 'RENDA_VARIAVEL', label: 'Renda Variável' },
];

const assetTypeLabels: Record<AssetType, string> = {
  BTC: 'BTC',
  RENDA_FIXA: 'Renda Fixa',
  RENDA_VARIAVEL: 'Renda Variável',
};

function getAssetBtc(asset: BtcAsset) {
  return asset.quantidade_btc ?? Number(asset.quantidade_satoshis ?? 0) / SATOSHIS_PER_BTC;
}

function getAssetType(asset: BtcAsset): AssetType {
  return asset.tipo_ativo ?? 'BTC';
}

function parseDecimalInput(value: string, maximumDecimals = MAX_BTC_DECIMALS) {
  const normalizedValue = value.trim().replace(',', '.');

  if (!normalizedValue) {
    return undefined;
  }

  const decimalPattern = new RegExp(`^\\d+(\\.\\d{1,${maximumDecimals}})?$`);

  if (!decimalPattern.test(normalizedValue)) {
    return Number.NaN;
  }

  return Number(normalizedValue);
}

export function BtcAssetsPage() {
  const queryClient = useQueryClient();
  const [rotulo, setRotulo] = useState('');
  const [tipoAtivo, setTipoAtivo] = useState<AssetType>('BTC');
  const [quantidadeBtc, setQuantidadeBtc] = useState('');
  const [precoMedioCompra, setPrecoMedioCompra] = useState('');
  const [valorInvestido, setValorInvestido] = useState('');
  const [valorAtual, setValorAtual] = useState('');
  const [moeda, setMoeda] = useState('BRL');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.btc.assets,
    queryFn: getBtcAssets,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBtcAsset,
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.btc.assets }),
      queryClient.invalidateQueries({ queryKey: queryKeys.btc.dashboard }),
    ]),
  });

  function handleDelete(assetId: number) {
    setSuccessMessage(null);
    setSubmitError(null);
    deleteMutation.mutate(assetId);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationMessage(null);
    setSuccessMessage(null);
    setSubmitError(null);

    const trimmedLabel = rotulo.trim();
    const parsedBtcAmount = parseDecimalInput(quantidadeBtc);
    const parsedAveragePrice = parseDecimalInput(precoMedioCompra, MAX_MONEY_DECIMALS);
    const parsedInvestedValue = parseDecimalInput(valorInvestido, MAX_MONEY_DECIMALS);
    const parsedCurrentValue = parseDecimalInput(valorAtual, MAX_MONEY_DECIMALS);
    const normalizedCurrency = moeda.trim().toUpperCase() || 'BRL';

    if (!trimmedLabel) {
      setValidationMessage('Informe um nome para identificar o ativo.');
      return;
    }

    if (tipoAtivo === 'BTC') {
      if (parsedBtcAmount === undefined || !Number.isFinite(parsedBtcAmount) || parsedBtcAmount < 0) {
        setValidationMessage(`Informe a quantidade em BTC com vírgula ou ponto e até ${MAX_BTC_DECIMALS} casas decimais.`);
        return;
      }

      if (parsedAveragePrice !== undefined && (!Number.isFinite(parsedAveragePrice) || parsedAveragePrice < 0)) {
        setValidationMessage(`Informe um preço médio válido, com vírgula ou ponto e até ${MAX_MONEY_DECIMALS} casas decimais.`);
        return;
      }
    } else {
      if (parsedInvestedValue === undefined || !Number.isFinite(parsedInvestedValue) || parsedInvestedValue < 0) {
        setValidationMessage(`Informe o valor investido com vírgula ou ponto e até ${MAX_MONEY_DECIMALS} casas decimais.`);
        return;
      }

      if (parsedCurrentValue !== undefined && (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue < 0)) {
        setValidationMessage(`Informe um valor atual válido, com vírgula ou ponto e até ${MAX_MONEY_DECIMALS} casas decimais.`);
        return;
      }
    }

    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) {
      setValidationMessage('Informe a moeda com três letras, como BRL ou USD.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedSatoshis = parsedBtcAmount === undefined ? undefined : Math.round(parsedBtcAmount * SATOSHIS_PER_BTC);

      await createBtcAsset({
        rotulo: trimmedLabel,
        tipo_ativo: tipoAtivo,
        quantidade_satoshis: tipoAtivo === 'BTC' ? parsedSatoshis : undefined,
        preco_medio_compra: tipoAtivo === 'BTC' ? parsedAveragePrice : undefined,
        valor_investido: tipoAtivo === 'BTC' ? undefined : parsedInvestedValue,
        valor_atual: tipoAtivo === 'BTC' ? undefined : parsedCurrentValue,
        moeda: normalizedCurrency,
      });
      setRotulo('');
      setTipoAtivo('BTC');
      setQuantidadeBtc('');
      setPrecoMedioCompra('');
      setValorInvestido('');
      setValorAtual('');
      setMoeda('BRL');
      setSuccessMessage('Ativo cadastrado com sucesso.');
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
        title="Ativos"
        description="Cadastre ativos financeiros pessoais classificados como BTC, Renda Fixa ou Renda Variável."
      />
      <Card>
        <div className="section-heading">
          <div>
            <span className="kpi-label">Cadastro manual</span>
            <h2>Novo ativo</h2>
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
            <span>Tipo</span>
            <select onChange={(event) => setTipoAtivo(event.target.value as AssetType)} value={tipoAtivo}>
              {assetTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {tipoAtivo === 'BTC' ? (
            <>
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
            </>
          ) : (
            <>
              <label className="field">
                <span>Valor investido</span>
                <input
                  autoComplete="off"
                  inputMode="decimal"
                  onChange={(event) => setValorInvestido(event.target.value)}
                  placeholder="Ex.: 1000,00"
                  type="text"
                  value={valorInvestido}
                />
              </label>
              <label className="field">
                <span>Valor atual</span>
                <input
                  autoComplete="off"
                  inputMode="decimal"
                  onChange={(event) => setValorAtual(event.target.value)}
                  placeholder="Opcional"
                  type="text"
                  value={valorAtual}
                />
              </label>
            </>
          )}
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
      {deleteMutation.error ? <Alert error={deleteMutation.error} /> : null}
      {data?.data.length ? (
        <div className="responsive-list">
          {data.data.map((asset) => (
            <Card className="list-card btc-asset-card" key={asset.id}>
              <div>
                <strong>{asset.rotulo}</strong>
                <span>{assetTypeLabels[getAssetType(asset)]} | {asset.moeda}</span>
              </div>
              {getAssetType(asset) === 'BTC' ? (
                <>
                  <div>
                    <strong>{formatNumber(asset.quantidade_satoshis, 0)} sats</strong>
                    <span>{formatBtc(getAssetBtc(asset))} BTC</span>
                  </div>
                  <div>
                    <strong>Preço médio</strong>
                    <span>{asset.preco_medio_compra ? formatCurrency(asset.preco_medio_compra, asset.moeda) : '-'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <strong>{formatCurrency(asset.valor_investido, asset.moeda)}</strong>
                    <span>Valor investido</span>
                  </div>
                  <div>
                    <strong>{asset.valor_atual ? formatCurrency(asset.valor_atual, asset.moeda) : '-'}</strong>
                    <span>Valor atual</span>
                  </div>
                </>
              )}
              <div className="list-card__actions" aria-label={`Ações para ${asset.rotulo}`} role="group">
                <ConfirmDialog
                  confirmLabel="Excluir ativo"
                  description={`O ativo "${asset.rotulo}" será excluído. Esta ação não pode ser desfeita.`}
                  onConfirm={() => handleDelete(asset.id)}
                  title="Excluir ativo?"
                  trigger={(
                    <button
                      aria-label={`Excluir ${asset.rotulo}`}
                      className="icon-button action-button action-button--delete"
                      disabled={deleteMutation.isPending}
                      title={`Excluir ${asset.rotulo}`}
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
          title="Sem ativos por enquanto"
          description="Quando você cadastrar ativos financeiros, eles aparecerão aqui."
          action={<Link to="/dashboard">Voltar ao dashboard</Link>}
        />
      ) : null}
    </section>
  );
}
