export type ValidationErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  errors?: ValidationErrors;

  constructor(message: string, status: number, errors?: ValidationErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Sua sessão expirou. Entre novamente.';
    if (error.status === 403) return 'Você não tem permissão para esta ação.';
    if (error.status === 404) return 'Não encontramos esse recurso.';
    if (error.status === 422) return 'Confira os campos destacados.';
    if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    if (error.status >= 500) return 'A API encontrou uma instabilidade. Tente novamente.';
    return error.message;
  }

  return 'Não foi possível completar a operação.';
}
