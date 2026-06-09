import { Link } from 'react-router';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe no CFP.</p>
      <Link to="/dashboard">
        <Button type="button">Voltar ao dashboard</Button>
      </Link>
    </main>
  );
}
