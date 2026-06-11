import { ShieldCheck, UserCog } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useAuth } from '../../auth/useAuth';
import { updateUserProfile, type UserProfile } from '../api/usersApi';

export function UserProfilesPage() {
  const { refreshUser, user } = useAuth();
  const [userId, setUserId] = useState('');
  const [perfil, setPerfil] = useState<UserProfile>('usuario');
  const [error, setError] = useState<unknown>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setValidationMessage(null);
    setSuccessMessage(null);

    const parsedUserId = Number(userId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setValidationMessage('Informe um ID de usuário válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateUserProfile(parsedUserId, perfil);
      setSuccessMessage(`Perfil de ${updatedUser.nome ?? updatedUser.email} atualizado para ${perfil}.`);

      if (updatedUser.id === user?.id) {
        await refreshUser();
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-stack">
      <PageHeader
        title="Perfis de usuários"
        description="Altere o perfil de acesso de usuários entre administrador e usuário padrão."
      />
      <div className="settings-grid">
        <Card>
          <div className="section-heading">
            <div>
              <span className="kpi-label">Administração</span>
              <h2>Ajustar perfil</h2>
            </div>
            <UserCog size={22} aria-hidden="true" />
          </div>
          {validationMessage ? <Alert title="Dados inválidos" message={validationMessage} /> : null}
          {error ? <Alert error={error} /> : null}
          {successMessage ? (
            <div className="success-message" role="status">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          ) : null}
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>ID do usuário</span>
              <input
                inputMode="numeric"
                min={1}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Ex.: 12"
                type="number"
                value={userId}
              />
            </label>
            <label className="field">
              <span>Perfil</span>
              <select onChange={(event) => setPerfil(event.target.value as UserProfile)} value={perfil}>
                <option value="usuario">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Button disabled={isSubmitting} icon={<ShieldCheck size={18} />} type="submit">
              {isSubmitting ? 'Atualizando...' : 'Atualizar perfil'}
            </Button>
          </form>
        </Card>
        <Card>
          <h2>Meu acesso</h2>
          <dl className="details-list">
            <div>
              <dt>Usuário logado</dt>
              <dd>{user?.nome ?? user?.email ?? '-'}</dd>
            </div>
            <div>
              <dt>Perfil atual</dt>
              <dd>
                <Badge tone={user?.perfil === 'admin' ? 'success' : 'neutral'}>
                  {user?.perfil === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </section>
  );
}
