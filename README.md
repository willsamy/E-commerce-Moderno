# 🛍️ EcomercePro

EcomercePro é uma plataforma de e-commerce completa e moderna construída com Next.js 14, TypeScript e PostgreSQL. Oferece uma experiência de compra fluida com carrinho de compras, checkout seguro via Stripe, painel administrativo robusto e autenticação avançada.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-blue)](https://stripe.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Começando](#começando)
- [Credenciais de Teste](#credenciais-de-teste)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Documentação](#documentação)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [Suporte](#suporte)
- [Licença](#licença)

## 🎯 Visão Geral

EcomercePro foi desenvolvido para fornecer uma solução completa de e-commerce com foco em:
- **Performance**: Otimizado para SEO e Core Web Vitals
- **Segurança**: Autenticação robusta e conformidade com PCI DSS
- **Escalabilidade**: Arquitetura preparada para crescimento
- **Experiência do Usuário**: Interface intuitiva e responsiva

## ✨ Funcionalidades

### Loja Online
- 🛒 Carrinho de compras persistente
- 🔍 Busca e filtros avançados
- 📱 Design responsivo
- 🌙 Modo claro/escuro
- ⚡ Performance otimizada
- 📊 SEO aprimorado

### Checkout e Pagamentos
- 💳 Integração com Stripe Checkout
- 🔒 Pagamentos seguros e PCI compliant
- 📧 Confirmação de pedido por email
- 📦 Gestão de estoque automática

### Painel Administrativo
- 📊 Dashboard com métricas em tempo real
- 📝 Gerenciamento de produtos e categorias
- 📦 Gestão de pedidos e status
- 👥 Administração de usuários
- 📈 Relatórios e analytics

### Autenticação
- 🔐 Sistema de login/registro completo
- 👤 Contas de cliente e administrador
- 🔑 Autenticação via provedores OAuth
- 🛡️ Proteção de rotas por roles

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|---------|-----------|
| Next.js | 14.x | Framework React full-stack |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 3.x | Estilização utility-first |
| PostgreSQL | 16.x | Banco de dados relacional |
| Prisma | 5.x | ORM moderno |
| Stripe | Latest | Processamento de pagamentos |
| NextAuth.js | 4.x | Autenticação e autorização |
| Zod | 3.x | Validação de schemas |
| React Hook Form | 7.x | Gerenciamento de formulários |

## 🚀 Começando

### Pré-requisitos
- Node.js 18+ ou Docker
- PostgreSQL 16+ (ou Docker)
- Conta Stripe (modo teste)

### Instalação Rápida (Docker)

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/ecomercepro.git
cd ecomercepro
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações.

3. **Inicie com Docker**
```bash
docker-compose up --build
```

4. **Acesse a aplicação**
- Loja: http://localhost:8180
- Admin: http://localhost:8180/admin

### Instalação Manual

1. **Instale as dependências**
```bash
npm install
```

2. **Configure o banco de dados**
```bash
npx prisma migrate dev
npx prisma db seed
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🔑 Credenciais de Teste

### Conta Admin
- **Email:** admin@demo.com
- **Senha:** admin123

### Conta Cliente
- **Email:** user@demo.com
- **Senha:** user123

### Cartão de Teste Stripe
- **Número:** 4242 4242 4242 4242
- **Data:** Qualquer data futura
- **CVV:** Qualquer 3 dígitos

## 📝 Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar produção

# Banco de dados
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados iniciais
npm run db:reset     # Resetar banco de dados

# Qualidade
npm run lint         # Verificar linting
npm run type-check   # Verificar tipos TypeScript
npm run test         # Executar testes
npm run test:e2e     # Testes end-to-end

# Docker
npm run docker:dev   # Desenvolvimento com Docker
npm run docker:prod  # Produção com Docker
```

## 📁 Estrutura do Projeto

```
ecomercepro/
├── src/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (public)/          # Rotas públicas
│   │   ├── admin/             # Painel administrativo
│   │   ├── api/               # APIs REST
│   │   └── api/auth/          # NextAuth.js
│   ├── components/            # Componentes React
│   ├── lib/                   # Utilitários e configurações
│   ├── hooks/                 # Custom hooks
│   └── types/                 # Tipos TypeScript
├── prisma/                    # Schema e migrações
├── public/                    # Assets estáticos
├── .docs/                     # Documentação completa
└── tests/                     # Testes automatizados
```

## 📖 Documentação

A documentação completa está disponível na pasta `.docs/`:

- **[Instalação](.docs/instalacao.md)** - Guia detalhado de instalação
- **[Autenticação](.docs/autenticacao.md)** - Sistema de autenticação e autorização
- **[Fluxo de Compra](.docs/fluxo-compra.md)** - Processo completo de checkout
- **[Painel Admin](.docs/painel-admin.md)** - Funcionalidades administrativas
- **[Variáveis de Ambiente](.docs/variaveis-ambiente.md)** - Configurações de ambiente
- **[Deploy](.docs/deploy.md)** - Guia de deploy em produção
- **[Segurança](.docs/seguranca.md)** - Práticas de segurança implementadas
- **[Testes](.docs/testes.md)** - Estratégia de testes
- **[Contribuindo](.docs/contribuindo.md)** - Diretrizes para contribuidores
- **[Troubleshooting](.docs/troubleshooting.md)** - Solução de problemas comuns
- **[Roadmap](.docs/roadmap.md)** - Planejamento futuro

## 🗺️ Roadmap

### Q1 2024
- [x] Loja básica com catálogo
- [x] Carrinho de compras
- [x] Checkout com Stripe
- [x] Painel administrativo
- [x] Autenticação NextAuth

### Q2 2024
- [ ] Sistema de avaliações e reviews
- [ ] Wishlist/favoritos
- [ ] Cupons de desconto
- [ ] Envios e rastreamento

### Q3 2024
- [ ] Marketplace multi-vendedor
- [ ] Assinaturas recorrentes
- [ ] App mobile (React Native)
- [ ] Integração com ERPs

### Q4 2024
- [ ] Inteligência artificial para recomendações
- [ ] Chatbot de atendimento
- [ ] Analytics avançado
- [ ] Internacionalização completa

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [guia de contribuição](.docs/contribuindo.md) para detalhes sobre nosso código de conduta e o processo para submeter pull requests.

## 📊 Status do Projeto

- **Versão:** 1.0.0
- **Status:** Em desenvolvimento ativo
- **Última atualização:** Dezembro 2024
- **Build:** [![Build Status](https://github.com/seu-usuario/ecomercepro/workflows/CI/badge.svg)](https://github.com/seu-usuario/ecomercepro/actions)

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](.docs/)
2. Consulte o [troubleshooting](.docs/troubleshooting.md)
3. Abra uma [issue](https://github.com/seu-usuario/ecomercepro/issues)
4. Entre em contato: suporte@ecomercepro.com

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) pela excelente documentação
- [Tailwind CSS](https://tailwindcss.com/) pela melhor ferramenta de estilização
- [Prisma](https://www.prisma.io/) pelo ORM mais amigável
- [Stripe](https://stripe.com/) por tornar pagamentos simples
- Todos os [contribuidores](https://github.com/seu-usuario/ecomercepro/contributors) deste projeto

---

<p align="center">
  <strong>EcomercePro</strong> - Construído com ❤️ pela comunidade
</p>

## Sumário
- [Stack e requisitos](#stack-e-requisitos)
- [Configuração e execução (docker-compose)](#configuração-e-execução-docker-compose)
- [Variáveis de ambiente (.env)](#variáveis-de-ambiente-env)
- [Banco de dados e Prisma](#banco-de-dados-e-prisma)
- [Stripe (teste)](#stripe-teste)
- [Autenticação (NextAuth)](#autenticação-nextauth)
- [Rotas principais](#rotas-principais)
  - [Público](#público)
  - [Carrinho e Checkout](#carrinho-e-checkout)
  - [Admin](#admin)
  - [APIs públicas](#apis-públicas)
  - [APIs admin](#apis-admin)
- [Webhooks](#webhooks)
- [Notas de build (Next.js 14)](#notas-de-build-nextjs-14)
- [Roadmap breve](#roadmap-breve)

---

## Stack e requisitos
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS (com tailwindcss-animate), darkMode=class
- PostgreSQL 16 (Docker)
- Prisma ORM
- Stripe Checkout (modo teste) + webhook
- NextAuth (Credentials Provider, sessões JWT)
- Zod + React Hook Form nos formulários (login/registro/admin)
- Locale/BRL pt-BR
- Startup por `docker-compose up` expondo `http://localhost:8180`

## Configuração e execução (docker-compose)
1) Copie o arquivo de exemplo e ajuste valores:
```
cp .env.example .env
```
2) Edite `.env` e defina pelo menos:
- `APP_BASE_URL=http://localhost:8180`
- `NEXTAUTH_URL=http://localhost:8180`
- `NEXTAUTH_SECRET=` (string aleatória segura)
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`
- Banco: `DATABASE_URL` já vem apontando para o serviço `db` no compose.

3) Suba os serviços:
```
docker-compose up --build
```
O container `web` executará: `prisma migrate deploy`, seed e `next start` na porta `8180`.

Acesse em:
- Web: http://localhost:8180

Credenciais padrão (seed):
- Admin: email `admin@demo.com`, senha `admin123` (ajuste no seed conforme necessário)

## Variáveis de ambiente (.env)
Essenciais:
- `NODE_ENV=production` (no container) ou `development` local
- `PORT=8180`
- `APP_BASE_URL=http://localhost:8180`
- `DATABASE_URL=postgresql://postgres:postgres@db:5432/ecomercepro?schema=public`
- `NEXTAUTH_URL=http://localhost:8180`
- `NEXTAUTH_SECRET=...`
- `STRIPE_PUBLIC_KEY=pk_test_xxx`
- `STRIPE_SECRET_KEY=sk_test_xxx`
- `STRIPE_WEBHOOK_SECRET=whsec_xxx`

Observações:
- Em produção, nunca comitar `.env`. Use variáveis de ambiente do ambiente alvo.
- `APP_BASE_URL` é utilizada para montar `success_url` e `cancel_url` do Stripe Checkout.

## Banco de dados e Prisma
- Schema Prisma em [`prisma/schema.prisma`](prisma/schema.prisma:1)
- Migrações são aplicadas automaticamente no container `web`.
- Seed em [`prisma/seed.ts`](prisma/seed.ts:1) cria usuário admin e dados iniciais (produtos/categorias). Opcionalmente pode integrar com Stripe para criar Prices.

Cliente Prisma:
- Singleton em [`src/lib/prisma.ts`](src/lib/prisma.ts:1)

## Stripe (teste)
- Checkout em [`src/app/api/checkout/route.ts`](src/app/api/checkout/route.ts:1)
  - Cria Order (PENDING) + OrderItems com `unitPriceCents` e `totalCents`
  - Redireciona para sessão de Checkout e retorna `session.url`
- Webhook em [`src/app/api/stripe/webhook/route.ts`](src/app/api/stripe/webhook/route.ts:1)
  - Valida assinatura, marca pedido como `PAID`, baixa estoque
  - Limpa carrinho de usuário autenticado (se houver carrinho associado por userId)
  - Observação: para compras sem login, é possível estender o schema para persistir `cartSessionId` no Order e limpar por sessão também.

## Autenticação (NextAuth)
- Configurações em [`src/lib/auth.ts`](src/lib/auth.ts:1)
  - Credentials Provider com validação de e-mail/senha via Prisma
  - JWT carrega `role` no token/sessão
- Rota NextAuth em [`src/app/api/auth/[...nextauth]/route.ts`](src/app/api/auth/[...nextauth]/route.ts:1)
- Middleware protegendo rotas admin em [`src/middleware.ts`](src/middleware.ts:1)
- Provider no layout em [`src/lib/auth-provider.tsx`](src/lib/auth-provider.tsx:1) e consumo no layout [`src/app/layout.tsx`](src/app/layout.tsx:1)

## Rotas principais

### Público
- Home catálogo SSR: [`src/app/page.tsx`](src/app/page.tsx:1)
  - Busca/paginação via query params, filtro por categoria, renderização em grid
  - Botão “Adicionar ao carrinho”
- Carrinho: [`src/app/(public)/carrinho/page.tsx`](src/app/(public)/carrinho/page.tsx:1)
- Login: [`src/app/login/page.tsx`](src/app/login/page.tsx:1)
- Registro: [`src/app/register/page.tsx`](src/app/register/page.tsx:1)
- Checkout:
  - Sucesso: [`src/app/checkout/sucesso/page.tsx`](src/app/checkout/sucesso/page.tsx:1)
  - Cancelado: [`src/app/checkout/cancelado/page.tsx`](src/app/checkout/cancelado/page.tsx:1)

### Carrinho e Checkout
APIs:
- Cart: [`src/app/api/cart/route.ts`](src/app/api/cart/route.ts:1)
- Checkout: [`src/app/api/checkout/route.ts`](src/app/api/checkout/route.ts:1)
- Stripe Webhook: [`src/app/api/stripe/webhook/route.ts`](src/app/api/stripe/webhook/route.ts:1)

### Admin
Layout/Navegação:
- Layout: [`src/app/admin/layout.tsx`](src/app/admin/layout.tsx:1)
- Dashboard: [`src/app/admin/page.tsx`](src/app/admin/page.tsx:1)
- Links: Produtos, Categorias, Pedidos, Usuários (protegidos por role ADMIN via middleware).

Produtos:
- Listagem: [`src/app/admin/produtos/page.tsx`](src/app/admin/produtos/page.tsx:1)
- Novo: [`src/app/admin/produtos/novo/page.tsx`](src/app/admin/produtos/novo/page.tsx:1) (Zod + RHF)
- Editar: [`src/app/admin/produtos/[id]/page.tsx`](src/app/admin/produtos/[id]/page.tsx:1) (Zod + RHF)
APIs:
- Criar: [`src/app/api/admin/products/route.ts`](src/app/api/admin/products/route.ts:1) POST
- Get/Editar/Excluir: [`src/app/api/admin/products/[id]/route.ts`](src/app/api/admin/products/[id]/route.ts:1) GET/PUT/DELETE

Categorias:
- Listagem: [`src/app/admin/categorias/page.tsx`](src/app/admin/categorias/page.tsx:1)
- Nova: [`src/app/admin/categorias/nova/page.tsx`](src/app/admin/categorias/nova/page.tsx:1) (Zod + RHF)
- Editar: [`src/app/admin/categorias/[id]/page.tsx`](src/app/admin/categorias/[id]/page.tsx:1) (Zod + RHF)
APIs:
- Criar: [`src/app/api/admin/categories/route.ts`](src/app/api/admin/categories/route.ts:1) POST
- Get/Editar/Excluir: [`src/app/api/admin/categories/[id]/route.ts`](src/app/api/admin/categories/[id]/route.ts:1) GET/PUT/DELETE

Pedidos:
- Listagem: [`src/app/admin/pedidos/page.tsx`](src/app/admin/pedidos/page.tsx:1)
- Detalhe: [`src/app/admin/pedidos/[id]/page.tsx`](src/app/admin/pedidos/[id]/page.tsx:1)
APIs:
- Detalhe/Atualização status: [`src/app/api/admin/orders/[id]/route.ts`](src/app/api/admin/orders/[id]/route.ts:1) GET/PUT

Usuários (Admin):
- Listagem SSR: [`src/app/admin/usuarios/page.tsx`](src/app/admin/usuarios/page.tsx:1)
- Detalhe SSR: [`src/app/admin/usuarios/[id]/page.tsx`](src/app/admin/usuarios/[id]/page.tsx:1)
APIs:
- Lista paginada/busca: [`src/app/api/admin/users/route.ts`](src/app/api/admin/users/route.ts:1) GET
- Get/Atualizar role: [`src/app/api/admin/users/[id]/route.ts`](src/app/api/admin/users/[id]/route.ts:1) GET/PUT

### APIs públicas
- Categorias: [`src/app/api/categories/route.ts`](src/app/api/categories/route.ts:1) GET
- Produtos (lista com paginação/filtro): [`src/app/api/products/route.ts`](src/app/api/products/route.ts:1) GET
- Produto por slug: [`src/app/api/products/[slug]/route.ts`](src/app/api/products/[slug]/route.ts:1) GET
- Registro: [`src/app/api/register/route.ts`](src/app/api/register/route.ts:1) POST

### APIs admin
- Protegidas por NextAuth + middleware (role ADMIN)
- Todas marcadas com `export const dynamic = "force-dynamic"`

## Webhooks
Stripe:
- Endpoint: [`src/app/api/stripe/webhook/route.ts`](src/app/api/stripe/webhook/route.ts:1)
- Configure seu endpoint no dashboard do Stripe (modo test) apontando para `${APP_BASE_URL}/api/stripe/webhook` e use o `STRIPE_WEBHOOK_SECRET`.

Fluxo ao receber `checkout.session.completed`:
1. Verifica e valida assinatura
2. Marca Order como PAID e salva `stripePaymentIntentId`
3. Baixa estoque de cada produto
4. Limpa itens do carrinho do usuário autenticado (se houver userId no pedido)

Observação: Para limpar carrinho por sessão (compras anônimas), estender o schema para persistir `cartSessionId` na Order e usá-la no webhook.

## Notas de build (Next.js 14)
- Páginas/rotas que acessam DB no runtime estão marcadas como `export const dynamic = "force-dynamic"` para evitar acesso em build time.
- Em produção (App Router), componentes client usando `useSearchParams` precisam estar envoltos em `Suspense` para evitar erro de build (já aplicado no `/login`).
- Dockerfile multi-stage já executa `prisma generate` e copia `migrations` no build.

## Roadmap breve
- Página pública de produto `/produto/[slug]` com SEO e next/image.
- Persistir `cartSessionId` no Order para limpeza do carrinho também para sessões anônimas via webhook.
- Padronizar toasts de sucesso/erro no Admin.
- Testes ponta a ponta do fluxo checkout → webhook → baixa de estoque → limpeza de carrinho.