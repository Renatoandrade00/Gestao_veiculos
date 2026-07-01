# Plano de Implementação: Controle de Manutenções Veiculares

Este documento detalha o plano de implementação do aplicativo completo de controle de manutenções veiculares, contendo autenticação de usuários, cadastro de veículos com recomendações técnicas pré-cadastradas, inserção de manutenções periódicas e alertas por e-mail.

## Visão Geral do Projeto
O sistema será composto por duas partes principais:
1. **Backend (API)**: Uma API REST desenvolvida em Node.js com Express e TypeScript. Os dados serão persistidos em um banco de dados SQLite utilizando o Prisma ORM. Autenticação via JWT. Disparo de e-mails via Nodemailer (com envio simulado para logs ou Ethereal em desenvolvimento).
2. **Frontend (App Web Mobile-First)**: Um aplicativo web de página única (SPA) desenvolvido com Vite, React, TypeScript e Tailwind CSS v4. A interface será otimizada para dispositivos móveis (Mobile-First) e configurada como PWA (Progressive Web App), facilitando a publicação futura em lojas como Google Play e App Store (usando ferramentas como Capacitor).

---

## Detalhes do Projeto

- **Project Type**: WEB (com design Mobile-First e preparado para empacotamento Mobile futuro com Capacitor).
- **Primary Agent**: `frontend-specialist` (UI/UX) e `backend-specialist` (API/Banco de Dados).

---

## Critérios de Sucesso
- Cadastro de usuário e login funcionando com JWT e rotas protegidas.
- Cadastro, edição e exclusão de veículos.
- Seleção de marca/modelo/ano que preenche automaticamente as especificações técnicas (óleo recomendado, viscosidade, capacidade, calibração de pneus).
- Cadastro de manutenções com controle de quilometragem e data.
- Visualização gráfica ou status (verde/amarelo/vermelho) da vida útil dos itens de manutenção (ex: óleo a vencer em 1000km).
- Simulação de disparo de e-mail de alerta quando a manutenção estiver próxima de vencer.

---

## Pilha de Tecnologia (Tech Stack)

### Frontend
- **Framework**: Vite + React 19 + TypeScript 5
- **Estilização**: Tailwind CSS v4 (Design moderno, sem tons roxos/violetas genéricos, com modo escuro sleek e foco em usabilidade móvel)
- **Rotas**: React Router DOM v6
- **Gerenciamento de Estado**: Context API ou Zustand
- **Empacotamento Mobile Futuro**: Capacitor (Configuração preparada, opcional para execução local inicial)

### Backend
- **Ambiente de Execução**: Node.js v24 + TypeScript 5
- **Framework Web**: Express
- **Banco de Dados**: SQLite (Portável e sem necessidade de servidor externo)
- **ORM**: Prisma ORM
- **Autenticação**: JSON Web Tokens (JWT) + bcryptjs para hashing de senhas
- **Envio de Alertas**: Nodemailer (Envia e-mails formatados e gera links de visualização temporários em modo de desenvolvimento)

---

## Estrutura de Arquivos Proposta

```
01 - PROJETO TESTE/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelagem do banco de dados SQLite
│   │   └── seed.ts             # Dados iniciais (especificações de carros)
│   ├── src/
│   │   ├── controllers/        # Controladores de rotas (Auth, Veículos, Manutenções)
│   │   ├── middlewares/        # Validação de JWT, tratamento de erros
│   │   ├── services/           # Regras de negócio e disparo de alertas/e-mails
│   │   ├── data/               # Banco de dados de especificações de carros (JSON)
│   │   ├── routes/             # Definições de rotas da API
│   │   ├── app.ts              # Inicialização do Express
│   │   └── server.ts           # Entrada do servidor backend
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/                # Estrutura principal
│   │   ├── components/         # Componentes UI (Button, Card, Input, Alert)
│   │   ├── context/            # Contexto de Autenticação
│   │   ├── hooks/              # Custom hooks para consumo de APIs
│   │   ├── pages/              # Telas (Login, Dashboard, Veículos, Manutenções)
│   │   ├── services/           # Cliente Axios/Fetch para comunicação com o backend
│   │   ├── utils/              # Formatadores e auxiliares
│   │   ├── globals.css         # Tailwind v4 e variáveis de design
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── index.html
├── DESIGN.md                   # Tokens e guia visual (Criado antes da UI)
└── vehicle-maintenance.md      # Este plano
```

---

## Cronograma e Divisão de Tarefas

### Fase P0: Fundações (Banco de Dados & Configuração Inicial)
*   **Tarefa 1: Configurar Estrutura de Diretórios e Dependências**
    *   *Agente*: `backend-specialist` + `frontend-specialist`
    *   *Ação*: Inicializar diretórios `backend/` e `frontend/`. Instalar pacotes necessários (Express, Prisma, React, Tailwind v4).
    *   *INPUT*: Solicitação do usuário.
    *   *OUTPUT*: Estrutura básica com `package.json` configurados.
    *   *VERIFY*: `npm install` executa sem erros em ambos os diretórios.
*   **Tarefa 2: Modelagem do Banco de Dados (Prisma/SQLite)**
    *   *Agente*: `database-architect`
    *   *Ação*: Criar schema do Prisma com as tabelas: `User`, `Vehicle`, `MaintenanceRecord` e `CarSpecsReference`.
    *   *INPUT*: Requisitos de dados (usuários, veículos, manutenções).
    *   *OUTPUT*: `backend/prisma/schema.prisma`.
    *   *VERIFY*: Executar `npx prisma validate` com sucesso.
*   **Tarefa 3: Popular Banco de Dados de Referências (Seed)**
    *   *Agente*: `database-architect`
    *   *Ação*: Criar script de seed para cadastrar dados técnicos básicos dos 15 veículos mais comuns no Brasil (viscosidade de óleo, capacidade, calibração, etc.).
    *   *INPUT*: Lista estática de dados técnicos em JSON.
    *   *OUTPUT*: `backend/prisma/seed.ts`.
    *   *VERIFY*: Executar `npx prisma db seed` e verificar no SQLite.

### Fase P1: Core Backend & APIs
*   **Tarefa 4: Sistema de Autenticação (Sign Up / Sign In)**
    *   *Agente*: `backend-specialist`
    *   *Ação*: Desenvolver rotas de cadastro e login de usuário com JWT e hashing de senha (bcrypt).
    *   *INPUT*: Rotas de autenticação.
    *   *OUTPUT*: Controladores e rotas em `backend/src/controllers/auth.ts`.
    *   *VERIFY*: Testar requisição POST no endpoint `/api/auth/login` e receber um token JWT válido.
*   **Tarefa 5: APIs de Gerenciamento de Veículos**
    *   *Agente*: `backend-specialist`
    *   *Ação*: Criar CRUD de veículos vinculados ao usuário autenticado, com busca automática de especificações técnicas do veículo caso o modelo cadastrado esteja no banco de referências.
    *   *INPUT*: Rotas `/api/vehicles`.
    *   *OUTPUT*: `backend/src/controllers/vehicles.ts`.
    *   *VERIFY*: Realizar requisições GET/POST/PUT/DELETE autenticadas.
*   **Tarefa 6: APIs de Registro de Manutenções & Serviço de Alertas**
    *   *Agente*: `backend-specialist`
    *   *Ação*: Criar endpoints de manutenções e o sistema que calcula a proximidade de vencimento da manutenção (por data ou por km atualizado do veículo) e simula o disparo de alertas por e-mail (gerando logs no console ou mensagens via Nodemailer).
    *   *INPUT*: Rotas `/api/maintenances` e lógica de alertas.
    *   *OUTPUT*: `backend/src/controllers/maintenances.ts` e `backend/src/services/alertService.ts`.
    *   *VERIFY*: Simular checagem de alertas e validar a geração do e-mail.

### Fase P2: UI/UX Frontend & Telas
*   **Tarefa 7: Criação do DESIGN.md e Configurações Visuais**
    *   *Agente*: `frontend-specialist`
    *   *Ação*: Definir a paleta de cores (Tailwind v4), tipografia, tokens visuais móveis e fluxos na documentação `DESIGN.md`.
    *   *INPUT*: Padrões visuais anti-slop e mobile-first.
    *   *OUTPUT*: `DESIGN.md` criado na raiz.
    *   *VERIFY*: Revisão visual dos tokens.
*   **Tarefa 8: Telas de Autenticação (Login e Cadastro)**
    *   *Agente*: `frontend-specialist`
    *   *Ação*: Desenvolver formulários modernos de login e cadastro com validação de campos e integração com o backend.
    *   *INPUT*: `DESIGN.md` e endpoints de autenticação.
    *   *OUTPUT*: `frontend/src/pages/Login.tsx` e `Register.tsx`.
    *   *VERIFY*: Usuário consegue se registrar e fazer login, sendo redirecionado ao dashboard.
*   **Tarefa 9: Dashboard Principal & Alertas Visuais**
    *   *Agente*: `frontend-specialist`
    *   *Ação*: Dashboard móvel exibindo a lista de veículos cadastrados, seus status de manutenção (ex: "Óleo Ok", "Bateria Próxima do Vencimento") e um painel de alertas ativos.
    *   *INPUT*: Componentes visuais modernos e dados do backend.
    *   *OUTPUT*: `frontend/src/pages/Dashboard.tsx`.
    *   *VERIFY*: Tela renderizada perfeitamente e exibindo alertas corretos de acordo com a km cadastrada.
*   **Tarefa 10: CRUD de Veículos e Registro de Manutenções**
    *   *Agente*: `frontend-specialist`
    *   *Ação*: Telas para adicionar/editar veículos (com auto-completar de especificações de óleo) e registrar novos serviços de manutenção realizados.
    *   *INPUT*: Dados do veículo e histórico de revisões.
    *   *OUTPUT*: `frontend/src/pages/VehicleDetail.tsx` e formulários de cadastro.
    *   *VERIFY*: Cadastro de veículo com preenchimento de especificações e cadastro de manutenção funcionando de ponta a ponta.

### Fase P3: Polimento & PWA Setup
*   **Tarefa 11: Configuração PWA (Service Workers & Manifest)**
    *   *Agente*: `frontend-specialist`
    *   *Ação*: Adicionar suporte a PWA no Vite para permitir "instalar" o app no celular e preparar para empacotamento Capacitor futuramente.
    *   *INPUT*: Configurações PWA no Vite.
    *   *OUTPUT*: `vite.config.ts` atualizado e arquivo `manifest.json`.
    *   *VERIFY*: Testar instalação local do PWA via navegador Chrome/Edge.

---

## Plano de Verificação (Fase X)

### Testes Automatizados
- Validação das rotas do backend com testes de integração básicos.
- Verificação de compilação sem erros no Frontend e Backend.

### Verificação Manual
- Testar fluxo completo: registrar novo usuário → cadastrar veículo (Chevrolet Onix 2020) → verificar se óleo recomendado (ex: 0W20) foi sugerido automaticamente → cadastrar troca de óleo → alterar km atual do veículo para próximo do limite → verificar se alerta visual apareceu no painel e se e-mail de alerta simulado foi gerado.

---

## ✅ PHASE X CONFIGURATION
Para a conclusão do projeto, serão rodados os seguintes scripts:
1. `python .agents/scripts/verify_all.py . --url http://localhost:3000` (Para auditoria de segurança, UX e acessibilidade).
2. `npm run build` tanto no backend quanto no frontend.
