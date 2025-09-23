# 🚀 Guia de Deploy - E-commerce Moderno na Vercel

Este guia fornece instruções passo a passo para fazer o deploy do E-commerce Moderno na Vercel.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [GitHub](https://github.com) (código já está no repositório)
- Conta no [Stripe](https://stripe.com) para pagamentos
- Banco de dados PostgreSQL (recomendado: Vercel Postgres ou PlanetScale)

## 🔧 Configuração do Banco de Dados

### Opção 1: Vercel Postgres (Recomendado)
1. Acesse o dashboard da Vercel
2. Vá em "Storage" → "Create Database" → "Postgres"
3. Escolha um nome para o banco
4. Copie a `DATABASE_URL` gerada

### Opção 2: PlanetScale
1. Crie uma conta no [PlanetScale](https://planetscale.com)
2. Crie um novo banco de dados
3. Obtenha a connection string no formato MySQL

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe o repositório: `https://github.com/willsamy/E-commerce-Moderno`
4. Selecione a branch `clean-main`

### 2. Configurar Variáveis de Ambiente
Na seção "Environment Variables" do projeto na Vercel, adicione **EXATAMENTE** estas variáveis:

> ⚠️ **IMPORTANTE**: Use exatamente estes nomes de variáveis. O sistema não aceita nomes diferentes.

> 🔥 **CRÍTICO**: Você DEVE configurar o `DATABASE_URL` primeiro! Sem ele, o deploy falhará.

#### Configurações Básicas
```env
# URL base da aplicação
APP_BASE_URL=https://seu-projeto.vercel.app

# NextAuth
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=seu_nextauth_secret_super_seguro_aqui

# Banco de dados (OBRIGATÓRIO!)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

#### Configurações do Stripe
```env
# Chaves do Stripe (obtenha em https://dashboard.stripe.com/apikeys)
STRIPE_PUBLIC_KEY=pk_live_sua_chave_publica_aqui
STRIPE_SECRET_KEY=sk_live_sua_chave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

> 📝 **Nota**: Não use "Secrets" da Vercel, apenas "Environment Variables" normais.

### 3. Configurar Webhook do Stripe
1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. URL do endpoint: `https://seu-projeto.vercel.app/api/stripe/webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o "Signing secret" e adicione como `STRIPE_WEBHOOK_SECRET`

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar (pode levar alguns minutos)
3. Acesse a URL gerada pela Vercel

## 🗄️ Configuração do Banco de Dados

Após o primeiro deploy, execute as migrações:

### Via Vercel CLI (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Executar comando no ambiente de produção
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

### Via Dashboard da Vercel
1. Vá em "Functions" → "Edge Config"
2. Execute os comandos de migração manualmente

## 🔒 Configurações de Segurança

### Headers de Segurança
O arquivo `vercel.json` já inclui headers de segurança:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

### Variáveis de Ambiente
- ✅ Todas as chaves sensíveis estão configuradas como variáveis de ambiente
- ✅ Arquivo `.env.example` não contém dados reais
- ✅ `.env` está no `.gitignore`

## 📊 Monitoramento

### Analytics da Vercel
- Ative o Vercel Analytics no dashboard
- Monitore performance e uso

### Logs
- Acesse logs em tempo real via dashboard da Vercel
- Configure alertas para erros críticos

## 🔄 Atualizações

### Deploy Automático
- Pushes para a branch `clean-main` fazem deploy automático
- Preview deployments para outras branches

### Rollback
```bash
# Via CLI
vercel rollback [deployment-url]
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### Erro: "the URL must start with the protocol postgresql:// or postgres://"
```bash
# SOLUÇÃO: Este erro ocorre quando DATABASE_URL não está configurada ou está incorreta
# 
# 1. VERIFICAR se você configurou DATABASE_URL no dashboard da Vercel
# 2. FORMATO CORRETO para PostgreSQL:
#    DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
#    ou
#    DATABASE_URL=postgres://username:password@host:port/database?sslmode=require
#
# 3. Para Vercel Postgres:
#    - Vá em Storage → Create Database → Postgres
#    - Copie a connection string gerada
#    - Cole como DATABASE_URL nas Environment Variables
#
# 4. Para PlanetScale (MySQL):
#    - Use: DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
#    - Mas você precisará alterar o provider no schema.prisma para "mysql"
```

#### Erro: "Environment Variable references Secret which does not exist"
```bash
# SOLUÇÃO: Este erro ocorre quando o vercel.json usa "@secret_name" ao invés de "$VARIABLE_NAME"
# ✅ CORRETO: "$DATABASE_URL" (variável de ambiente)
# ❌ ERRADO: "@database_url" (secret que não existe)

# Verificar se o vercel.json usa a sintaxe correta:
# "DATABASE_URL": "$DATABASE_URL"
# 
# E configurar as variáveis no dashboard da Vercel como "Environment Variables", 
# NÃO como "Secrets"
```

#### Build Falha
```bash
# Verificar logs no dashboard da Vercel
# Comum: dependências em devDependencies que deveriam estar em dependencies
```

#### Erro de Banco de Dados
```bash
# Verificar se DATABASE_URL está correta
# Executar migrações: npx prisma migrate deploy
```

#### Webhook do Stripe não funciona
```bash
# Verificar se STRIPE_WEBHOOK_SECRET está correto
# URL do webhook deve ser: https://seu-dominio.vercel.app/api/stripe/webhook
```

#### Erro de Autenticação
```bash
# Verificar NEXTAUTH_URL e NEXTAUTH_SECRET
# NEXTAUTH_URL deve ser a URL de produção
```

## 📱 Domínio Customizado

### Configurar Domínio
1. Vá em "Settings" → "Domains"
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Atualize `APP_BASE_URL` e `NEXTAUTH_URL`

## 🎯 Otimizações de Performance

### Já Implementadas
- ✅ Compressão de imagens
- ✅ Code splitting automático
- ✅ Static generation onde possível
- ✅ Edge functions para APIs críticas

### Recomendações Adicionais
- Configure CDN para assets estáticos
- Ative Vercel Analytics
- Configure cache headers personalizados se necessário

## 📞 Suporte

### Recursos Úteis
- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do Stripe](https://stripe.com/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)

### Contato
Para suporte específico do projeto, abra uma issue no repositório GitHub.

---

## ✅ Checklist de Deploy

- [ ] Repositório conectado à Vercel
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Banco de dados criado e configurado
- [ ] Migrações executadas
- [ ] Webhook do Stripe configurado
- [ ] Primeiro deploy realizado com sucesso
- [ ] Testes de funcionalidade básica
- [ ] Domínio customizado (opcional)
- [ ] Monitoramento ativado

**🎉 Parabéns! Seu E-commerce Moderno está no ar!**