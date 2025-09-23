# Contribuindo

## Visão Geral

Obrigado pelo interesse em contribuir para o EcomercePro! Este documento fornece diretrizes e instruções para contribuidores, garantindo que todas as contribuições mantenham a qualidade, consistência e segurança do projeto.

## Código de Conduta

### Nosso Compromisso

Nos comprometemos a criar um ambiente aberto e acolhedor para todos os contribuidores, independentemente de idade, tamanho corporal, deficiência, etnia, identidade e expressão de gênero, nível de experiência, nacionalidade, aparência pessoal, raça, religião ou identidade e orientação sexual.

### Comportamento Esperado

- **Seja respeitoso** nas interações com outros contribuidores
- **Aceite críticas construtivas** com graça
- **Foque no que é melhor para a comunidade**
- **Mostre empatia** com outros membros da comunidade

### Comportamento Inaceitável

- Uso de linguagem sexualizada ou comentários desagradáveis
- Trolling, insultos/comentários depreciativos e ataques pessoais ou políticos
- Assédio público ou privado
- Publicação de informações privadas de outros sem permissão explícita
- Outra conduta considerada inapropriada em um ambiente profissional

## Como Contribuir

### Processo de Contribuição

#### 1. Antes de Começar

1. **Verifique issues existentes**: Procure por issues relacionadas ao que você quer contribuir
2. **Comunique-se**: Comente na issue ou crie uma nova para discutir sua abordagem
3. **Fork o repositório**: Crie seu fork pessoal para trabalhar

#### 2. Configuração do Ambiente

```bash
# 1. Fork o repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/seu-usuario/EcomercePro.git
cd EcomercePro

# 3. Adicione o repositório upstream
git remote add upstream https://github.com/original/EcomercePro.git

# 4. Instale as dependências
npm install

# 5. Configure o ambiente de desenvolvimento
# Veja a seção "Configuração de Desenvolvimento" abaixo
```

#### 3. Desenvolvimento

1. **Crie uma branch** para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Faça suas alterações** seguindo as diretrizes de código

3. **Teste suas alterações**:
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   ```

4. **Commit suas mudanças** seguindo os padrões de commit

5. **Push para seu fork**:
   ```bash
   git push origin feature/nova-funcionalidade
   ```

6. **Crie um Pull Request** no GitHub

### Tipos de Contribuição

#### 🐛 Bug Fixes
- Reportar bugs via issues
- Corrigir bugs existentes
- Adicionar testes para bugs corrigidos

#### ✨ Features
- Novas funcionalidades significativas
- Melhorias de desempenho
- Novos componentes ou páginas

#### 📚 Documentação
- Atualizar README
- Adicionar exemplos de código
- Melhorar documentação de API
- Traduzir documentação

#### 🔧 Manutenção
- Refatoração de código
- Atualização de dependências
- Melhorias de segurança
- Otimização de performance

## Configuração de Desenvolvimento

### Requisitos do Sistema

- **Node.js**: v18.0.0 ou superior
- **npm**: v8.0.0 ou superior
- **PostgreSQL**: v13 ou superior
- **Git**: v2.30 ou superior

### Passos de Configuração

#### 1. Instalação de Dependências

```bash
# Instalar dependências do projeto
npm install

# Instalar dependências de desenvolvimento
npm install -D
```

#### 2. Configuração do Banco de Dados

```bash
# Criar banco de dados de desenvolvimento
createdb ecomercepro_dev

# Configurar variáveis de ambiente
cp .env.example .env.local

# Editar .env.local com suas configurações
```

#### 3. Configuração do Prisma

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev

# Seed do banco de dados (opcional)
npx prisma db seed
```

#### 4. Configuração do Stripe (Desenvolvimento)

```bash
# Adicionar chaves de teste ao .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 5. Servidor de Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# O servidor estará disponível em http://localhost:3000
```

### Configuração de IDEs

#### VS Code

1. **Extensões recomendadas**:
   - ESLint
   - Prettier
   - TypeScript
   - Prisma
   - Tailwind CSS IntelliSense
   - Auto Rename Tag
   - Bracket Pair Colorizer

2. **Configurações de workspace**:
   ```json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "typescript.preferences.importModuleSpecifier": "relative"
   }
   ```

3. **Launch configuration**:
   ```json
   // .vscode/launch.json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Next.js: debug server-side",
         "type": "node-terminal",
         "request": "launch",
         "command": "npm run dev"
       },
       {
         "name": "Next.js: debug client-side",
         "type": "chrome",
         "request": "launch",
         "url": "http://localhost:3000"
       }
     ]
   }
   ```

## Diretrizes de Código

### Padrões de Código TypeScript

#### Estilo de Código
- **Use TypeScript strict mode**
- **Prefira interfaces sobre types** para objetos
- **Use enums** para valores constantes
- **Evite any** - use unknown ou genéricos
- **Use async/await** ao invés de callbacks

#### Exemplos de Padrões

```typescript
// ✅ Bom
interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

async function getUser(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id }
    })
    return user
  } catch (error) {
    logger.error('Error fetching user', { error, userId: id })
    return null
  }
}

// ❌ Ruim
type User = any

function getUser(id) {
  return prisma.user.findUnique({ where: { id } })
}
```

### Padrões de Componentes React

#### Componentes Funcionais
```typescript
// ✅ Bom
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false
}) => {
  return (
    <button
      className={cn(
        'btn',
        `btn--${variant}`,
        { 'btn--disabled': disabled || loading }
      )}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

// ❌ Ruim
function Button(props) {
  return <button {...props} />
}
```

### Padrões de API

#### Rotas Next.js
```typescript
// ✅ Bom
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  categoryId: z.string().uuid()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true }
    })
    
    return NextResponse.json({ products })
  } catch (error) {
    logger.error('Error fetching products', { error })
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createProductSchema.parse(body)
    
    const product = await prisma.product.create({
      data: validatedData
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    
    logger.error('Error creating product', { error })
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
```

### Padrões de Estilo (Tailwind CSS)

#### Organização de Classes
```typescript
// ✅ Bom
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-lg font-semibold text-gray-900">Product Name</h2>
  <span className="text-sm text-gray-500">$99.99</span>
</div>

// ❌ Ruim
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm text-lg font-semibold text-gray-900">
  <!-- Classes misturadas -->
</div>
```

#### Componentes Reutilizáveis
```typescript
// ✅ Bom - Componentes de UI reutilizáveis
// components/ui/Card.tsx
export const Card = {
  Root: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  ),
  Header: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
  Content: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('p-6 pt-0', className)} {...props} />
  )
}

// Uso
<Card.Root>
  <Card.Header>
    <h3>Product Details</h3>
  </Card.Header>
  <Card.Content>
    <p>Product description...</p>
  </Card.Content>
</Card.Root>
```

## Padrões de Commit

### Formato Conventional Commits

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

#### Tipos de Commit
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação, ponto e vírgula, etc.
- **refactor**: Refatoração de código
- **test**: Adicionar ou modificar testes
- **chore**: Atualizar tarefas de build, configurações, etc.

#### Escopos Comuns
- **api**: Rotas da API
- **components**: Componentes React
- **lib**: Bibliotecas/utilitários
- **styles**: Estilos CSS/Tailwind
- **tests**: Arquivos de teste
- **docs**: Documentação
- **config**: Arquivos de configuração

#### Exemplos de Commits

```bash
# Nova funcionalidade
feat(products): add product search functionality

# Correção de bug
fix(cart): prevent duplicate items in cart

# Documentação
docs(api): update authentication endpoints documentation

# Refatoração
refactor(components): extract common button component

# Testes
test(auth): add unit tests for login flow

# Atualização de dependências
chore(deps): update next.js to version 14
```

### Template de Commit

```bash
# .gitmessage
# <tipo>(<escopo>): <assunto>
#
# <corpo>
#
# <rodapé>
#
# Tipos:
#   feat: Nova funcionalidade
#   fix: Correção de bug
#   docs: Documentação
#   style: Estilização
#   refactor: Refatoração
#   test: Testes
#   chore: Tarefas de manutenção
#
# Escopos:
#   api, components, lib, styles, tests, docs, config
#
# Rodapé:
#   Closes #123
#   BREAKING CHANGE: descrição
```

## Processo de Pull Request

### Template de PR

```markdown
## Descrição
Breve descrição das mudanças feitas.

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um problema)
- [ ] New feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)
- [ ] Documentação

## Como Testar
Descreva como testar as mudanças.

1. Passo 1
2. Passo 2
3. Passo 3

## Checklist
- [ ] Meu código segue os padrões do projeto
- [ ] Eu adicionei testes que provam que minha mudança funciona
- [ ] Eu atualizei a documentação conforme necessário
- [ ] Meu PR tem um título claro e descritivo
- [ ] Eu fiz squash de commits desnecessários

## Screenshots (se aplicável)
[Adicionar screenshots]

## Issues Relacionadas
Closes #123
```

### Processo de Revisão

#### Checklist do Revisor
- [ ] Código segue os padrões do projeto
- [ ] Testes estão presentes e passando
- [ ] Documentação foi atualizada
- [ ] Performance foi considerada
- [ ] Segurança foi verificada
- [ ] Acessibilidade foi considerada
- [ ] Não há breaking changes não documentados

#### Etiquetas de Revisão
- **needs-review**: PR precisa de revisão
- **changes-requested**: Mudanças solicitadas
- **approved**: PR aprovado
- **work-in-progress**: Ainda em desenvolvimento

## Diretrizes de Testes

### Cobertura de Testes
- **Unit tests**: 80% de cobertura mínima
- **Integration tests**: Fluxos críticos do sistema
- **E2E tests**: Principais jornadas do usuário
- **Performance tests**: APIs críticas e páginas principais

### Escrevendo Testes

#### Testes Unitários
```typescript
// ✅ Bom
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 99.99,
      stock: 10
    }
    
    render(<ProductCard product={product} />)
    
    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })
})
```

#### Testes de Integração
```typescript
// ✅ Bom
import request from 'supertest'
import { createApp } from '@/test/helpers'

describe('POST /api/products', () => {
  it('creates product with valid data', async () => {
    const productData = {
      name: 'New Product',
      price: 199.99,
      stock: 20,
      categoryId: 'category-123'
    }
    
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', 'Bearer admin-token')
      .send(productData)
      .expect(201)
    
    expect(response.body.name).toBe('New Product')
  })
})
```

## Ferramentas de Desenvolvimento

### Scripts Úteis

```json
{
  "scripts": {
    "dev": "Inicia servidor de desenvolvimento",
    "build": "Build para produção",
    "start": "Inicia servidor de produção",
    "test": "Executa todos os testes",
    "test:watch": "Testes em modo watch",
    "test:coverage": "Testes com relatório de cobertura",
    "test:e2e": "Testes end-to-end",
    "lint": "Verifica problemas de lint",
    "lint:fix": "Corrige problemas de lint automaticamente",
    "format": "Formata código com Prettier",
    "type-check": "Verifica tipos TypeScript",
    "db:migrate": "Executa migrações do banco",
    "db:seed": "Popula banco com dados de teste",
    "db:reset": "Reseta banco de dados"
  }
}
```

### Debugging

#### VS Code Debug Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "started server on .+, url: (https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

## Comunicação

### Canais de Comunicação

- **Issues**: Para bugs, features e discussões técnicas
- **Discussions**: Para perguntas e discussões gerais
- **Discord**: [Link do servidor Discord]
- **Email**: contato@sua-loja.com

### Obter Ajuda

1. **Verifique a documentação**: Consulte `.docs/`
2. **Procure issues existentes**: Talvez sua dúvida já foi respondida
3. **Crie uma discussion**: Para perguntas não relacionadas a bugs
4. **Peça ajuda no Discord**: Comunidade ativa para suporte

## Reconhecimento de Contribuidores

### Hall da Fama

Contribuidores que fizerem contribuições significativas serão reconhecidos:

- **README.md**: Lista de contribuidores
- **GitHub Contributors**: [Página de contribuidores](https://github.com/seu-usuario/EcomercePro/graphs/contributors)
- **Releases**: Menção em notas de release

### Níveis de Contribuição

#### 🥉 Bronze
- Primeiros 5 PRs aprovados
- Bug fixes significativos

#### 🥈 Prata
- 10+ PRs aprovados
- Features importantes
- Ajuda com revisão de código

#### 🥇 Ouro
- 20+ PRs aprovados
- Features principais
- Mentoria de novos contribuidores
- Manutenção de documentação

## FAQ

### Perguntas Frequentes

#### Como faço para rodar o projeto localmente?
```bash
git clone https://github.com/seu-usuario/EcomercePro.git
cd EcomercePro
npm install
cp .env.example .env.local
# Configure suas variáveis de ambiente
npm run dev
```

#### Qual versão do Node.js devo usar?
Use Node.js v18 ou superior. Recomendamos usar [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões.

#### Como testo minhas mudanças?
```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Todos os testes
npm run test:all
```

#### Onde reporto bugs?
Crie uma [issue no GitHub](https://github.com/seu-usuario/EcomercePro/issues) com:
- Descrição detalhada do bug
- Passos para reproduzir
- Screenshots (se aplicável)
- Ambiente (navegador, sistema operacional)

#### Posso trabalhar em issues existentes?
Sim! Comente na issue que você gostaria de trabalhar. Se não houver resposta em 7 dias, sinta-se livre para começar.

#### Como atualizo meu fork?
```bash
git remote add upstream https://github.com/original/EcomercePro.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Recursos Adicionais

### Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)

### Tutoriais

- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [TypeScript for React Developers](https://react.dev/learn/typescript)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)

## Agradecimentos

Agradecemos a todos os contribuidores que tornam este projeto melhor!

**[⬆ Voltar ao topo](#visão-geral)**