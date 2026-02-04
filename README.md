# Sistema Online de Plano de Corte para Marcenarias

Plataforma completa com **backend**, **frontend**, **banco de dados** e **API REST** para cadastro, cálculo e emissão de relatórios em PDF de planos de corte. O sistema atende à especificação solicitada, incluindo autenticação, cálculo de MDF/fita de borda, dashboard e exportação.

## Arquitetura

```
/workspace/Ronisio-Maia.github.io
├─ backend
│  ├─ src
│  │  ├─ middleware
│  │  ├─ routes
│  │  ├─ services
│  │  └─ index.js
│  └─ sql
├─ frontend
│  ├─ src
│  │  ├─ components
│  │  └─ pages
│  └─ index.html
```

- **Backend (Node + Express + SQLite)**: API REST, autenticação com JWT, cálculos e PDF. 
- **Banco de Dados (SQLite)**: Tabelas de usuários, MDF, fitas, planos e peças com seed inicial. 
- **Frontend (React + Vite)**: Dashboard, criação de planos, detalhamento e exportação. 

## Funcionalidades principais

- Cadastro e login com e-mail/senha e stub para Google OAuth.
- Dashboard com listagem de planos por data.
- Cadastro de peças com espessura, cor, fitas e ambiente.
- Cálculo automático de MDF, fitas de borda e custos.
- Algoritmo de encaixe (FFDH) para estimar chapas e desperdício.
- Exportação de relatório em PDF.

## Banco de Dados

Scripts SQL:
- `backend/sql/schema.sql` (estrutura completa)
- `backend/sql/seed.sql` (carga inicial de MDF e fitas)

Tabelas:
- `users`, `mdf`, `fitas`, `planos`, `plano_pecas`

## Instalação

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

A API ficará disponível em `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A interface ficará disponível em `http://localhost:5173`.

## Endpoints (principais)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/forgot`
- `GET /api/materials/mdf`
- `GET /api/materials/fitas`
- `GET /api/plans`
- `POST /api/plans`
- `GET /api/plans/:id`
- `PUT /api/plans/:id`
- `PATCH /api/plans/:id/status`
- `DELETE /api/plans/:id`
- `GET /api/plans/:id/pdf`

## Deploy

1. Suba o backend em um servidor Node (Railway, Render, Fly.io, etc.).
2. Ajuste o `.env` com um `JWT_SECRET` forte.
3. Aponte o frontend para a URL da API em produção (ex.: `https://sua-api.com`).
4. Gere o build do frontend com `npm run build` e hospede o conteúdo em um CDN.

## Observações

- O endpoint de login com Google está preparado para receber `google_id` e `email`, mas recomenda-se integrar um fluxo OAuth real no ambiente de produção.
- O algoritmo de corte utiliza heurística FFDH para estimativa de chapas e desperdício.
