import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { User } from '../../auth/types';

export type UserProfile = 'admin' | 'usuario';

export async function updateUserProfile(userId: number, perfil: UserProfile) {
  const response = await apiRequest<ApiEnvelope<User>>(`/users/${userId}/profile`, {
    method: 'PATCH',
    body: { perfil },
  });

  return response.data;
}
