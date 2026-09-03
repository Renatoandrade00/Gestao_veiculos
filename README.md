# Gestão de Veículos - Controle de Manutenções Veiculares

Este é um sistema completo e moderno para controle de manutenções veiculares, projetado com uma experiência mobile-first de alta fidelidade e arquitetura de microsserviços/monorepo. O sistema é composto por uma API robusta em Node.js com TypeScript e um aplicativo web moderno em React com Tailwind CSS v4, preparado para empacotamento móvel (PWA/Capacitor).

> **🔗 Acesse o Sistema no ar:** [Testar Aplicação (Live Demo)](https://vehicle-maintenance-frontend-mb92.onrender.com)

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Runtime**: Node.js (v18+)
- **Linguagem**: TypeScript 5 (strict)
- **Framework Web**: Express.js + Helmet + rate limiting
- **Banco de Dados**: PostgreSQL (migrations versionadas via Prisma Migrate)
- **ORM**: Prisma ORM
- **Autenticação**: JSON Web Tokens (JWT) & bcryptjs para hashing de senhas
- **Envio de Alertas**: Nodemailer (SMTP real, Ethereal em dev, ou JSON transport no console)
- **Testes**: Vitest

### Frontend
- **Framework**: Vite + React 19 + TypeScript 5 (strict)
- **Estilização**: Tailwind CSS v4 (Foco em usabilidade mobile, design premium, paleta escura com acentos esmeralda)
- **Rotas**: React Router DOM v6 (com code splitting via React.lazy)
- **Gerenciamento de Estado**: React Context API + hooks customizados
- **Arquitetura**: Mobile-First & PWA (Service worker com estratégia network-first para HTML)

---

## 📦 Estrutura do Projeto

O repositório está estruturado na seguinte forma:

```
Gestao_veiculos/
├── backend/                  # API REST & Banco de dados
│   ├── prisma/               # Schema, migrations versionadas e Seeds
│   │   └── migrations/       # Migrations SQL aplicáveis com `migrate deploy`
│   └── src/                  # Código-fonte TypeScript (Controllers, Routes, Services)
├── frontend/                 # Interface do Usuário (Web/PWA)
│   ├── public/               # manifest.json, service worker e ícones PWA
│   └── src/                  # Componentes React, Páginas, Contexts, tipos e testes
├── DESIGN.md                 # Guia de Estilo, tokens visuais e design system
├── render.yaml               # Deploy (backend web + frontend static + Postgres)
└── vehicle-maintenance.md    # Plano de Implementação detalhado
```

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v18 ou superior)
- NPM (incluso com o Node.js)
- PostgreSQL local (ou Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=devpass postgres:16`)

### 1. Configurando o Backend

1. Entre no diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie e configure o arquivo `.env` com base no arquivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
   > ⚠️ **JWT_SECRET é obrigatório** — o servidor se recusa a iniciar sem ele.
   > Gere um secret forte com:
   > `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

4. Aplique as migrations e rode o seed (idempotente) para carregar as especificações técnicas:
   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   O backend rodará na porta configurada (geralmente `http://localhost:3000`).

### 2. Configurando o Frontend

1. Entre no diretório do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   Acesse a URL exibida no console (por padrão `http://localhost:5173`).

---

## ✅ Qualidade & Testes

Ambos os pacotes possuem lint, typecheck e testes:

```bash
# Backend (dentro de backend/)
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm run test        # Vitest (regra de status de manutenções, escapeHtml)

# Frontend (dentro de frontend/)
npm run lint        # ESLint (flat config)
npm run typecheck   # tsc --noEmit
npm run test        # Vitest (helpers de API, componentes)
```

---

## ✨ Funcionalidades Principais

- **Autenticação Segura**: Cadastro e login com criptografia de senhas (bcrypt), rate limiting anti brute-force, normalização de e-mails e proteção de rotas via JWT com logout automático ao expirar.
- **Catálogo de Referência**: Auto-preenchimento de dados técnicos (especificação de óleo, viscosidade, capacidade do cárter e calibração de pneus) ao selecionar modelos populares brasileiros cadastrados (seed idempotente com 54 modelos).
- **Gestão de Veículos**: Cadastro, visualização, edição (incluindo update parcial de quilometragem) e exclusão da frota vinculada ao usuário.
- **Painel de Manutenções**: Acompanhamento em tempo real da vida útil dos itens de revisão — **status (Verde/Amarelo/Vermelho) calculado no backend** e exposto pela API (`status` e `statusByType`), fonte única de verdade compartilhada com o serviço de alertas.
- **Alertas Inteligentes**: Notificação de e-mails via Nodemailer (com escape de HTML anti-injection) disparada quando a quilometragem restante ≤ 1000 km ou a data limite ≤ 30 dias.
- **Mobile-First & PWA**: Design otimizado para telas pequenas, service worker corrigido (network-first para HTML — usuários sempre veem a versão mais recente) e suporte a instalação como app nativo.

---

## 🎨 Design System

O projeto adota uma estética premium e minimalista. As definições visuais, paleta de cores refinada (`slate-950` para fundo, `slate-900` para superfícies, `emerald-500` para destaque de sucesso) e transições CSS estão documentadas no arquivo [DESIGN.md](DESIGN.md).

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de gerenciamento interno.


## 🤝 Conecte-se comigo

- **LinkedIn:** [Renato Andrade](https://www.linkedin.com/in/renato-andrade-a79570299)
- **DIO:** [Renato Andrade](https://web.dio.me/users/renatoandrade00)
