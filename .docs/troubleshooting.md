# Troubleshooting

## Visão Geral

Este documento fornece soluções para problemas comuns encontrados durante o desenvolvimento, deploy e manutenção do EcomercePro. Organizado por categorias para facilitar a localização rápida de soluções.

## Índice

1. [Instalação e Setup](#instalação-e-setup)
2. [Banco de Dados](#banco-de-dados)
3. [Autenticação](#autenticação)
4. [Stripe e Pagamentos](#stripe-e-pagamentos)
5. [Build e Deploy](#build-e-deploy)
6. [Performance](#performance)
7. [Erros Comuns](#erros-comuns)
8. [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
9. [Produção](#produção)
10. [Ferramentas de Debug](#ferramentas-de-debug)

---

## Instalação e Setup

### ❌ Erro: `npm install` falha

**Sintomas:**
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

**Soluções:**

1. **Limpar cache do npm:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Usar flag --legacy-peer-deps:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Verificar versão do Node.js:**
   ```bash
   node --version  # Deve ser v18+
   npm --version   # Deve ser v8+
   ```

### ❌ Erro: `prisma generate` falha

**Sintomas:**
```bash
Error: Generator "prisma-client-js" failed:
```

**Soluções:**

1. **Reinstalar Prisma:**
   ```bash
   npm uninstall prisma @prisma/client
   npm install prisma @prisma/client --save-dev
   ```

2. **Verificar schema.prisma:**
   ```bash
   npx prisma validate
   ```

3. **Gerar cliente manualmente:**
   ```bash
   npx prisma generate --schema=./prisma/schema.prisma
   ```

### ❌ Erro: Variáveis de ambiente não carregam

**Sintomas:**
```bash
Error: Please provide NEXTAUTH_SECRET
```

**Soluções:**

1. **Verificar arquivo .env.local:**
   ```bash
   ls -la .env.local  # Deve existir
   cat .env.local     # Deve conter todas as variáveis
   ```

2. **Reiniciar servidor de desenvolvimento:**
   ```bash
   npm run dev  # Parar e reiniciar
   ```

3. **Verificar sintaxe do .env:**
   ```bash
   # Correto
   NEXTAUTH_SECRET=your-secret-here
   
   # Incorreto
   NEXTAUTH_SECRET = "your-secret-here"
   ```

---

## Banco de Dados

### ❌ Erro: PostgreSQL connection failed

**Sintomas:**
```bash
Error: P1001: Can't reach database server
```

**Soluções:**

1. **Verificar PostgreSQL está rodando:**
   ```bash
   # Windows
   pg_ctl status
   
   # macOS/Linux
   brew services list | grep postgresql
   ```

2. **Verificar string de conexão:**
   ```bash
   # Testar conexão
   psql postgresql://user:password@localhost:5432/ecomercepro_dev
   ```

3. **Criar banco de dados:**
   ```bash
   createdb ecomercepro_dev
   ```

### ❌ Erro: Migration falha

**Sintomas:**
```bash
Error: P3006: Migration failed
```

**Soluções:**

1. **Resetar banco de dados:**
   ```bash
   npx prisma migrate reset
   ```

2. **Resolver conflitos de migration:**
   ```bash
   # Verificar status das migrations
   npx prisma migrate status
   
   # Resolver manualmente
   npx prisma db push --force-reset
   ```

3. **Criar nova migration:**
   ```bash
   npx prisma migrate dev --name fix-migration
   ```

### ❌ Erro: "relation does not exist"

**Sintomas:**
```bash
Error: The table `public.User` does not exist
```

**Soluções:**

1. **Verificar migrations aplicadas:**
   ```bash
   npx prisma migrate status
   ```

2. **Aplicar migrations pendentes:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Verificar schema do banco:**
   ```bash
   npx prisma db pull
   ```

---

## Autenticação

### ❌ Erro: NextAuth callback error

**Sintomas:**
```bash
[next-auth][error][CALLBACK_OAUTH_ERROR]
```

**Soluções:**

1. **Verificar URLs de callback OAuth:**
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`

2. **Verificar variáveis de ambiente:**
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GITHUB_ID=your-github-id
   GITHUB_SECRET=your-github-secret
   ```

3. **Verificar configuração NextAuth:**
   ```typescript
   // app/api/auth/[...nextauth]/route.ts
   export const authOptions = {
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       })
     ]
   }
   ```

### ❌ Erro: JWT secret não configurado

**Sintomas:**
```bash
[next-auth][error][NO_SECRET]
```

**Solução:**
```bash
# Gerar secret seguro
openssl rand -base64 32

# Adicionar ao .env.local
NEXTAUTH_SECRET=your-generated-secret
```

### ❌ Erro: Session não persiste

**Sintomas:**
- Login funciona mas session desaparece após refresh

**Soluções:**

1. **Verificar cookies:**
   ```typescript
   // app/api/auth/[...nextauth]/route.ts
   cookies: {
     sessionToken: {
       name: '__Secure-next-auth.session-token',
       options: {
         httpOnly: true,
         sameSite: 'lax',
         path: '/',
         secure: process.env.NODE_ENV === 'production'
       }
     }
   }
   ```

2. **Verificar dominio do cookie:**
   ```bash
   # Para desenvolvimento local
   NEXTAUTH_URL=http://localhost:3000
   ```

---

## Stripe e Pagamentos

### ❌ Erro: Stripe webhook signature verification failed

**Sintomas:**
```bash
StripeSignatureVerificationError: No signatures found
```

**Soluções:**

1. **Verificar webhook secret:**
   ```bash
   # Deve ser obtido do Stripe Dashboard
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. **Testar webhook local:**
   ```bash
   # Usar Stripe CLI
   stripe login
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Verificar endpoint webhook:**
   ```typescript
   // app/api/webhooks/stripe/route.ts
   const sig = headers().get('stripe-signature')
   const event = stripe.webhooks.constructEvent(
     body,
     sig!,
     process.env.STRIPE_WEBHOOK_SECRET!
   )
   ```

### ❌ Erro: Stripe payment failed

**Sintomas:**
```bash
Error: Your card was declined.
```

**Soluções:**

1. **Usar cartões de teste Stripe:**
   ```
   4242424242424242 - Visa (success)
   4000000000000002 - Card declined
   4000000000000259 - Requires authentication
   ```

2. **Verificar chaves de teste:**
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **Verificar configuração do Stripe:**
   ```typescript
   // lib/stripe.ts
   export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
     apiVersion: '2023-10-16',
   })
   ```

---

## Build e Deploy

### ❌ Erro: Build falha no Vercel

**Sintomas:**
```bash
Error: Command "npm run build" exited with 1
```

**Soluções:**

1. **Verificar build local:**
   ```bash
   npm run build
   ```

2. **Verificar variáveis de ambiente no Vercel:**
   - NEXTAUTH_URL
   - DATABASE_URL
   - STRIPE_SECRET_KEY
   - NEXTAUTH_SECRET

3. **Verificar limits do Vercel:**
   - Bundle size < 50MB
   - Function timeout < 30s

### ❌ Erro: Static generation failed

**Sintomas:**
```bash
Error: Failed to collect page data for /products/[id]
```

**Soluções:**

1. **Verificar data fetching:**
   ```typescript
   // Verificar se todas as chamadas de API retornam dados válidos
   export async function generateStaticParams() {
     const products = await getProducts()
     return products.map((product) => ({
       id: product.id
     }))
   }
   ```

2. **Adicionar tratamento de erro:**
   ```typescript
   export async function generateStaticParams() {
     try {
       const products = await getProducts()
       return products.map((product) => ({
         id: product.id
       }))
     } catch (error) {
       console.error('Failed to fetch products for static generation:', error)
       return []
     }
   }
   ```

### ❌ Erro: Image optimization failed

**Sintomas:**
```bash
Error: "url" parameter is valid but upstream response is invalid
```

**Soluções:**

1. **Verificar URLs de imagem:**
   ```typescript
   // Verificar se URLs são válidas
   const imageUrl = product.image.startsWith('http') 
     ? product.image 
     : `/uploads/${product.image}`
   ```

2. **Configurar domínios no next.config.js:**
   ```javascript
   module.exports = {
     images: {
       domains: ['localhost', 'your-domain.com', 'images.unsplash.com'],
     },
   }
   ```

---

## Performance

### ❌ Erro: Bundle size muito grande

**Sintomas:**
```bash
Warning: Bundle size exceeded 250KB
```

**Soluções:**

1. **Analisar bundle:**
   ```bash
   npm run build
   npm run analyze
   ```

2. **Code splitting:**
   ```typescript
   // Lazy loading de componentes
   const ProductList = dynamic(() => import('@/components/ProductList'))
   ```

3. **Tree shaking:**
   ```typescript
   // Importar apenas o necessário
   import { Button } from '@/components/ui/button'
   // Evitar: import * as Components from '@/components'
   ```

### ❌ Erro: Database queries lentas

**Sintomas:**
- Páginas carregando lentamente
- Timeouts em queries

**Soluções:**

1. **Adicionar índices:**
   ```sql
   CREATE INDEX idx_product_category ON products(category_id);
   CREATE INDEX idx_order_user ON orders(user_id);
   ```

2. **Otimizar queries Prisma:**
   ```typescript
   // Evitar N+1 queries
   const products = await prisma.product.findMany({
     include: {
       category: true,
       images: true
     }
   })
   ```

3. **Implementar caching:**
   ```typescript
   import { unstable_cache } from 'next/cache'
   
   const getProducts = unstable_cache(
     async () => {
       return await prisma.product.findMany()
     },
     ['products'],
     {
       revalidate: 60,
       tags: ['products']
     }
   )
   ```

---

## Erros Comuns

### ❌ Error: Hydration mismatch

**Sintomas:**
```bash
Warning: Text content does not match server-rendered HTML
```

**Soluções:**

1. **Verificar uso de Math.random() ou Date.now():**
   ```typescript
   // ❌ Ruim
   const id = Math.random()
   
   // ✅ Bom
   const [id, setId] = useState('')
   useEffect(() => {
     setId(Math.random().toString())
   }, [])
   ```

2. **Verificar diferenças de timezone:**
   ```typescript
   // Usar bibliotecas de timezone consistentes
   import { format } from 'date-fns'
   ```

### ❌ Error: "window is not defined"

**Sintomas:**
```bash
ReferenceError: window is not defined
```

**Soluções:**

1. **Verificar uso de browser APIs:**
   ```typescript
   // ✅ Bom - usar useEffect
   useEffect(() => {
     if (typeof window !== 'undefined') {
       // Código que usa window
     }
   }, [])
   ```

2. **Usar dynamic import:**
   ```typescript
   const ClientComponent = dynamic(
     () => import('@/components/ClientComponent'),
     { ssr: false }
   )
   ```

### ❌ Error: "Cannot read property of undefined"

**Sintomas:**
```bash
TypeError: Cannot read property 'name' of undefined
```

**Soluções:**

1. **Adicionar optional chaining:**
   ```typescript
   const name = product?.category?.name ?? 'Default'
   ```

2. **Validar dados:**
   ```typescript
   import { z } from 'zod'
   
   const productSchema = z.object({
     name: z.string(),
     category: z.object({
       name: z.string()
     })
   })
   ```

---

## Ambiente de Desenvolvimento

### ❌ Error: Port 3000 already in use

**Sintomas:**
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluções:**

1. **Windows:**
   ```bash
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **macOS/Linux:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

3. **Usar porta diferente:**
   ```bash
   npm run dev -- --port=3001
   ```

### ❌ Error: Hot reload não funciona

**Sintomas:**
- Mudanças não refletem no browser
- Server não reinicia automaticamente

**Soluções:**

1. **Verificar file watchers:**
   ```bash
   # Aumentar limite de watchers
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Limpar cache Next.js:**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## Produção

### ❌ Error: 404 after deploy

**Sintomas:**
- Rotas retornam 404
- Assets não carregam

**Soluções:**

1. **Verificar output do build:**
   ```bash
   npm run build
   npm start
   ```

2. **Verificar rewrites/redirects:**
   ```javascript
   // next.config.js
   module.exports = {
     async rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: '/api/:path*'
         }
       ]
     }
   }
   ```

### ❌ Error: CORS issues

**Sintomas:**
```bash
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Soluções:**

1. **Configurar headers no next.config.js:**
   ```javascript
   module.exports = {
     async headers() {
       return [
         {
           source: '/api/:path*',
           headers: [
             { key: 'Access-Control-Allow-Credentials', value: 'true' },
             { key: 'Access-Control-Allow-Origin', value: '*' },
             { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
             { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
           ]
         }
       ]
     }
   }
   ```

---

## Ferramentas de Debug

### Logs e Monitoramento

#### 1. Configurar logging estruturado
```typescript
// lib/logger.ts
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

export default logger
```

#### 2. Debug queries Prisma
```bash
# Habilitar logs de SQL
export DEBUG="prisma:*"
npm run dev
```

#### 3. Chrome DevTools
- **Performance tab**: Analisar performance
- **Network tab**: Verificar requests
- **Application tab**: Verificar cookies/localStorage
- **React DevTools**: Inspecionar componentes

### Comandos Úteis

#### Diagnóstico do sistema
```bash
# Verificar versões
node --version
npm --version
npx prisma --version

# Verificar dependências desatualizadas
npm outdated

# Verificar vulnerabilidades
npm audit
npm audit fix
```

#### Debug do banco de dados
```bash
# Conectar ao banco
psql postgresql://user:password@localhost:5432/ecomercepro_dev

# Verificar tabelas
\dt

# Verificar dados
SELECT COUNT(*) FROM products;
SELECT * FROM users LIMIT 5;
```

#### Debug do ambiente
```bash
# Verificar variáveis de ambiente
printenv | grep -E "(NEXTAUTH|STRIPE|DATABASE)"

# Testar conexão com API
curl -X GET http://localhost:3000/api/products
```

### Health Check

#### 1. Endpoint de health check
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: 'Database connection failed' },
      { status: 500 }
    )
  }
}
```

#### 2. Testar health check
```bash
curl http://localhost:3000/api/health
```

### Checklist de Troubleshooting

Ao encontrar um erro:

1. **✅ Verificar logs completos**
   - Terminal output
   - Browser console
   - Network tab

2. **✅ Verificar ambiente**
   - Variáveis de ambiente
   - Versões de dependências
   - Configurações locais

3. **✅ Testar isoladamente**
   - Reproduzir o erro em um novo projeto
   - Testar em ambiente limpo

4. **✅ Buscar na documentação**
   - Documentação oficial das ferramentas
   - Issues no GitHub
   - Stack Overflow

5. **✅ Pedir ajuda**
   - Criar issue detalhada
   - Fornecer informações completas
   - Incluir steps para reproduzir

### Template para Reportar Issues

```markdown
## Descrição do Problema
[Descreva claramente o que está acontecendo]

## Ambiente
- **OS**: [Windows/macOS/Linux]
- **Node.js**: [versão]
- **npm**: [versão]
- **Browser**: [se aplicável]

## Steps para Reproduzir
1. [Primeiro passo]
2. [Segundo passo]
3. [Terceiro passo]

## Comportamento Esperado
[O que você esperava que acontecesse]

## Comportamento Atual
[O que realmente está acontecendo]

## Logs/Error Messages
```
[Colar logs completos aqui]
```

## Screenshots
[Se aplicável, adicionar screenshots]

## Informações Adicionais
[Qualquer outra informação relevante]
```

---

## Contribuindo com Soluções

Se você encontrar uma solução para um problema não documentado:

1. **Teste a solução** em diferentes ambientes
2. **Documente a solução** seguindo o formato acima
3. **Crie uma PR** para adicionar ao troubleshooting
4. **Atualize a documentação** se necessário

**[⬆ Voltar ao topo](#visão-geral)**