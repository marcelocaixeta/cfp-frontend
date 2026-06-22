# Arquitetura do CFP Frontend

## Objetivo

Construir uma aplicacao React Web moderna, responsiva e acessivel para consumir a API REST do `cfp-backend`, oferecendo uma experiencia clara para controle financeiro pessoal, acompanhamento de Bitcoin, analises, configuracoes e suporte.

O frontend deve ser uma Single Page Application independente do backend, preparada para rodar localmente em Vite e para ser publicada como artefatos estaticos em um servidor web ou plataforma de hospedagem. A comunicacao com o Laravel deve acontecer via HTTP em `/api/v1`, usando token Bearer emitido pelo Laravel Sanctum.

Areas iniciais da aplicacao:

- Autenticacao e cadastro
- Dashboard BTC
- Analises
- Financas Pessoais
- Configuracoes
- Suporte

## Stack Recomendada

| Camada | Tecnologia |
| --- | --- |
| UI | React 19.2+ |
| Linguagem | TypeScript 5.9+ |
| Build tool | Vite 8+ com template `react-ts` |
| Rotas | React Router 7+ |
| Requisicoes HTTP | TanStack Query 5+ e `fetch` encapsulado |
| Formularios | React Hook Form 7+ |
| Validacao | Zod 4+ |
| Estilos | CSS Modules ou CSS organizado por design tokens |
| Graficos | Recharts ou Tremor Charts |
| Icones | Lucide React |
| Testes | Vitest, React Testing Library e Playwright |
| Qualidade | ESLint, Prettier e TypeScript strict |
| Containerizacao | Docker + Docker Compose para desenvolvimento local |

React 19.2 e Vite 8 eram as referencias estaveis recentes em 9 de junho de 2026. O projeto deve usar constraints compativeis, por exemplo `^19.2.0` para React e `^8.0.0` para Vite, evitando travar em uma versao exata sem necessidade.

## Visao Geral

```text
Browser
  |
  v
React 19 + Vite
  |
  +-- Rotas publicas
  |     +-- Login
  |     +-- Cadastro
  |
  +-- Rotas autenticadas
        +-- Dashboard BTC
        +-- Analises
        +-- Financas Pessoais
        +-- Configuracoes
        +-- Suporte
  |
  v
Laravel API /api/v1
```

Ambiente Docker local:

```text
cfp-frontend
  |
  +-- frontend: Vite dev server em http://localhost:5173

cfp-backend
  |
  +-- backend: Laravel API em http://localhost:8000/api/v1
  +-- postgres: PostgreSQL
```

O frontend nao deve depender do repositorio do backend para compilar. A integracao entre os projetos deve acontecer por variaveis de ambiente e contrato HTTP.

## Principios Arquiteturais

- API first: telas consomem endpoints versionados do Laravel em `/api/v1`.
- Separacao por features: codigo agrupado por dominio funcional, nao por tipo tecnico global.
- UI orientada a tarefas: cada tela deve favorecer leitura rapida, acoes claras e baixo atrito em mobile.
- Autenticacao centralizada: token e usuario autenticado ficam sob responsabilidade de um modulo de auth.
- Dados remotos com cache controlado: consultas usam TanStack Query, mutations invalidam chaves relacionadas.
- Formulario previsivel: React Hook Form + Zod para validacao local antes de enviar ao backend.
- Tema por tokens: modo claro/escuro baseado em CSS variables, respeitando preferencia do sistema e escolha do usuario.
- Responsividade mobile first: navegacao, tabelas, cards e formularios devem funcionar primeiro em telas pequenas.
- Acessibilidade basica obrigatoria: foco visivel, contraste adequado, labels reais, landmarks e estados de erro legiveis.
- Evolucao incremental: comecar com SPA client-side; avaliar SSR ou framework full-stack somente se houver necessidade real.

## Estrutura de Pastas Recomendada

```text
docs/
  ARCHITECTURE.md
public/
src/
  app/
    App.tsx
    providers/
      AppProviders.tsx
      QueryProvider.tsx
      ThemeProvider.tsx
    router/
      routes.tsx
      ProtectedRoute.tsx
  assets/
  components/
    charts/
    feedback/
    forms/
    layout/
    navigation/
    ui/
  config/
    env.ts
    queryKeys.ts
  features/
    analytics/
      api/
      components/
      pages/
      types.ts
    auth/
      api/
      components/
      pages/
      schemas.ts
      types.ts
    btc/
      api/
      components/
      pages/
      types.ts
    finance/
      api/
      components/
      pages/
      schemas.ts
      types.ts
    settings/
      api/
      components/
      pages/
      schemas.ts
      types.ts
    support/
      api/
      components/
      pages/
      schemas.ts
      types.ts
  hooks/
  lib/
    api/
      apiClient.ts
      apiErrors.ts
      authToken.ts
    formatting/
      currency.ts
      date.ts
      number.ts
  styles/
    globals.css
    tokens.css
    utilities.css
  test/
    render.tsx
  main.tsx
  vite-env.d.ts
```

### Padrao de Implementacao

- `features/*/api`: funcoes que chamam endpoints do Laravel e retornam tipos do dominio.
- `features/*/pages`: componentes usados diretamente nas rotas.
- `features/*/components`: componentes internos da feature.
- `components/ui`: componentes genericos pequenos, como Button, Input, Dialog, Badge e Tabs.
- `components/layout`: AppShell, Sidebar, Topbar, MobileNav e PageHeader.
- `lib/api/apiClient.ts`: unico ponto para montar URL base, headers, token, tratamento de erro e parse JSON.
- `config/queryKeys.ts`: chaves estaveis de cache para TanStack Query.
- `styles/tokens.css`: cores, espacamentos, raios, sombras, z-index e tokens de tema.

Controllers, models e migrations pertencem ao backend; o frontend deve trabalhar com tipos TypeScript derivados do contrato da API e nao duplicar regra de negocio sensivel.

## Variaveis de Ambiente

Arquivo local:

```text
.env.local
```

Variaveis:

```text
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=CFP
```

Regras:

- Toda variavel exposta ao browser deve iniciar com `VITE_`.
- Segredos nunca devem ser colocados no frontend.
- A URL base deve apontar para `/api/v1`, nao apenas `/api`.
- Em producao, `VITE_API_BASE_URL` deve apontar para o dominio publico da API Laravel.

## Cliente HTTP

O frontend deve encapsular `fetch` em `src/lib/api/apiClient.ts`:

```text
apiClient.request(path, options)
  |
  +-- prefixa VITE_API_BASE_URL
  +-- adiciona Accept: application/json
  +-- adiciona Content-Type em payload JSON
  +-- adiciona Authorization: Bearer <token> quando existir
  +-- trata 401 removendo sessao local e redirecionando para login
  +-- converte erros de validacao 422 para um formato consumivel por formularios
```

Padrao de resposta esperado do backend:

```json
{
  "data": {}
}
```

Erros de validacao devem ser tratados no formato comum do Laravel:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["O campo email e obrigatorio."]
  }
}
```

## Autenticacao

O backend usa Laravel Sanctum com tokens de API. O frontend deve armazenar o token inicialmente em `localStorage`, com uma camada `authToken.ts` para permitir troca futura para cookie httpOnly se a estrategia mudar.

Fluxo:

```text
Login/Cadastro
  |
  v
POST /auth/login ou POST /auth/register
  |
  v
Salvar token + usuario em estado de auth
  |
  v
Carregar rota autenticada
```

Regras:

- Nao enviar `usuario_id` em operacoes de dominio; o backend identifica o usuario pelo token.
- Ao receber 401, limpar sessao local e enviar o usuario para `/login`.
- Rotas privadas devem passar por `ProtectedRoute`.
- A tela de login deve preservar `redirectTo` quando o usuario tentou acessar uma pagina privada.

## Rotas da Aplicacao

Rotas publicas:

| Rota | Pagina | Objetivo |
| --- | --- | --- |
| `/login` | `LoginPage` | Entrar com email e senha |
| `/cadastro` | `RegisterPage` | Criar conta |
| `/esqueci-senha` | `PlaceholderPage` | Preparada para recuperacao futura |

Rotas autenticadas:

| Rota | Pagina | Endpoint principal |
| --- | --- | --- |
| `/` | `HomeRedirect` | Redireciona para `/dashboard` |
| `/dashboard` | `BtcDashboardPage` | `GET /btc/dashboard` |
| `/btc/ativos` | `BtcAssetsPage` | `GET /btc/assets`, `POST /btc/assets` |
| `/analises` | `AnalyticsOverviewPage` | `GET /analytics/overview` |
| `/financas` | `FinanceSummaryPage` | `GET /finance/summary` |
| `/financas/cartoes` | `CreditCardsPage` | `GET /finance/credit-cards` |
| `/financas/cartoes/novo` | `CreditCardFormPage` | `POST /finance/credit-cards` |
| `/financas/cartoes/:id` | `PlaceholderPage` | Preparada para detalhe futuro do cartao |
| `/financas/dividas-cartao` | `CreditCardDebtsPage` | `GET /finance/credit-card-debts` |
| `/financas/dividas-cartao/nova` | `CreditCardDebtFormPage` | `POST /finance/credit-card-debts` |
| `/financas/dividas-cartao/:id` | `PlaceholderPage` | Preparada para detalhe futuro da divida |
| `/financas/emprestimos` | `LoansPage` | `GET /finance/loans` |
| `/financas/emprestimos/novo` | `LoanFormPage` | `POST /finance/loans` |
| `/financas/emprestimos/:id` | `LoanFormPage` | `GET /finance/loans/{loan}`, `PATCH /finance/loans/{loan}`, `DELETE /finance/loans/{loan}` |
| `/configuracoes` | `SettingsPage` | `GET /settings` |
| `/admin/perfis` | `UserProfilesPage` | `GET /users`, `PATCH /users/{user}/profile` |
| `/admin/suporte` | `AdminSupportTicketsPage` | `GET /support/tickets/all`, `POST /support/tickets/{supportTicket}/messages`, `PATCH /support/tickets/{supportTicket}/resolve` |
| `/suporte` | `SupportTicketsPage` | `GET /support/tickets` |
| `/suporte/novo` | `SupportTicketFormPage` | `POST /support/tickets` |
| `/suporte/:id` | `PlaceholderPage` | Preparada para detalhe futuro do chamado |
| `/perfil` | `PlaceholderPage` | Preparada para perfil futuro |

Rotas de fallback:

| Rota | Pagina | Objetivo |
| --- | --- | --- |
| `*` | `NotFoundPage` | Informar que a pagina nao existe |

## Mapa de Endpoints Consumidos

Base URL local:

```text
http://localhost:8000/api/v1
```

Endpoints publicos:

```text
POST   /auth/register
POST   /auth/login
```

Endpoints autenticados:

```text
POST   /auth/logout
GET    /me

GET    /users
PATCH  /users/{user}/profile

GET    /finance/summary
GET    /finance/current-week-due-dates

GET    /finance/credit-cards
POST   /finance/credit-cards

GET    /finance/credit-card-debts
POST   /finance/credit-card-debts

GET    /finance/loans
POST   /finance/loans
GET    /finance/loans/{loan}
PATCH  /finance/loans/{loan}
DELETE /finance/loans/{loan}

GET    /btc/dashboard
GET    /btc/assets
POST   /btc/assets

GET    /analytics/overview

GET    /settings

GET    /support/tickets/all
GET    /support/tickets
POST   /support/tickets
POST   /support/tickets/{supportTicket}/messages
PATCH  /support/tickets/{supportTicket}/resolve
```

## Modulos

### 1. Autenticacao

Responsabilidades:

- Cadastro de usuario.
- Login e logout.
- Persistencia de token.
- Carregamento do usuario atual.
- Protecao das rotas privadas.

Paginas:

- `LoginPage`
- `RegisterPage`
- `PlaceholderPage` para recuperacao de senha futura
- `PlaceholderPage` para perfil futuro

APIs:

- `login(credentials)`
- `register(payload)`
- `logout()`
- `getCurrentUser()`

### 2. Dashboard BTC

Responsabilidades:

- Mostrar preco atual ou resumo retornado pelo backend.
- Exibir patrimonio BTC cadastrado.
- Exibir cards de variacao, quantidade total e valor estimado.
- Destacar alertas ou estados vazios quando ainda nao houver ativos.

Paginas:

- `BtcDashboardPage`
- `BtcAssetsPage`

Componentes:

- `BtcPriceCard`
- `BtcHoldingsSummary`
- `BtcAssetList`
- `BtcAssetForm`

### 3. Analises

Responsabilidades:

- Mostrar visao consolidada de financas e BTC.
- Exibir graficos de evolucao quando a API fornecer series temporais.
- Oferecer filtros por periodo quando suportado.

Paginas:

- `AnalyticsOverviewPage`

Componentes:

- `OverviewKpiGrid`
- `DebtProjectionChart`
- `MonthlyFinanceChart`
- `BtcExposurePanel`

### 4. Financas Pessoais

Responsabilidades:

- Exibir resumo financeiro.
- Gerenciar cartoes de credito.
- Gerenciar dividas de cartao.
- Gerenciar emprestimos e parcelas.
- Evitar que tabelas fiquem inutilizaveis no mobile.

Paginas:

- `FinanceSummaryPage`
- `CreditCardsPage`
- `CreditCardFormPage`
- `CreditCardDebtsPage`
- `CreditCardDebtFormPage`
- `LoansPage`
- `LoanFormPage`
- `PlaceholderPage` para detalhes futuros de cartao, divida e emprestimo

Componentes:

- `FinanceSummaryCards`
- `CreditCardList`
- `CreditCardDebtList`
- `LoanList`
- `LoanInstallmentsList`
- `MoneyField`
- `DueDateBadge`

### 5. Configuracoes

Responsabilidades:

- Ajustar moeda padrao.
- Ajustar timezone.
- Controlar tema claro, escuro ou automatico.
- Preparar preferencias de dashboard e notificacao.

Paginas:

- `SettingsPage`

Componentes:

- `ThemeModeControl`
- `CurrencySelect`
- `TimezoneSelect`
- `NotificationPreferencesForm`

### 6. Suporte

Responsabilidades:

- Listar chamados do usuario com respostas do suporte.
- Criar chamados.
- Preparar detalhe futuro do chamado.
- Permitir que administradores visualizem todos os chamados abertos com a mensagem inicial.
- Permitir que administradores respondam e resolvam chamados.

Paginas:

- `SupportTicketsPage`
- `SupportTicketFormPage`
- `AdminSupportTicketsPage`
- `PlaceholderPage` para detalhe futuro do chamado

Componentes:

- `SupportTicketList`
- `SupportTicketTimeline`
- `SupportMessageForm`
- `TicketStatusBadge`

### 7. Administracao

Responsabilidades:

- Restringir telas administrativas a usuarios com `perfil` igual a `admin`.
- Gerenciar perfis de acesso dos usuarios.
- Atender chamados de suporte em uma fila administrativa.

Paginas:

- `UserProfilesPage`
- `AdminSupportTicketsPage`

## Layout e Experiencia do Usuario

### Estrutura Visual

```text
Desktop
+---------------------------------------------------+
| Sidebar | Topbar                                  |
|         |-----------------------------------------|
|         | Conteudo da pagina                      |
|         | Cards, tabelas, graficos, formularios   |
+---------------------------------------------------+

Mobile
+---------------------------------------------------+
| Topbar com menu e acao principal                  |
|---------------------------------------------------|
| Conteudo em uma coluna                            |
|---------------------------------------------------|
| Navegacao inferior ou drawer lateral              |
+---------------------------------------------------+
```

### Navegacao

Desktop:

- Sidebar fixa com grupos: Dashboard, Analises, Financas, Bitcoin, Suporte, Configuracoes.
- Topbar com busca futura, alternancia de tema e menu do usuario.
- Conteudo com largura maxima legivel, mas dashboards podem usar grade fluida.

Mobile:

- Topbar compacta com botao de menu.
- Drawer lateral para navegacao completa.
- Acoes primarias visiveis no topo da tela, por exemplo "Novo cartao" ou "Novo chamado".
- Tabelas convertidas para listas de cards compactos quando a tela for estreita.

### Estados de Tela

Toda pagina que consome API deve prever:

- Loading inicial com skeleton.
- Estado vazio com acao clara.
- Erro de carregamento com botao de tentar novamente.
- Sucesso com conteudo escaneavel.
- Estado de salvamento em formularios.
- Confirmacao antes de exclusoes.

### Formularios

Regras:

- Labels sempre visiveis.
- Mensagens de erro abaixo do campo.
- Mascara apenas quando melhorar a digitacao, sem impedir colagem.
- Valores monetarios exibidos em BRL por padrao.
- Datas no formato local `dd/mm/aaaa`.
- Botao principal fixo ao final do formulario em mobile quando a tela for longa.

## Design System

### Tokens

`src/styles/tokens.css` deve definir tokens sem depender de uma unica cor dominante:

```css
:root {
  --color-bg: #f7f8fa;
  --color-surface: #ffffff;
  --color-surface-muted: #eef2f6;
  --color-text: #18202a;
  --color-text-muted: #657384;
  --color-border: #d7dee8;
  --color-primary: #1769aa;
  --color-primary-contrast: #ffffff;
  --color-success: #16845b;
  --color-warning: #b7791f;
  --color-danger: #c2413b;
  --color-info: #4f6f52;
  --radius-sm: 4px;
  --radius-md: 8px;
  --shadow-sm: 0 1px 2px rgb(15 23 42 / 0.08);
}

[data-theme="dark"] {
  --color-bg: #111418;
  --color-surface: #191f26;
  --color-surface-muted: #222a33;
  --color-text: #eef3f8;
  --color-text-muted: #a8b3c1;
  --color-border: #34404d;
  --color-primary: #63a8df;
  --color-primary-contrast: #0d1822;
}
```

### Componentes UI Minimos

- `Button`
- `IconButton`
- `Input`
- `Select`
- `Textarea`
- `Checkbox`
- `Switch`
- `Tabs`
- `Dialog`
- `DropdownMenu`
- `Badge`
- `Alert`
- `Skeleton`
- `Toast`
- `DataTable`
- `ResponsiveList`
- `Card`

Cards devem ter raio de no maximo 8px, seguindo uma estetica de produto utilitario. Evitar composicoes de landing page dentro da area autenticada.

## Responsividade

Breakpoints recomendados:

```text
xs: 0-479px
sm: 480-767px
md: 768-1023px
lg: 1024-1279px
xl: 1280px+
```

Regras:

- Mobile first em CSS.
- Grids de cards usam `grid-template-columns: repeat(auto-fit, minmax(...))`.
- Formularios usam uma coluna no mobile e duas colunas apenas quando houver espaco real.
- Tabelas financeiras devem ter alternativa em lista no mobile.
- Sidebars nao devem roubar largura em telas menores que `1024px`.
- Botao de acao principal deve ser facil de alcancar no mobile.
- Nenhum texto deve depender de fonte escalada por viewport width.

## Tema Claro e Escuro

Estrategia:

- `ThemeProvider` controla `light`, `dark` e `system`.
- Preferencia persistida em `localStorage`.
- Atributo aplicado no elemento raiz: `data-theme="light"` ou `data-theme="dark"`.
- Quando o modo for `system`, usar `prefers-color-scheme`.
- As configuracoes do usuario podem sincronizar a preferencia com `PATCH /settings` em etapa futura.

Controles:

- Toggle rapido na Topbar.
- Controle completo em Configuracoes.

## Estado e Cache

TanStack Query deve gerenciar dados remotos:

```text
auth.me
btc.dashboard
btc.assets
analytics.overview
finance.summary
finance.creditCards
finance.creditCardDebts
finance.loans
finance.loanInstallments(loanId)
settings.current
support.tickets
support.ticket(ticketId)
```

Regras:

- Mutations invalidam apenas as queries afetadas.
- Dados financeiros nao devem ficar obsoletos por muito tempo; usar `staleTime` curto em resumo e dashboards.
- Listas cadastrais podem ter `staleTime` moderado.
- Evitar estado global para dados que ja sao cache remoto.
- Estado global fica restrito a auth, tema e preferencias puramente locais.

## Tipos de Dominio

Tipos TypeScript devem refletir o contrato JSON da API. Exemplo de nomes:

```text
User
AuthToken
FinanceSummary
CreditCard
CreditCardDebt
Loan
LoanInstallment
BtcDashboard
BtcAsset
AnalyticsOverview
UserSettings
SupportTicket
SupportTicketMessage
```

Padrao:

- Tipos de resposta terminam com `Response` quando representarem envelope da API.
- Payloads de formulario terminam com `Input`.
- Enums visuais ficam no frontend; regras finais continuam no backend.

## Tratamento de Erros

Casos obrigatorios:

- `401`: limpar sessao e redirecionar para login.
- `403`: mostrar tela ou alerta de acesso negado.
- `404`: mostrar recurso nao encontrado.
- `422`: mapear erros para campos do formulario.
- `429`: informar limite de tentativas.
- `500+`: informar instabilidade e permitir tentar novamente.

O usuario nunca deve ver stack trace, objeto JSON cru ou mensagem tecnica sem contexto.

## Testes

Camadas recomendadas:

- Unitarios para formatadores, validadores e helpers de API.
- Componentes para formularios, listas e estados vazios.
- Integracao com MSW para fluxos de login, dashboard e CRUD financeiro.
- E2E com Playwright para rotas criticas em desktop e mobile.

Fluxos E2E iniciais:

```text
1. Usuario cadastra, entra e ve dashboard
2. Usuario cria cartao de credito
3. Usuario cria divida de cartao
4. Usuario cria emprestimo e ve parcelas
5. Usuario alterna tema claro/escuro
6. Usuario abre chamado de suporte
```

Comandos esperados:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

## Containerizacao Local

Dockerfile recomendado para desenvolvimento:

```text
node:22-alpine
WORKDIR /app
npm ci
npm run dev -- --host 0.0.0.0
```

Compose local do frontend:

```text
frontend:
  ports:
    - "5173:5173"
  environment:
    VITE_API_BASE_URL: http://localhost:8000/api/v1
```

O backend permanece responsavel por `backend` e `postgres` em seu proprio `docker-compose.yml`.

Arquivos do frontend:

```text
Dockerfile
docker-compose.yml
.dockerignore
nginx.conf
```

Uso em desenvolvimento:

```bash
docker compose up -d --build
```

O container `cfp_frontend` expõe o Vite em:

```text
http://localhost:5173
```

Variáveis aceitas pelo compose:

```text
FRONTEND_PORT=5173
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=CFP
```

Build de imagem estática para produção:

```bash
docker build --target production -t cfp-frontend:production .
```

A imagem de produção usa Nginx para servir `dist/` e aplica fallback para `index.html`, preservando rotas client-side do React Router.

## Roadmap de Implementacao

### Fase 1: Fundacao

- Criar projeto Vite React TypeScript.
- Configurar ESLint, Prettier, TypeScript strict e scripts de qualidade.
- Criar design tokens, tema claro/escuro e layout base.
- Criar `apiClient`, auth storage e providers.
- Criar rotas publicas e privadas.

### Fase 2: Autenticacao e Shell

- Implementar login, cadastro, logout e `/me`.
- Implementar AppShell responsivo.
- Implementar estados de loading, erro e vazio.
- Proteger rotas privadas.

### Fase 3: Financas e BTC

- Implementar dashboard BTC.
- Implementar resumo financeiro.
- Implementar CRUD de cartoes, dividas e emprestimos.
- Implementar visualizacao de parcelas.

### Fase 4: Analises, Configuracoes e Suporte

- Implementar overview de analises.
- Implementar configuracoes.
- Implementar chamados e mensagens de suporte.
- Adicionar graficos e filtros quando a API retornar dados suficientes.

### Fase 5: Qualidade e Publicacao

- Cobrir fluxos criticos com testes.
- Validar responsividade em mobile e desktop.
- Validar contraste dos temas.
- Gerar build de producao.
- Documentar variaveis de ambiente e deploy.

## Decisoes Iniciais

- Usar Vite em vez de Create React App, pois CRA foi descontinuado para novos apps e o backend ja aceita `localhost:5173` no CORS local.
- Usar TypeScript desde o inicio para reduzir erros de contrato com a API.
- Usar token Bearer em vez de cookie de sessao neste momento, alinhado ao Sanctum API token do backend.
- Usar CSS variables para tema, evitando acoplamento a uma biblioteca visual pesada.
- Manter o frontend como repo independente, sem importar codigo PHP nem depender do processo de build do Laravel.
