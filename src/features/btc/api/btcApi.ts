import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { PaginatedEnvelope } from '../../../lib/api/pagination';
import type { BtcAddressBalance, BtcAsset, BtcDashboard } from '../types';

export async function getBtcDashboard() {
  const response = await apiRequest<ApiEnvelope<BtcDashboard>>('/btc/dashboard');
  return response.data;
}

export async function getBtcAssets() {
  const response = await apiRequest<PaginatedEnvelope<BtcAsset>>('/btc/assets');
  return response.data;
}

export async function getBtcAddressBalance(address?: string) {
  const params = new URLSearchParams();

  if (address?.trim()) {
    params.set('address', address.trim());
  }

  const queryString = params.toString();
  const response = await apiRequest<ApiEnvelope<BtcAddressBalance>>(
    `/btc/address-balance${queryString ? `?${queryString}` : ''}`,
  );

  return response.data;
}
