export type User = {
  id: number;
  nome?: string;
  name?: string;
  email: string;
  perfil?: 'admin' | 'usuario';
};

export type AuthResponse = {
  data?: {
    user?: User;
    usuario?: User;
    token?: string;
    access_token?: string;
  };
  user?: User;
  usuario?: User;
  token?: string;
  access_token?: string;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type RegisterInput = {
  nome: string;
  email: string;
  senha: string;
  senha_confirmation: string;
};
