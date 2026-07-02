# Gestão de Veículos - Controle de Manutenções Veiculares

Este é um sistema completo e moderno para controle de manutenções veiculares, projetado com uma experiência mobile-first de alta fidelidade e arquitetura de microsserviços/monorepo. O sistema é composto por uma API robusta em Node.js com TypeScript e um aplicativo web moderno em React com Tailwind CSS v4, preparado para empacotamento móvel (PWA/Capacitor).

> **🔗 Acesse o Sistema no ar:** [Testar Aplicação (Live Demo)](https://vehicle-maintenance-frontend-mb92.onrender.com)

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Runtime**: Node.js (v24+)
- **Linguagem**: TypeScript 5
- **Framework Web**: Express.js
- **Banco de Dados**: SQLite (Banco local auto-contido de fácil portabilidade)
- **ORM**: Prisma ORM
- **Autenticação**: JSON Web Tokens (JWT) & bcryptjs para hashing de senhas
- **Envio de Alertas**: Nodemailer (geração de links de visualização de e-mails em desenvolvimento)

### Frontend
- **Framework**: Vite + React 19 + TypeScript 5
- **Estilização**: Tailwind CSS v4 (Foco em usabilidade mobile, design premium, paleta escura com acentos esmeralda)
- **Rotas**: React Router DOM v6
- **Gerenciamento de Estado**: React Context API / hooks customizados
- **Arquitetura**: Mobile-First & PWA (Suporte a service workers e arquivo manifest.json pronto para instalação)

---

## 📦 Estrutura do Projeto

O repositório está estruturado da seguinte forma:

```
Gestao_veiculos/
├── backend/                  # API REST & Banco de dados
│   ├── prisma/               # Schema e Seeds (banco de dados inicial) do Prisma
│   └── src/                  # Código-fonte TypeScript (Controllers, Routes, Services)
├── frontend/                 # Interface do Usuário (Web/PWA)
│   ├── src/                  # Componentes React, Páginas, Contexts e CSS Global
│   └── index.html            # Ponto de entrada HTML
├── DESIGN.md                 # Guia de Estilo, tokens visuais e design system
└── vehicle-maintenance.md    # Plano de Implementação detalhado
```

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v18 ou superior recomendado, preferencialmente v24)
- NPM (incluso com o Node.js)

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
4. Execute as migrações do banco de dados e rode o seed para carregar especificações técnicas pré-cadastradas:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
5. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   O backend rodará na porta configurada (geralmente `http://localhost:3000`).

### 2. Configurando o Frontend

1. Entre no diretório do frontend:
   ```bash
   cd ../frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Vite:
   ```bash
   npm run dev
   ```
   Acesse a URL exibida no seu console (por padrão `http://localhost:5173`).

---

## ✨ Funcionalidades Principais

- **Autenticação Segura**: Cadastro de usuário e login com criptografia de senhas e proteção de rotas via JWT.
- **Catálogo de Referência**: Auto-preenchimento de dados técnicos (especificação de óleo, viscosidade, capacidade do cárter e calibração de pneus) ao selecionar modelos populares brasileiros cadastrados.
- **Gestão de Veículos**: Cadastro, visualização, edição e exclusão da frota vinculada ao usuário.
- **Painel de Manutenções**: Acompanhamento em tempo real da vida útil dos principais itens de revisão (óleo, filtros, freios, pneus).
- **Alertas Inteligentes**: Status visual colorido (Verde - Ok, Amarelo - Próximo, Vermelho - Vencido) baseado na quilometragem e data atualizadas dos veículos, com notificação simulada de e-mails via Nodemailer.
- **Mobile-First & PWA**: Design otimizado para telas pequenas com suporte para instalação direta no dispositivo como um aplicativo nativo.

---

## 🎨 Design System

O projeto adota uma estética premium e minimalista. As definições visuais, paleta de cores refinada (`slate-950` para fundo, `slate-900` para superfícies de cards, `emerald-500` para destaque de sucesso) e transições CSS estão documentadas no arquivo [DESIGN.md](file:///d:/Projetos/Gest%C3%A3o%20Veiculos/Gestao_veiculos/DESIGN.md).

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de gerenciamento interno.


## 🤝 Conecte-se comigo

- **LinkedIn:** [Renato Andrade](www.linkedin.com/in/renato-andrade-a79570299)
- **DIO:** [Renato Andrade](https://web.dio.me/users/renatoandrade00)

