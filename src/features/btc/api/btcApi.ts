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
