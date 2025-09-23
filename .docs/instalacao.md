# Instalação e Configuração

## Requisitos do Sistema

### Requisitos Mínimos
- **Node.js**: v18.17.0 ou superior
- **npm**: v9.0.0 ou superior (ou yarn v1.22.0+)
- **PostgreSQL**: v14.0 ou superior
- **Git**: v2.30.0 ou superior

### Requisitos Opcionais
- **Docker**: Para ambiente containerizado
- **Redis**: Para cache e sessões (recomendado para produção)
- **Stripe CLI**: Para testes de webhooks localmente

### Sistema Operacional
- **Windows**: Windows 10 ou superior
- **macOS**: macOS 10.15 ou superior
- **Linux**: Ubuntu 20.04 ou superior, CentOS 8 ou superior

## Instalação do Projeto

### 1. Clonar o Repositório

```bash
# Via HTTPS
git clone https://github.com/seu-usuario/EcomercePro.git

# Via SSH
git clone git@github.com:seu-usuario/EcomercePro.git

# Entrar no diretório
cd EcomercePro
```

### 2. Instalar Dependências

```bash
# Instalar todas as dependências
npm install

# Se preferir usar yarn
yarn install

# Verificar instalação
npm list --depth=0
```

### 3. Configurar Variáveis de Ambiente

#### Criar arquivo .env
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Ou criar manualmente
touch .env
```

#### Configurar Variáveis
```bash
# Banco de dados
DATABASE_URL="postgresql://usuario:senha@localhost:5432/ecomercepro"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_sua_chave_publica"
STRIPE_SECRET_KEY="sk_test_sua_chave_secreta"
STRIPE_WEBHOOK_SECRET="whsec_sua_webhook_secret"

# Outras configurações
NODE_ENV="development"
PORT="3000"
```

### 4. Configurar PostgreSQL

#### Instalação Local (Windows)
```bash
# Via Chocolatey
choco install postgresql

# Via Scoop
scoop install postgresql

# Iniciar serviço
net start postgresql-x64-14
```

#### Instalação Local (macOS)
```bash
# Via Homebrew
brew install postgresql
brew services start postgresql
```

#### Instalação Local (Linux - Ubuntu/Debian)
```bash
# Atualizar repositórios
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Criar Banco de Dados
```bash
# Conectar ao PostgreSQL
sudo -u postgres psql

# Criar usuário
CREATE USER ecomerce_user WITH PASSWORD 'sua_senha_segura';

# Criar banco de dados
CREATE DATABASE ecomercepro OWNER ecomerce_user;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE ecomercepro TO ecomerce_user;

# Sair
\q
```

### 5. Configurar Prisma

#### Instalar Prisma CLI (se não estiver instalado)
```bash
npm install -g prisma
```

#### Migrar Banco de Dados
```bash
# Gerar migrações
npx prisma migrate dev --name init

# Aplicar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

#### Popular Banco com Dados Iniciais
```bash
# Executar seed
npx prisma db seed

# Verificar dados
npx prisma studio
```

### 6. Configurar Stripe

#### Criar Conta de Teste
1. Acesse [stripe.com](https://stripe.com)
2. Crie uma conta de desenvolvedor
3. Obtenha as chaves de teste
4. Configure webhooks para localhost

#### Configurar Webhooks Local
```bash
# Instalar Stripe CLI
npm install -g stripe

# Login no Stripe
stripe login

# Escutar webhooks localmente
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Obter webhook secret
# O CLI vai gerar: whsec_...
```

### 7. Iniciar Servidor de Desenvolvimento

```bash
# Modo de desenvolvimento
npm run dev

# Ou com yarn
yarn dev

# Servidor vai iniciar em: http://localhost:3000
```

## Instalação com Docker

### 1. Pré-requisitos
```bash
# Instalar Docker
# Windows: Docker Desktop
# macOS: Docker Desktop
# Linux: Instalar via gerenciador de pacotes

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Configurar Docker

#### Criar docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: ecomerce_user
      POSTGRES_PASSWORD: sua_senha_segura
      POSTGRES_DB: ecomercepro
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      DATABASE_URL: postgresql://ecomerce_user:sua_senha_segura@postgres:5432/ecomercepro
      REDIS_URL: redis://redis:6379

volumes:
  postgres_data:
```

### 3. Construir e Iniciar
```bash
# Construir imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## Configuração de Ambiente

### Desenvolvimento
```bash
# Arquivo .env.development
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://localhost:5432/ecomercepro_dev
```

### Testes
```bash
# Arquivo .env.test
NODE_ENV=test
DATABASE_URL=postgresql://localhost:5432/ecomercepro_test
```

### Produção
```bash
# Arquivo .env.production
NODE_ENV=production
NEXTAUTH_URL=https://sua-loja.com
DATABASE_URL=postgresql://usuario:senha@host:5432/ecomercepro_prod
```

## Verificação da Instalação

### 1. Testar Conexão com Banco
```bash
# Testar conexão
npx prisma db pull

# Verificar tabelas
npx prisma db execute --file schema.sql
```

### 2. Testar API
```bash
# Testar endpoint de produtos
curl http://localhost:3000/api/products

# Testar autenticação
curl -X POST http://localhost:3000/api/auth/signin
```

### 3. Testar Stripe
```bash
# Testar checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"test","quantity":1}]}'
```

### 4. Verificar Logs
```bash
# Verificar logs do servidor
tail -f .next/server/logs/app.log

# Verificar logs do Prisma
DEBUG="prisma:*" npm run dev
```

## Troubleshooting

### Problemas Comuns

#### Erro: "Cannot connect to database"
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar porta
netstat -an | grep 5432

# Testar conexão manual
psql -h localhost -U ecomerce_user -d ecomercepro
```

#### Erro: "Prisma migration failed"
```bash
# Resetar banco de dados
npx prisma migrate reset

# Limpar cache do Prisma
npx prisma generate --force

# Verificar schema.prisma
npx prisma validate
```

#### Erro: "NextAuth secret not configured"
```bash
# Gerar secret
openssl rand -base64 32

# Adicionar ao .env
NEXTAUTH_SECRET="sua-chave-gerada-aqui"
```

#### Erro: "Stripe webhook not working"
```bash
# Verificar webhook secret
stripe listen --print-secret

# Testar webhook manual
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: ..."
```

#### Erro: "Permission denied"
```bash
# Windows: Executar como administrador
# Linux/macOS: Verificar permissões de arquivo
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Debug Mode
```bash
# Habilitar debug completo
DEBUG=* npm run dev

# Debug específico do Prisma
DEBUG=prisma:* npm run dev

# Debug do Next.js
NODE_OPTIONS="--inspect" npm run dev
```

## Configuração de IDE

### VS Code
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Extensões Recomendadas
- **ESLint**: Para linting
- **Prettier**: Para formatação
- **Prisma**: Para syntax highlighting
- **Tailwind CSS IntelliSense**: Para autocomplete
- **Thunder Client**: Para testar APIs

## Scripts Úteis

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "test": "jest",
    "test:watch": "jest --watch",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/stripe/webhook"
  }
}
```

### Comandos Personalizados
```bash
# Criar alias no ~/.bashrc ou ~/.zshrc
alias dev='npm run dev'
alias build='npm run build'
alias migrate='npx prisma migrate dev'
alias seed='npx prisma db seed'
alias studio='npx prisma studio'
```

## Próximos Passos

### Após Instalação
1. **Criar usuário admin**: Acessar `/admin/register` (primeiro acesso)
2. **Configurar categorias**: Adicionar categorias iniciais
3. **Adicionar produtos**: Criar produtos de exemplo
4. **Testar fluxo de compra**: Fazer uma compra de teste
5. **Configurar webhooks**: Configurar webhooks do Stripe
6. **Testar emails**: Configurar serviço de email

### Documentação Adicional
- [Configuração de Produção](./deploy.md)
- [Segurança](./seguranca.md)
- [APIs](./apis.md)
- [Banco de Dados](./banco-dados.md)

## Comunidade e Suporte

### Obter Ajuda
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/EcomercePro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/seu-usuario/EcomercePro/discussions)
- **Discord**: [Servidor do Projeto](https://discord.gg/seu-servidor)

### Contribuir
- **Fork**: Fazer fork do projeto
- **Branch**: Criar branch para sua feature
- **Pull Request**: Enviar pull request
- **Code Review**: Revisar código de outros contribuidores

### Atualizar Projeto
```bash
# Atualizar dependências
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix

# Atualizar Prisma
npx prisma migrate dev
npx prisma generate
```