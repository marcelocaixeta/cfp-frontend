import type { ReactNode } from 'react';
import { env } from '../../../config/env';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
  description: string;
};

export function AuthLayout({ children, description, title }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-page__intro">
        <div className="brand brand--large">
          <span className="brand__mark">C</span>
          <span>{env.appName}</span>
        </div>
        <h1>Finanças pessoais e ativos financeiros em uma rotina mais clara.</h1>
        <p>Organize cartões, dívidas, empréstimos, ativos e suporte em uma interface feita para consultar e agir rápido.</p>
      </section>
      <section className="auth-card" aria-labelledby="auth-title">
        <h2 id="auth-title">{title}</h2>
        <p>{description}</p>
        {children}
      </section>
    </main>
  );
}
