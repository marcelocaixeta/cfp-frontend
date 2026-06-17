export type BtcPriceSnapshot = {
  id: number;
  provedor: string;
  moeda: string;
  preco: string;
  capturado_em: string;
};

export type BtcAsset = {
  id: number;
  rotulo: string;
  tipo_ativo?: 'BTC' | 'RENDA_FIXA' | 'RENDA_VARIAVEL';
  quantidade_satoshis?: number | string | null;
  quantidade_btc?: string;
  preco_medio_compra?: string | null;
  valor_investido?: string | null;
  valor_atual?: string | null;
  moeda: string;
};

export type BtcDashboard = {
  moeda: string;
  preco_mais_recente?: BtcPriceSnapshot | null;
  total_btc: string;
  valor_estimado?: string | null;
  ativos: BtcAsset[];
};
