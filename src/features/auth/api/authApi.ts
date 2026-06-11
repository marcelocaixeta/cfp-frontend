import { apiRequest, type ApiEnvelope } from '../../../lib/api/apiClient';
import type {
  AuthResponse,
  ForgotPasswordInput,
  LoginInput,
  MessageResponse,
  RegisterInput,
  ResetPasswordInput,
  User,
} from '../types';

function unwrapAuth(response: AuthResponse) {
  const payload = response.data ?? response;
  return {
    user: payload.user ?? payload.usuario,
    token: payload.token ?? payload.access_token,
  };
}

function unwrapMessage(response: MessageResponse) {
  const payload = response.data ?? response;
  return payload.message ?? 'Solicitação concluída com sucesso.';
}

export async function login(input: LoginInput) {
  return unwrapAuth(await apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input, skipAuth: true }));
}

export async function register(input: RegisterInput) {
  return unwrapAuth(await apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: input, skipAuth: true }));
}

export async function forgotPassword(input: ForgotPasswordInput) {
  return unwrapMessage(
    await apiRequest<MessageResponse>('/auth/forgot-password', { method: 'POST', body: input, skipAuth: true }),
  );
}

export async function resetPassword(input: ResetPasswordInput) {
  return unwrapMessage(
    await apiRequest<MessageResponse>('/auth/reset-password', { method: 'POST', body: input, skipAuth: true }),
  );
}

export async function logout() {
  await apiRequest<void>('/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  const response = await apiRequest<ApiEnvelope<User> | User>('/me');
  return 'data' in response ? response.data : response;
}
