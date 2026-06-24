import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { z } from 'zod';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { defaultAuthenticatedRoute } from '../../../config/routes';
import { useAuth } from '../useAuth';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  email: z.email('Informe um email válido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const [error, setError] = useState<unknown>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? defaultAuthenticatedRoute;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginForm>({ resolver: zodResolver(schema) });

  async function onSubmit(input: LoginForm) {
    setError(null);
    await login(input).then(
      () => navigate(from, { replace: true }),
      (requestError) => setError(requestError),
    );
  }

  return (
    <AuthLayout title="Entrar" description="Acesse sua área financeira com o email cadastrado.">
      {error ? <Alert error={error} /> : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" type="email" {...register('email')} />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>
        <label className="field">
          <span>Senha</span>
          <input autoComplete="current-password" type="password" {...register('senha')} />
          {errors.senha ? <small>{errors.senha.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<LogIn size={18} />} type="submit">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/cadastro">Criar conta</Link>
        <Link to="/esqueci-senha">Esqueci minha senha</Link>
      </div>
    </AuthLayout>
  );
}
