import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type { BtcAsset, BtcDashboard } from '../types';

export async function getBtcDashboard() {
  const response = await apiRequest<ApiEnvelope<BtcDashboard>>('/btc/dashboard');
  return response.data;
}

export async function getBtcAssets() {
  const response = await apiRequest<PaginatedEnvelope<BtcAsset>>('/btc/assets');
  return response.data;
}

export async function createBtcAsset(data: {
  rotulo: string;
  tipo_ativo: 'BTC' | 'RENDA_FIXA' | 'RENDA_VARIAVEL';
  quantidade_satoshis?: number;
  preco_medio_compra?: number;
  valor_investido?: number;
  valor_atual?: number;
  moeda?: string;
}) {
  const response = await apiRequest<ApiEnvelope<BtcAsset>>('/btc/assets', {
    method: 'POST',
    body: data,
  });
  return response.data;
}
