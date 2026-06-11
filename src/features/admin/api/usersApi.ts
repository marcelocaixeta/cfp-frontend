import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type { User } from '../../auth/types';

export type UserProfile = 'admin' | 'usuario';

type UsersPayload = User[] | {
  data: User[];
};

function unwrapUsers(payload: ApiEnvelope<UsersPayload> | UsersPayload) {
  const data = 'data' in payload ? payload.data : payload;
  return Array.isArray(data) ? data : data.data;
}

export async function getUsers() {
  return unwrapUsers(await apiRequest<ApiEnvelope<UsersPayload> | UsersPayload>('/users'));
}

export async function updateUserProfile(userId: number, perfil: UserProfile) {
  const response = await apiRequest<ApiEnvelope<User>>(`/users/${userId}/profile`, {
    method: 'PATCH',
    body: { perfil },
  });

  return response.data;
}
