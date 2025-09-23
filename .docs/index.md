# Documentação EcomercePro

## Índice

1. [Visão Geral do Projeto](./visao-geral.md)
2. [Arquitetura e Tecnologias](./arquitetura.md)
3. [Banco de Dados](./banco-dados.md)
4. [APIs e Endpoints](./apis.md)
5. [Autenticação e Autorização](./autenticacao.md)
6. [Fluxo de Compra](./fluxo-compra.md)
7. [Painel Administrativo](./admin.md)
8. [Configuração e Instalação](./instalacao.md)
9. [Variáveis de Ambiente](./variaveis-ambiente.md)
10. [Deploy e Produção](./deploy.md)
11. [Segurança](./seguranca.md)
12. [Roadmap e Melhorias](./roadmap.md)

---

## Resumo Executivo

O **EcomercePro** é uma plataforma de e-commerce completa desenvolvida em Next.js 14 com TypeScript, oferecendo uma experiência de compra moderna e um painel administrativo robusto. O sistema inclui integração com Stripe para pagamentos, autenticação via NextAuth, carrinho de compras persistente e gerenciamento completo de produtos, pedidos e usuários.

### Principais Características
- ✅ Catálogo de produtos com categorias
- ✅ Carrinho de compras por sessão e usuário
- ✅ Checkout seguro com Stripe
- ✅ Painel administrativo completo
- ✅ Autenticação e autorização por roles
- ✅ API RESTful
- ✅ Design responsivo com Tailwind CSS
- ✅ Suporte para modo escuro
- ✅ Dockerização completa

### Stack Tecnológica
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL 16
- **Pagamentos**: Stripe
- **Autenticação**: NextAuth.js
- **Validação**: Zod + React Hook Form
- **Containerização**: Docker & Docker Compose

---

## Começando

Para começar rapidamente com o projeto:

```bash
# Clone o repositório
git clone [url-do-repositorio]
cd EcomercePro

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Inicie com Docker
docker-compose up --build
```

Acesse: http://localhost:8180

Credenciais padrão:
- **Admin**: admin@demo.com / admin123
- **Usuário**: Registre-se através da interface

Para mais detalhes sobre configuração, consulte [Configuração e Instalação](./instalacao.md).