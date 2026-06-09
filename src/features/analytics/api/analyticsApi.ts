import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { AnalyticsOverview } from '../types';

export async function getAnalyticsOverview() {
  const response = await apiRequest<ApiEnvelope<AnalyticsOverview>>('/analytics/overview');
  return response.data;
}
