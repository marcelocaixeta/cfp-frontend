import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router';
import { z } from 'zod';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { resetPassword } from '../api/authApi';
import { AuthLayout } from './AuthLayout';

const schema = z
  .object({
    token: z.string().min(1, 'Use o link recebido por email.'),
    email: z.email('Informe um email válido.'),
    senha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
    senha_confirmation: z.string().min(8, 'Confirme a senha.'),
  })
  .refine((data) => data.senha === data.senha_confirmation, {
    message: 'As senhas precisam ser iguais.',
    path: ['senha_confirmation'],
  });

type ResetPasswordForm = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);
  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';
  const isLinkIncomplete = !token || !email;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
    defaultValues: { token, email, senha: '', senha_confirmation: '' },
  });

  async function onSubmit(input: ResetPasswordForm) {
    setError(null);
    setMessage(null);
    await resetPassword(input).then(setMessage, (requestError) => setError(requestError));
  }

  return (
    <AuthLayout title="Redefinir senha" description="Crie uma nova senha para recuperar o acesso à sua conta.">
      {isLinkIncomplete ? (
        <Alert message="O link de redefinição está incompleto. Solicite um novo link antes de continuar." />
      ) : null}
      {error ? <Alert error={error} /> : null}
      {message ? (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{message}</span>
        </div>
      ) : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('token')} />
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" type="email" {...register('email')} />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>
        <label className="field">
          <span>Nova senha</span>
          <input autoComplete="new-password" type="password" {...register('senha')} />
          {errors.senha ? <small>{errors.senha.message}</small> : null}
        </label>
        <label className="field">
          <span>Confirmar nova senha</span>
          <input autoComplete="new-password" type="password" {...register('senha_confirmation')} />
          {errors.senha_confirmation ? <small>{errors.senha_confirmation.message}</small> : null}
        </label>
        {errors.token ? <small>{errors.token.message}</small> : null}
        <Button disabled={isSubmitting || isLinkIncomplete || Boolean(message)} icon={<KeyRound size={18} />} type="submit">
          {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/login">Voltar para login</Link>
        <Link to="/esqueci-senha">Pedir novo link</Link>
      </div>
    </AuthLayout>
  );
}
