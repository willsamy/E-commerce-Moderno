# Variáveis de Ambiente

## Visão Geral

As variáveis de ambiente são essenciais para configurar o EcomercePro em diferentes ambientes (desenvolvimento, testes, produção). Este documento descreve todas as variáveis necessárias, suas finalidades e exemplos de configuração.

## Estrutura de Arquivos

### Arquivos de Ambiente
```
├── .env.example          # Template com todas as variáveis
├── .env.local           # Configurações locais (não commitar)
├── .env.development     # Ambiente de desenvolvimento
├── .env.test           # Ambiente de testes
├── .env.production     # Ambiente de produção
└── .env.staging        # Ambiente de staging
```

## Variáveis Essenciais

### 1. Configurações Básicas

#### NODE_ENV
```bash
# Define o ambiente de execução
NODE_ENV=development    # development | test | production
```

#### PORT
```bash
# Porta do servidor Next.js
PORT=3000               # Padrão: 3000
```

#### NEXT_PUBLIC_APP_URL
```bash
# URL base da aplicação (client-side)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Banco de Dados

#### DATABASE_URL
```bash
# URL de conexão com PostgreSQL
# Formato: postgresql://user:password@host:port/database

# Desenvolvimento
DATABASE_URL=postgresql://ecomerce_user:password@localhost:5432/ecomercepro_dev

# Produção
DATABASE_URL=postgresql://ecomerce_user:password@production-host:5432/ecomercepro_prod
```

#### DATABASE_SHADOW_URL (Opcional)
```bash
# Banco de dados shadow para Prisma Migrate
DATABASE_SHADOW_URL=postgresql://ecomerce_user:password@localhost:5432/ecomercepro_shadow
```

#### DATABASE_POOL_URL (Opcional)
```bash
# Pool de conexões para produção
DATABASE_POOL_URL=postgresql://ecomerce_user:password@pool-host:5432/ecomercepro_prod
```

### 3. Autenticação (NextAuth.js)

#### NEXTAUTH_URL
```bash
# URL base para NextAuth.js
NEXTAUTH_URL=http://localhost:3000                    # Desenvolvimento
NEXTAUTH_URL=https://sua-loja.com                     # Produção
```

#### NEXTAUTH_SECRET
```bash
# Chave secreta para criptografia de sessões
# Gerar com: openssl rand -base64 32
NEXTAUTH_SECRET=your-secret-key-here-32-chars-minimum
```

#### NEXTAUTH_JWT_SECRET (Opcional)
```bash
# Chave secreta específica para JWT
NEXTAUTH_JWT_SECRET=jwt-secret-key-here
```

### 4. Provedores de Autenticação

#### Google OAuth
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### GitHub OAuth
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### Credentials Provider
```bash
# Configurações para login com email/senha
BCRYPT_ROUNDS=12                                      # Número de rounds para bcrypt
```

### 5. Stripe (Pagamentos)

#### Chaves de API
```bash
# Chave pública (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Chave secreta (server-side)
STRIPE_SECRET_KEY=sk_test_...
```

#### Webhooks
```bash
# Webhook secret para validação
STRIPE_WEBHOOK_SECRET=whsec_...

# Endpoint de webhooks
STRIPE_WEBHOOK_ENDPOINT=/api/stripe/webhook
```

#### Configurações de Checkout
```bash
# URL de redirecionamento após pagamento
STRIPE_SUCCESS_URL=http://localhost:3000/checkout/success
STRIPE_CANCEL_URL=http://localhost:3000/checkout/cancel

# Moeda padrão
STRIPE_CURRENCY=brl
```

### 6. Upload de Imagens

#### Cloudinary
```bash
# Configurações do Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=ecomercepro
```

#### AWS S3 (Alternativa)
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=ecomercepro-images
```

### 7. Email (Planejado)

#### Resend (Recomendado)
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@sua-loja.com
RESEND_FROM_NAME=Sua Loja
```

#### SendGrid (Alternativa)
```bash
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@sua-loja.com
SENDGRID_FROM_NAME=Sua Loja
```

### 8. Redis (Cache e Sessões)

#### Configurações do Redis
```bash
# URL de conexão
REDIS_URL=redis://localhost:6379

# Senha (se necessário)
REDIS_PASSWORD=your-redis-password

# Número do banco de dados
REDIS_DB=0
```

### 9. Analytics

#### Google Analytics
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Facebook Pixel
```bash
NEXT_PUBLIC_FB_PIXEL_ID=1234567890
```

### 10. Segurança

#### Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100      # 100 requisições por janela
```

#### CORS
```bash
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

### 11. Logs e Monitoramento

#### Sentry
```bash
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=development
```

#### Logtail
```bash
LOGTAIL_SOURCE_TOKEN=...
```

## Configurações por Ambiente

### Desenvolvimento (.env.development)
```bash
# Configurações de desenvolvimento
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000

# Banco de dados local
DATABASE_URL=postgresql://ecomerce_user:password@localhost:5432/ecomercepro_dev

# Stripe modo teste
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Chaves de desenvolvimento
NEXTAUTH_SECRET=dev-secret-key
```

### Testes (.env.test)
```bash
# Configurações de teste
NODE_ENV=test
PORT=3001
NEXTAUTH_URL=http://localhost:3001

# Banco de dados de teste
DATABASE_URL=postgresql://ecomerce_user:password@localhost:5432/ecomercepro_test

# Stripe modo teste
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Produção (.env.production)
```bash
# Configurações de produção
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://sua-loja.com

# Banco de dados de produção
DATABASE_URL=postgresql://ecomerce_user:password@production-host:5432/ecomercepro_prod

# Stripe modo produção
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Segurança reforçada
NEXTAUTH_SECRET=production-secret-key-very-secure
```

### Staging (.env.staging)
```bash
# Configurações de staging
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://staging.sua-loja.com

# Banco de dados de staging
DATABASE_URL=postgresql://ecomerce_user:password@staging-host:5432/ecomercepro_staging

# Stripe modo teste (mesmo em staging)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Segurança das Variáveis

### Boas Práticas

#### 1. Nunca Commitar Arquivos .env
```bash
# .gitignore
.env
.env.local
.env.production
.env.staging
.env.*.local
```

#### 2. Usar Next.js App Router para Variáveis Client-Side
```typescript
// Variáveis públicas devem começar com NEXT_PUBLIC_
const apiKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

#### 3. Validar Variáveis no Início
```typescript
// lib/env.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'STRIPE_SECRET_KEY'
] as const

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`)
  }
})
```

#### 4. Usar Secrets Management (Produção)
```bash
# Vercel
vercel env add DATABASE_URL production

# AWS Secrets Manager
aws secretsmanager create-secret --name ecomercepro/env --secret-string file://.env.production

# GitHub Actions
# Adicionar secrets no repositório GitHub
```

## Validação de Variáveis

### Script de Validação
```typescript
// scripts/validate-env.js
const z = require('zod')

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
})

try {
  envSchema.parse(process.env)
  console.log('✅ Environment variables are valid')
} catch (error) {
  console.error('❌ Invalid environment variables:', error.errors)
  process.exit(1)
}
```

### Comando de Validação
```json
// package.json
{
  "scripts": {
    "validate-env": "node scripts/validate-env.js"
  }
}
```

## Troubleshooting

### Problemas Comuns

#### 1. Variável Não Encontrada
```bash
# Verificar se .env está sendo carregado
node -e "console.log(require('dotenv').config())"

# Verificar caminho do arquivo
ls -la .env*
```

#### 2. Erro de Tipo de Variável
```bash
# Verificar tipos
node -e "console.log(typeof process.env.PORT)"

# Converter tipos
PORT=parseInt(process.env.PORT || '3000')
```

#### 3. Variável Client-Side Não Disponível
```bash
# Verificar prefixo NEXT_PUBLIC_
echo $NEXT_PUBLIC_APP_URL

# Verificar se está no browser
console.log(process.env.NEXT_PUBLIC_APP_URL)
```

#### 4. Erro de Conexão com Banco
```bash
# Testar conexão manual
psql $DATABASE_URL -c "SELECT 1"

# Verificar host/porta
echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1
```

### Debug de Variáveis

#### Script de Debug
```typescript
// scripts/debug-env.js
console.log('Environment Variables Debug:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', process.env.PORT)
console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'))
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
```

#### Comando de Debug
```bash
# Executar debug
node scripts/debug-env.js

# Verificar todas as variáveis
printenv | grep -E "(DATABASE|NEXTAUTH|STRIPE|NEXT_PUBLIC)"
```

## Templates de Configuração

### .env.example Completo
```bash
# Configurações Básicas
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/ecomercepro

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Upload de Imagens
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@your-domain.com

# Redis (Opcional)
REDIS_URL=redis://localhost:6379

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FB_PIXEL_ID=1234567890

# Segurança
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Script de Setup Automático
```bash
#!/bin/bash
# scripts/setup-env.sh

echo "🚀 Setting up environment variables..."

# Criar .env.local se não existir
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
fi

# Gerar NEXTAUTH_SECRET se não existir
if ! grep -q "NEXTAUTH_SECRET=" .env.local; then
    SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
    echo "✅ Generated NEXTAUTH_SECRET"
fi

# Verificar se DATABASE_URL está configurado
if ! grep -q "DATABASE_URL=" .env.local; then
    echo "❌ Please configure DATABASE_URL in .env.local"
    exit 1
fi

echo "✅ Environment setup complete!"
```

## Integração com CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate environment
        run: npm run validate-env
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

### Vercel
```bash
# Configurar via CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
```

### Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Build
RUN npm run build

# Configurar variáveis
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

## Atualização de Variáveis

### Processo de Atualização
1. **Desenvolvimento**: Atualizar .env.local
2. **Staging**: Atualizar via Vercel CLI
3. **Produção**: Atualizar via Vercel Dashboard
4. **Documentar**: Atualizar este documento

### Notificação de Mudanças
```bash
# Script de notificação
#!/bin/bash
# scripts/notify-env-change.sh

# Enviar notificação para equipe
# Slack, Discord, ou email
```

## Auditoria de Variáveis

### Script de Auditoria
```typescript
// scripts/audit-env.js
const fs = require('fs')
const path = require('path')

const requiredVars = [
  'NODE_ENV',
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY'
]

const optionalVars = [
  'REDIS_URL',
  'CLOUDINARY_CLOUD_NAME',
  'RESEND_API_KEY',
  'SENTRY_DSN'
]

// Verificar variáveis
console.log('🔍 Environment Variables Audit')
console.log('================================')

requiredVars.forEach(varName => {
  const exists = !!process.env[varName]
  console.log(`${exists ? '✅' : '❌'} ${varName}`)
})

console.log('\nOptional Variables:')
optionalVars.forEach(varName => {
  const exists = !!process.env[varName]
  console.log(`${exists ? '✅' : '⚠️'} ${varName}`)
})
```