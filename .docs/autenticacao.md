# Autenticação e Autorização

## Visão Geral

O EcomercePro utiliza **NextAuth.js** como sistema de autenticação principal, implementando um fluxo seguro de autenticação baseado em **JSON Web Tokens (JWT)**. O sistema suporta **role-based access control (RBAC)** com dois níveis de permissão: `USER` e `ADMIN`.

## Tecnologias Utilizadas

### NextAuth.js
- **Versão**: 4.24.11
- **Provider**: Credentials Provider (email/senha)
- **Session Strategy**: JWT
- **Database**: PostgreSQL com Prisma

### Segurança
- **bcryptjs**: Hashing de senhas com salt rounds = 12
- **JWT**: Tokens assinados com chave secreta
- **CSRF Protection**: Proteção contra ataques CSRF
- **Session Management**: Gerenciamento seguro de sessões

## Configuração do NextAuth

### Arquivo de Configuração
`src/lib/auth.ts`

```typescript
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Lógica de autenticação
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      // Adicionar role ao token
    },
    async session({ session, token }) {
      // Adicionar role à sessão
    }
  }
}
```

## Fluxo de Autenticação

### 1. Registro de Usuário

#### Endpoint: POST /api/register
```typescript
// Fluxo completo de registro
1. Validação dos dados com Zod
2. Verificação se email já existe
3. Hash da senha com bcryptjs
4. Criação do usuário no banco
5. Retorno do usuário criado
```

#### Schema de Validação
```typescript
const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional()
})
```

### 2. Login

#### Endpoint: POST /api/auth/signin
```typescript
// Processo de login
1. Validação das credenciais
2. Busca do usuário por email
3. Verificação da senha com bcrypt.compare
4. Geração do JWT token
5. Retorno da sessão
```

#### Estrutura do Token JWT
```json
{
  "sub": "user-id",
  "email": "usuario@exemplo.com",
  "role": "USER",
  "iat": 1640995200,
  "exp": 1643587200
}
```

### 3. Logout

#### Endpoint: POST /api/auth/signout
- Invalida a sessão atual
- Remove o cookie de autenticação
- Redireciona para a página inicial

## Sistema de Roles e Permissões

### Roles Disponíveis

#### USER
- **Descrição**: Usuário comum da plataforma
- **Permissões**:
  - Visualizar catálogo de produtos
  - Adicionar produtos ao carrinho
  - Realizar compras
  - Visualizar histórico de pedidos
  - Atualizar perfil pessoal

#### ADMIN
- **Descrição**: Administrador da plataforma
- **Permissões**:
  - Todas as permissões de USER
  - Acesso ao painel administrativo
  - Gerenciar produtos (CRUD)
  - Gerenciar categorias (CRUD)
  - Gerenciar pedidos (visualizar/atualizar status)
  - Gerenciar usuários (visualizar/atualizar roles)
  - Acessar estatísticas da loja

### Middleware de Autorização

#### Arquivo: src/middleware.ts
```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Proteger rotas admin
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Proteger APIs admin
  if (pathname.startsWith("/api/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return NextResponse.next()
}
```

### Proteção de Rotas

#### Rotas Protegidas por Autenticação
- `/checkout/*` - Requer login
- `/minha-conta/*` - Requer login (planejado)
- `/api/cart` - Requer sessão válida

#### Rotas Protegidas por Role ADMIN
- `/admin/*` - Requer role ADMIN
- `/api/admin/*` - Requer role ADMIN

## Gerenciamento de Sessão

### Configuração de Sessão
```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 dias
  updateAge: 24 * 60 * 60, // 24 horas
}
```

### Cookies de Sessão

#### Cookie Principal
- **Nome**: `next-auth.session-token`
- **HttpOnly**: true
- **Secure**: true (em produção)
- **SameSite**: "lax"
- **Max-Age**: 30 dias

#### Cookie CSRF
- **Nome**: `next-auth.csrf-token`
- **Finalidade**: Proteção contra CSRF attacks
- **Expiração**: Sessão do navegador

## Componentes de Autenticação

### AuthProvider
`src/lib/auth-provider.tsx`

```typescript
"use client"

import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### HeaderAuth Component
`src/components/HeaderAuth.tsx`

```typescript
"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function HeaderAuth() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div>
        <span>{session.user?.email}</span>
        <button onClick={() => signOut()}>Sair</button>
      </div>
    )
  }

  return <button onClick={() => signIn()}>Entrar</button>
}
```

## Segurança

### Hashing de Senhas

#### Configuração bcryptjs
```typescript
import bcrypt from "bcryptjs"

const SALT_ROUNDS = 12

// Hash de senha
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

// Verificação de senha
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Proteção Contra Ataques

#### SQL Injection
- Uso de Prisma ORM que escapa automaticamente queries
- Nunca usar queries SQL diretas

#### XSS (Cross-Site Scripting)
- React escapa automaticamente conteúdo renderizado
- Validação de inputs com Zod

#### CSRF (Cross-Site Request Forgery)
- NextAuth.js inclui proteção CSRF
- Tokens CSRF são verificados automaticamente

#### Brute Force Protection
- Implementar rate limiting (planejado)
- Captcha após tentativas falhas (planejado)

## Fluxo de Recuperação de Senha

### Status: Em Desenvolvimento

#### Fluxo Planejado
1. Usuário solicita recuperação via email
2. Token único é gerado e enviado por email
3. Usuário clica no link com token
4. Redefine a senha com novo formulário
5. Token é invalidado após uso

#### Schema de Token
```typescript
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
}
```

## Integração com Outros Sistemas

### OAuth Providers (Planejado)

#### Google OAuth
```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })
]
```

#### GitHub OAuth
```typescript
providers: [
  GithubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  })
]
```

## Monitoramento e Logs

### Auditoria de Login
```typescript
// Log de tentativas de login
console.log(`Login attempt: ${email} - ${new Date().toISOString()}`)

// Log de logins bem-sucedidos
console.log(`Successful login: ${user.email} - ${new Date().toISOString()}`)

// Log de falhas de login
console.log(`Failed login: ${email} - ${new Date().toISOString()}`)
```

### Métricas de Autenticação
- Número de logins por dia
- Taxa de falhas de login
- Tempo médio de sessão
- Distribuição de roles

## Configuração de Produção

### Variáveis de Ambiente
```bash
# NextAuth
NEXTAUTH_URL=https://seusite.com
NEXTAUTH_SECRET=your-secret-key-here

# Segurança
NODE_ENV=production

# Banco de dados
DATABASE_URL=postgresql://...
```

### Configuração HTTPS
- Sempre usar HTTPS em produção
- Cookies marcados como Secure
- HSTS headers configurados

## Testes de Autenticação

### Testes Unitários
```typescript
describe("Authentication", () => {
  it("should hash password correctly", async () => {
    const password = "test123"
    const hashed = await bcrypt.hash(password, 12)
    const isValid = await bcrypt.compare(password, hashed)
    expect(isValid).toBe(true)
  })

  it("should validate user credentials", async () => {
    // Teste de validação de login
  })
})
```

### Testes de Integração
```typescript
describe("Login Flow", () => {
  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/signin")
      .send({
        email: "test@example.com",
        password: "password123"
      })
    expect(response.status).toBe(200)
  })
})
```

## Troubleshooting

### Problemas Comuns

#### "JWT_SECRET não encontrado"
**Solução**: Adicionar `NEXTAUTH_SECRET` nas variáveis de ambiente

#### "Erro de CORS"
**Solução**: Configurar `NEXTAUTH_URL` corretamente

#### "Session não persiste"
**Solução**: Verificar configuração de cookies e HTTPS

#### "Role não está no token"
**Solução**: Verificar callbacks do NextAuth.js

### Debugging
```typescript
// Ativar debug do NextAuth
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  // ... resto da configuração
}
```

## Próximas Melhorias

### Funcionalidades Planejadas
- [ ] Recuperação de senha por email
- [ ] Verificação de email
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth com Google e GitHub
- [ ] Histórico de atividades
- [ ] Sessões múltiplas
- [ ] Refresh tokens
- [ ] Rate limiting por IP
- [ ] Captcha para tentativas falhas
- [ ] Login social (Facebook, Twitter)

### Melhorias de Segurança
- [ ] Análise de comportamento suspeito
- [ ] Notificações de login de novos dispositivos
- [ ] Auditoria completa de ações
- [ ] Encriptação adicional de dados sensíveis