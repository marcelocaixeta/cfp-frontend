import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { UserSettings } from '../types';

export async function getSettings() {
  const response = await apiRequest<ApiEnvelope<UserSettings>>('/settings');
  return response.data;
}
