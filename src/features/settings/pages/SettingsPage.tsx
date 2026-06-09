import { useQuery } from '@tanstack/react-query';
import { Monitor, Moon, Sun } from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../app/providers/useTheme';
import { queryKeys } from '../../../config/queryKeys';
import { getSettings } from '../api/settingsApi';

export function SettingsPage() {
  const { mode, setMode } = useTheme();
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.settings.current,
    queryFn: getSettings,
  });

  return (
    <section className="page-stack">
      <PageHeader
        title="Configurações"
        description="Preferências da conta, exibição e base regional."
      />
      {isLoading ? <Skeleton lines={5} /> : null}
      {error ? <Alert error={error} /> : null}
      <div className="settings-grid">
        <Card>
          <h2>Tema</h2>
          <p className="muted">Escolha como o CFP deve aparecer neste navegador.</p>
          <div className="segmented-control" role="group" aria-label="Tema">
            <Button type="button" variant={mode === 'light' ? 'primary' : 'secondary'} icon={<Sun size={17} />} onClick={() => setMode('light')}>
              Claro
            </Button>
            <Button type="button" variant={mode === 'dark' ? 'primary' : 'secondary'} icon={<Moon size={17} />} onClick={() => setMode('dark')}>
              Escuro
            </Button>
            <Button type="button" variant={mode === 'system' ? 'primary' : 'secondary'} icon={<Monitor size={17} />} onClick={() => setMode('system')}>
              Sistema
            </Button>
          </div>
        </Card>
        <Card>
          <h2>Preferências da API</h2>
          <dl className="details-list">
            <div>
              <dt>Moeda padrão</dt>
              <dd>{data?.moeda_padrao ?? 'BRL'}</dd>
            </div>
            <div>
              <dt>Fuso horário</dt>
              <dd>{data?.fuso_horario ?? 'America/Sao_Paulo'}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </section>
  );
}
