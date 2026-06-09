import { AlertTriangle } from 'lucide-react';
import { getFriendlyErrorMessage } from '../../lib/api/apiErrors';

type AlertProps = {
  title?: string;
  error?: unknown;
  message?: string;
};

export function Alert({ error, message, title = 'Algo não saiu como esperado' }: AlertProps) {
  return (
    <div className="alert" role="alert">
      <AlertTriangle size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{message ?? getFriendlyErrorMessage(error)}</p>
      </div>
    </div>
  );
}
