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
  quantidade_btc: string;
  preco_medio_compra?: string | null;
  moeda: string;
};

export type BtcAddressBalance = {
  address: string;
  confirmed_balance_sats: number;
  confirmed_balance_btc: string;
  mempool_balance_sats: number;
  mempool_balance_btc: string;
  total_balance_sats: number;
  total_balance_btc: string;
  transaction_count: {
    confirmed: number;
    mempool: number;
  };
  source: string;
};

export type BtcDashboard = {
  moeda: string;
  preco_mais_recente?: BtcPriceSnapshot | null;
  total_btc: string;
  valor_estimado?: string | null;
  ativos: BtcAsset[];
};
