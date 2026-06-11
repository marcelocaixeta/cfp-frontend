import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { z } from 'zod';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { forgotPassword } from '../api/authApi';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  email: z.email('Informe um email válido.'),
});

type ForgotPasswordForm = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [error, setError] = useState<unknown>(null);
  const [message, setMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(schema) });

  async function onSubmit(input: ForgotPasswordForm) {
    setError(null);
    setMessage(null);
    await forgotPassword(input).then(setMessage, (requestError) => setError(requestError));
  }

  return (
    <AuthLayout title="Recuperar senha" description="Informe o email da sua conta para receber o link de redefinição.">
      {error ? <Alert error={error} /> : null}
      {message ? (
        <div className="success-message" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{message}</span>
        </div>
      ) : null}
      <form className="form" onSubmit={handleSubmit(onSubmit)}>
        <label className="field">
          <span>Email</span>
          <input autoComplete="email" type="email" {...register('email')} />
          {errors.email ? <small>{errors.email.message}</small> : null}
        </label>
        <Button disabled={isSubmitting} icon={<Mail size={18} />} type="submit">
          {isSubmitting ? 'Enviando...' : 'Enviar link'}
        </Button>
      </form>
      <div className="auth-links">
        <Link to="/login">Voltar para login</Link>
        <Link to="/cadastro">Criar conta</Link>
      </div>
    </AuthLayout>
  );
}
