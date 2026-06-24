import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { defaultAuthenticatedRoute } from '../../../config/routes';
import { useAuth } from '../useAuth';
import { AuthLayout } from './AuthLayout';

const schema = z
  .object({
    nome: z.string().min(2, 'Informe seu nome.'),
    email: z.email('Informe um email válido.'),
    senha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
    senha_confirmation: z.string().min(8, 'Confirme a senha.'),
  })
  .refine((data) => data.senha === data.senha_confirmation, {
    message: 'As senhas precisam ser iguais.',
    path: ['senha_confirmation'],
  });

type RegisterForm = z.infer<typeof schema>;

export function RegisterPage() {
  const [error, setError] = useState<unknown>(null);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  async function onSubmit(input: RegisterForm) {
    setError(null);
    await registerUser(input).then(
      () => navigate(defaultAuthenticatedRoute, { replace: true }),
      (requestError) => setError(requestError),
    );
  }

  return (
    <AuthLayout title="Criar conta" description="Comece com um acesso próprio para manter seus dados isolados.">
      {error ? <Alert error={error} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Nome</span>
          <input autoComplete="name" type="text" {...register('nome')} />
          {errors.nome ? <small>{errors.nome.message}</small> : null}
        </label>
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" type="email" {...register('email')} />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>
        <label className="field">
          <span>Senha</span>
          <input autoComplete="new-password" type="password" {...register('senha')} />
          {errors.senha ? <small>{errors.senha.message}</small> : null}
        </label>
        <label className="field">
          <span>Confirmar senha</span>
          <input autoComplete="new-password" type="password" {...register('senha_confirmation')} />
          {errors.senha_confirmation ? <small>{errors.senha_confirmation.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<UserPlus size={18} />} type="submit">
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/login">Já tenho conta</Link>
      </div>
    </AuthLayout>
  );
}
