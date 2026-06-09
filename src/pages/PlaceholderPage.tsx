import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <section className="page-stack">
      <PageHeader title={title} description={description ?? 'Tela reservada para a próxima etapa de implementação.'} />
      <Card>
        <p className="muted">A rota já existe para manter a navegação completa conforme a arquitetura.</p>
      </Card>
    </section>
  );
}
