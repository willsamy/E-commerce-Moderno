# Guia de Deploy

## Visão Geral

Este guia cobre todos os aspectos necessários para fazer o deploy do EcomercePro em diferentes plataformas e ambientes, desde o deploy simples no Vercel até configurações avançadas em AWS, Docker e outras plataformas.

## Preparação para Deploy

### 1. Checklist Pré-Deploy

#### Código e Qualidade
- [ ] Todos os testes passando (`npm test`)
- [ ] Linting sem erros (`npm run lint`)
- [ ] Build local bem-sucedido (`npm run build`)
- [ ] Variáveis de ambiente configuradas
- [ ] Código no repositório Git

#### Segurança
- [ ] Variáveis sensíveis removidas do código
- [ ] Secrets configurados na plataforma
- [ ] HTTPS habilitado
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado

#### Performance
- [ ] Imagens otimizadas
- [ ] Bundle size verificado
- [ ] Core Web Vitals testados
- [ ] Cache configurado

### 2. Configuração de Produção

#### Variáveis de Ambiente de Produção
```bash
# .env.production
NODE_ENV=production
NEXTAUTH_URL=https://sua-loja.com
NEXTAUTH_SECRET=production-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/ecomercepro_prod
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Configuração do Banco de Produção
```sql
-- Criar banco de produção
CREATE DATABASE ecomercepro_prod;
CREATE USER ecomerce_prod_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE ecomercepro_prod TO ecomerce_prod_user;

-- Configurar conexões
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';
```

## Deploy na Vercel (Recomendado)

### 1. Deploy Automático via Git

#### Configuração Inicial
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy inicial
vercel --prod
```

#### Configuração via Dashboard
1. Acesse [vercel.com](https://vercel.com)
2. Importe seu repositório GitHub
3. Configure as variáveis de ambiente
4. Deploy automático ao fazer push

#### Variáveis de Ambiente no Vercel
```bash
# Via CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production

# Via Dashboard
# Settings > Environment Variables
```

#### Configuração do vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Build Settings
```json
{
  "build": {
    "env": {
      "DATABASE_URL": "@database_url",
      "NEXTAUTH_SECRET": "@nextauth_secret"
    }
  }
}
```

## Deploy com Docker

### 1. Dockerfile Completo

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### .dockerignore
```
Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.env.local
.git
.gitignore
.next
.vercel
.coverage
.nyc_output
```

### 2. Docker Compose para Produção

#### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://ecomerce_user:password@postgres:5432/ecomercepro_prod
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=https://sua-loja.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: ecomerce_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ecomercepro_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Build e Deploy com Docker

```bash
# Build da imagem
docker build -t ecomercepro:latest .

# Build com cache
docker build --cache-from ecomercepro:latest -t ecomercepro:latest .

# Executar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f app

# Atualizar serviço
docker-compose pull && docker-compose up -d
```

## Deploy na AWS

### 1. AWS ECS com Fargate

#### Configuração do ECS
```json
{
  "family": "ecomercepro",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "ecomercepro",
      "image": "your-account.dkr.ecr.region.amazonaws.com/ecomercepro:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ecomercepro",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 2. AWS Elastic Beanstalk

#### .ebextensions/01_environment.config
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 3000
  aws:elasticbeanstalk:container:nodejs:
    NodeVersion: 18
  aws:autoscaling:asg:
    MinSize: 2
    MaxSize: 6
```

#### Deploy com EB CLI
```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar
eb init -p node.js ecomercepro

# Criar ambiente
eb create ecomercepro-prod

# Deploy
eb deploy

# Configurar variáveis
eb setenv DATABASE_URL=... NEXTAUTH_SECRET=...
```

### 3. AWS Amplify

#### amplify.yml
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

## Deploy no Railway

### 1. Configuração Simples
```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Configurar variáveis
railway variables set DATABASE_URL=... NEXTAUTH_SECRET=...
```

### 2. railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Deploy no Heroku

### 1. Configuração do Heroku
```bash
# Instalar Heroku CLI
npm i -g heroku

# Login
heroku login

# Criar app
heroku create ecomercepro-app

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set NEXTAUTH_SECRET=your-secret

# Deploy
git push heroku main
```

### 2. Procfile
```
web: npm start
```

## Deploy em VPS/Dedicated Server

### 1. Configuração Manual

#### Instalação no Servidor
```bash
# Conectar ao servidor
ssh user@your-server.com

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm i -g pm2

# Clonar repositório
git clone https://github.com/your-repo/ecomercepro.git
cd ecomercepro

# Instalar dependências
npm ci --production

# Build
npm run build

# Iniciar com PM2
pm2 start npm --name "ecomercepro" -- start

# Salvar configuração
pm2 save
pm2 startup
```

#### Configuração do PM2
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ecomercepro',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://...',
      NEXTAUTH_SECRET: '...'
    }
  }]
}
```

### 2. Configuração do Nginx

#### nginx.conf
```nginx
upstream ecomercepro {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name sua-loja.com;
    
    location / {
        proxy_pass http://ecomercepro;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name sua-loja.com;
    
    ssl_certificate /etc/ssl/certs/sua-loja.com.crt;
    ssl_certificate_key /etc/ssl/private/sua-loja.com.key;
    
    location / {
        proxy_pass http://ecomercepro;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d sua-loja.com -d www.sua-loja.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoramento e Logs

### 1. Configuração de Logs

#### PM2 Logs
```bash
# Ver logs
pm2 logs ecomercepro

# Monitorar
pm2 monit

# Configurar rotação de logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
```

### 2. Health Checks

#### Endpoint de Health
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    return NextResponse.json({ status: 'error' }, { status: 503 })
  }
}
```

### 3. Monitoramento com Sentry
```bash
# Instalar Sentry
npm install @sentry/nextjs

# Configurar
npx @sentry/wizard@latest -i nextjs

# Adicionar ao .env.production
SENTRY_DSN=your-dsn-here
```

## Rollback e Manutenção

### 1. Estratégia de Rollback

#### Rollback no Vercel
```bash
# Ver deployments
vercel ls

# Rollback para versão anterior
vercel rollback [deployment-url]
```

#### Rollback com Docker
```bash
# Tag de backup
docker tag ecomercepro:latest ecomercepro:backup

# Rollback
docker service update --image ecomercepro:backup ecomercepro
```

### 2. Manutenção Programada
```bash
# Criar página de manutenção
# public/maintenance.html

# Ativar modo de manutenção
touch /tmp/maintenance.flag

# Desativar
rm /tmp/maintenance.flag
```

## Checklist Final de Deploy

### Antes do Deploy
- [ ] Backup do banco de dados
- [ ] Testes de integração passando
- [ ] Performance testada
- [ ] Segurança verificada
- [ ] Documentação atualizada

### Durante o Deploy
- [ ] Monitorar logs
- [ ] Verificar health checks
- [ ] Testar funcionalidades críticas
- [ ] Confirmar webhooks funcionando

### Após o Deploy
- [ ] Verificar métricas
- [ ] Testar fluxo de compra completo
- [ ] Confirmar emails sendo enviados
- [ ] Atualizar DNS se necessário
- [ ] Notificar equipe

## Troubleshooting de Deploy

### Problemas Comuns

#### Build falhando
```bash
# Limpar cache
docker system prune -a
npm run clean

# Verificar logs
npm run build --verbose
```

#### Database connection timeout
```bash
# Verificar connection pool
DATABASE_URL="postgresql://...?connection_limit=10"

# Aumentar timeout
DATABASE_URL="postgresql://...?connect_timeout=30"
```

#### Memory issues
```bash
# Limitar memória no Node.js
node --max-old-space-size=4096 server.js

# Configurar no PM2
pm2 start ecosystem.config.js --max-memory-restart 1G
```

### Suporte e Monitoramento
- **Status Page**: Criar página de status
- **Alertas**: Configurar alertas de erro
- **Escalation**: Processo de escalonamento
- **Documentação**: Manter runbooks atualizados