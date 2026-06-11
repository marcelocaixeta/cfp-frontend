import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, UserCog } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { queryKeys } from '../../../config/queryKeys';
import { useAuth } from '../../auth/useAuth';
import { getUsers, updateUserProfile, type UserProfile } from '../api/usersApi';

export function UserProfilesPage() {
  const { refreshUser, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [perfil, setPerfil] = useState<UserProfile>('usuario');
  const [error, setError] = useState<unknown>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: users,
    error: usersError,
    isLoading: isLoadingUsers,
  } = useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: getUsers,
  });

  const effectiveSelectedUserId = selectedUserId || (users?.[0] ? String(users[0].id) : '');
  const selectedUser = useMemo(
    () => users?.find((currentUser) => String(currentUser.id) === effectiveSelectedUserId),
    [effectiveSelectedUserId, users],
  );
  const effectiveProfile = selectedUserId ? perfil : selectedUser?.perfil ?? perfil;

  function handleUserChange(nextUserId: string) {
    const nextUser = users?.find((currentUser) => String(currentUser.id) === nextUserId);
    setSelectedUserId(nextUserId);
    setPerfil(nextUser?.perfil ?? 'usuario');
    setValidationMessage(null);
    setSuccessMessage(null);
  }

  function handleProfileChange(nextProfile: UserProfile) {
    if (!selectedUserId && effectiveSelectedUserId) {
      setSelectedUserId(effectiveSelectedUserId);
    }

    setPerfil(nextProfile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setValidationMessage(null);
    setSuccessMessage(null);

    const parsedUserId = Number(effectiveSelectedUserId);

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setValidationMessage('Selecione um usuário válido.');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await updateUserProfile(parsedUserId, effectiveProfile);
      setSuccessMessage(`Perfil de ${updatedUser.nome ?? updatedUser.email} atualizado para ${effectiveProfile}.`);
      queryClient.setQueryData(queryKeys.admin.users, (currentUsers: typeof users) =>
        currentUsers?.map((currentUser) => (currentUser.id === updatedUser.id ? updatedUser : currentUser)),
      );

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
          {isLoadingUsers ? <Skeleton lines={3} /> : null}
          {usersError ? <Alert error={usersError} /> : null}
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
              <span>Usuário</span>
              <select
                disabled={isLoadingUsers || !users?.length}
                onChange={(event) => handleUserChange(event.target.value)}
                value={effectiveSelectedUserId}
              >
                {!users?.length ? <option value="">Nenhum usuário disponível</option> : null}
                {users?.map((currentUser) => (
                  <option key={currentUser.id} value={currentUser.id}>
                    {currentUser.nome ?? currentUser.name ?? currentUser.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Perfil</span>
              <select onChange={(event) => handleProfileChange(event.target.value as UserProfile)} value={effectiveProfile}>
                <option value="usuario">Usuário</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <Button disabled={isSubmitting || isLoadingUsers || !users?.length} icon={<ShieldCheck size={18} />} type="submit">
              {isSubmitting ? 'Atualizando...' : 'Atualizar perfil'}
            </Button>
          </form>
          {selectedUser ? (
            <dl className="details-list">
              <div>
                <dt>E-mail</dt>
                <dd>{selectedUser.email}</dd>
              </div>
              <div>
                <dt>Perfil atual</dt>
                <dd>{selectedUser.perfil === 'admin' ? 'Admin' : 'Usuário'}</dd>
              </div>
            </dl>
          ) : null}
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
