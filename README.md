# CFP Frontend

Frontend React Web para o Controle Financeiro Pessoal, consumindo a API Laravel do `cfp-backend`.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Docker

## Requisitos

- Node.js 22+
- npm
- Docker e Docker Compose

## Variaveis de Ambiente

Crie um arquivo `.env.local` quando precisar sobrescrever os valores padrao:

```bash
cp .env.example .env.local
```

Variaveis principais:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=CFP
```

## Rodar Localmente com Node

```bash
npm install
npm run dev
```

A aplicacao fica disponivel em:

```text
http://localhost:5173
```

## Rodar Localmente com Docker

```bash
docker compose up -d --build
```

Parar o container:

```bash
docker compose down
```

## Qualidade

```bash
npm run lint
npm run typecheck
npm run build
```

## Documentacao

A arquitetura do frontend esta em:

```text
docs/ARCHITECTURE.md
```
