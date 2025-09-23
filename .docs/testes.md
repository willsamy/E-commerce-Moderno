# Testes

## Visão Geral

A documentação de testes do EcomercePro cobre todos os aspectos de garantia de qualidade, desde testes unitários até testes de integração e end-to-end. Nosso objetivo é garantir que cada funcionalidade funcione corretamente, seja segura e ofereça uma excelente experiência ao usuário.

## Arquitetura de Testes

### 1. Estratégia de Testes

#### Pirâmide de Testes
```
        /\
       /  \
  E2E /    \  5%
     /      \
    /        \
   /          \
  /  Integraç  \  25%
 /    ção       \
/________________\
    Unitários    70%
```

#### Tipos de Testes
- **Unitários**: Testam funções e componentes individualmente
- **Integração**: Testam interações entre componentes
- **E2E**: Testam fluxos completos do usuário
- **Performance**: Testam carga e velocidade
- **Segurança**: Testam vulnerabilidades
- **Acessibilidade**: Testam conformidade WCAG

### 2. Stack de Testes

#### Ferramentas Utilizadas
```json
{
  "unit": {
    "framework": "Jest",
    "mocking": "Jest Mock",
    "assertions": "Jest + Testing Library"
  },
  "integration": {
    "framework": "Jest",
    "database": "PostgreSQL Test Container",
    "http": "Supertest"
  },
  "e2e": {
    "framework": "Playwright",
    "browsers": ["Chrome", "Firefox", "Safari"],
    "mobile": ["iOS", "Android"]
  },
  "performance": {
    "load": "K6",
    "frontend": "Lighthouse",
    "monitoring": "New Relic"
  }
}
```

## Testes Unitários

### 1. Configuração do Jest

#### jest.config.js
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/*.(test|spec).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1'
  }
}
```

#### Configuração de Teste
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfills para ambiente de teste
Object.assign(global, { TextEncoder, TextDecoder })

// Mock do Next.js Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn()
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  }
}))

// Mock do Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(null))
}))

// Mock do Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn()
    }
  }
}))
```

### 2. Testes de Componentes

#### Testes de Componentes React
```typescript
// src/components/__tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'
import { CartProvider } from '@/contexts/CartContext'

const mockProduct = {
  id: '1',
  name: 'Produto Teste',
  price: 99.99,
  images: ['image1.jpg'],
  stock: 10
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    )
    
    expect(screen.getByText('Produto Teste')).toBeInTheDocument()
    expect(screen.getByText('R$ 99,99')).toBeInTheDocument()
  })
  
  it('handles add to cart functionality', async () => {
    const addToCart = jest.fn()
    
    render(
      <CartContext.Provider value={{ addToCart }}>
        <ProductCard product={mockProduct} />
      </CartContext.Provider>
    )
    
    const addButton = screen.getByRole('button', { name: /adicionar/i })
    fireEvent.click(addButton)
    
    expect(addToCart).toHaveBeenCalledWith(mockProduct)
  })
  
  it('displays out of stock message', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    
    render(
      <CartProvider>
        <ProductCard product={outOfStockProduct} />
      </CartProvider>
    )
    
    expect(screen.getByText('Fora de estoque')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### 3. Testes de Hooks

#### Testes de Hooks Customizados
```typescript
// src/hooks/__tests__/useCart.test.ts
import { renderHook, act } from '@testing-library/react'
import { useCart } from '@/hooks/useCart'
import { CartProvider } from '@/contexts/CartContext'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

describe('useCart', () => {
  it('adds product to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    const product = { id: '1', name: 'Test Product', price: 100 }
    
    act(() => {
      result.current.addToCart(product, 2)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })
  
  it('removes product from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    const product = { id: '1', name: 'Test Product', price: 100 }
    
    act(() => {
      result.current.addToCart(product)
      result.current.removeFromCart('1')
    })
    
    expect(result.current.items).toHaveLength(0)
  })
  
  it('calculates total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart({ id: '1', name: 'Product 1', price: 100 }, 2)
      result.current.addToCart({ id: '2', name: 'Product 2', price: 50 }, 1)
    })
    
    expect(result.current.total).toBe(250)
  })
})
```

### 4. Testes de Utilitários

#### Testes de Funções de Utilidade
```typescript
// src/lib/__tests__/price-utils.test.ts
import { formatPrice, calculateDiscount, calculateTax } from '@/lib/price-utils'

describe('Price Utils', () => {
  describe('formatPrice', () => {
    it('formats price correctly', () => {
      expect(formatPrice(99.99)).toBe('R$ 99,99')
      expect(formatPrice(1000)).toBe('R$ 1.000,00')
      expect(formatPrice(0.99)).toBe('R$ 0,99')
    })
    
    it('handles edge cases', () => {
      expect(formatPrice(0)).toBe('R$ 0,00')
      expect(formatPrice(-10)).toBe('-R$ 10,00')
    })
  })
  
  describe('calculateDiscount', () => {
    it('calculates discount correctly', () => {
      expect(calculateDiscount(100, 10)).toBe(90)
      expect(calculateDiscount(50, 50)).toBe(25)
    })
    
    it('handles invalid discount', () => {
      expect(calculateDiscount(100, -10)).toBe(100)
      expect(calculateDiscount(100, 110)).toBe(100)
    })
  })
  
  describe('calculateTax', () => {
    it('calculates tax correctly', () => {
      expect(calculateTax(100, 0.1)).toBe(110)
      expect(calculateTax(50, 0.05)).toBe(52.5)
    })
  })
})
```

## Testes de Integração

### 1. Configuração do Banco de Testes

#### PostgreSQL Test Container
```typescript
// src/test/setup-integration.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'

let postgresContainer: any
let prisma: PrismaClient

export async function setupTestDatabase() {
  postgresContainer = await new PostgreSqlContainer()
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start()
  
  const databaseUrl = postgresContainer.getConnectionUri()
  
  process.env.DATABASE_URL = databaseUrl
  
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })
  
  // Run migrations
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl }
  })
  
  return { prisma, postgresContainer }
}

export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect()
  }
  if (postgresContainer) {
    await postgresContainer.stop()
  }
}
```

### 2. Testes de API

#### Testes de Endpoints REST
```typescript
// src/app/api/__tests__/products.test.ts
import request from 'supertest'
import { createApp } from '@/test/helpers'
import { setupTestDatabase, teardownTestDatabase } from '@/test/setup-integration'

describe('/api/products', () => {
  let app: any
  let prisma: any
  
  beforeAll(async () => {
    const setup = await setupTestDatabase()
    prisma = setup.prisma
    app = createApp()
  })
  
  afterAll(async () => {
    await teardownTestDatabase()
  })
  
  describe('GET /api/products', () => {
    it('returns products list', async () => {
      // Seed test data
      await prisma.product.create({
        data: {
          name: 'Test Product',
          price: 99.99,
          stock: 10,
          category: {
            create: { name: 'Test Category' }
          }
        }
      })
      
      const response = await request(app)
        .get('/api/products')
        .expect(200)
      
      expect(response.body).toHaveProperty('products')
      expect(response.body.products).toHaveLength(1)
      expect(response.body.products[0].name).toBe('Test Product')
    })
    
    it('filters products by category', async () => {
      const category = await prisma.category.create({
        data: { name: 'Electronics' }
      })
      
      await prisma.product.create({
        data: {
          name: 'Laptop',
          price: 1000,
          stock: 5,
          categoryId: category.id
        }
      })
      
      const response = await request(app)
        .get(`/api/products?category=${category.id}`)
        .expect(200)
      
      expect(response.body.products).toHaveLength(1)
      expect(response.body.products[0].category.name).toBe('Electronics')
    })
    
    it('handles pagination', async () => {
      // Create 15 products
      for (let i = 1; i <= 15; i++) {
        await prisma.product.create({
          data: {
            name: `Product ${i}`,
            price: i * 10,
            stock: 10,
            category: { create: { name: `Category ${i}` } }
          }
        })
      }
      
      const response = await request(app)
        .get('/api/products?page=2&limit=5')
        .expect(200)
      
      expect(response.body.products).toHaveLength(5)
      expect(response.body.pagination.page).toBe(2)
    })
  })
  
  describe('POST /api/products', () => {
    it('creates product with valid data', async () => {
      const category = await prisma.category.create({
        data: { name: 'Test Category' }
      })
      
      const productData = {
        name: 'New Product',
        price: 199.99,
        stock: 20,
        categoryId: category.id,
        description: 'Test description'
      }
      
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer admin-token')
        .send(productData)
        .expect(201)
      
      expect(response.body.name).toBe('New Product')
      expect(response.body.price).toBe(199.99)
    })
    
    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer admin-token')
        .send({})
        .expect(400)
      
      expect(response.body.errors).toContain('name is required')
      expect(response.body.errors).toContain('price is required')
    })
  })
})
```

### 3. Testes de Autenticação

#### Testes de Login e Registro
```typescript
// src/app/api/__tests__/auth.test.ts
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { setupTestDatabase, teardownTestDatabase } from '@/test/setup-integration'

describe('/api/auth', () => {
  let app: any
  let prisma: any
  
  beforeAll(async () => {
    const setup = await setupTestDatabase()
    prisma = setup.prisma
    app = createApp()
  })
  
  afterAll(async () => {
    await teardownTestDatabase()
  })
  
  describe('POST /api/auth/register', () => {
    it('registers new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      }
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)
      
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe('test@example.com')
      expect(response.body.user).not.toHaveProperty('password')
      
      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' }
      })
      expect(user).toBeTruthy()
      expect(bcrypt.compareSync('SecurePass123!', user.password)).toBe(true)
    })
    
    it('prevents duplicate email registration', async () => {
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          name: 'Existing User',
          password: await bcrypt.hash('password123', 10)
        }
      })
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          name: 'New User',
          password: 'password123'
        })
        .expect(409)
      
      expect(response.body.error).toBe('Email already exists')
    })
    
    it('validates password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'weak'
        })
        .expect(400)
      
      expect(response.body.errors).toContain('Password must be at least 8 characters')
    })
  })
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          email: 'user@example.com',
          name: 'Test User',
          password: await bcrypt.hash('ValidPass123!', 10)
        }
      })
    })
    
    it('logs in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'ValidPass123!'
        })
        .expect(200)
      
      expect(response.body).toHaveProperty('token')
      expect(response.body.user.email).toBe('user@example.com')
    })
    
    it('rejects invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
      
      expect(response.body.error).toBe('Invalid credentials')
    })
    
    it('implements rate limiting', async () => {
      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'user@example.com',
            password: 'wrongpassword'
          })
      }
      
      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrongpassword'
        })
        .expect(429)
      
      expect(response.body.error).toContain('Too many attempts')
    })
  })
})
```

## Testes End-to-End (E2E)

### 1. Configuração do Playwright

#### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

### 2. Testes de Fluxo de Compra

#### Teste Completo de Compra
```typescript
// e2e/purchase-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Purchase Flow', () => {
  test('complete purchase flow', async ({ page }) => {
    // 1. Navegar para a página inicial
    await page.goto('/')
    
    // 2. Buscar por um produto
    await page.fill('[data-testid="search-input"]', 'laptop')
    await page.click('[data-testid="search-button"]')
    
    // 3. Verificar resultados da busca
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible()
    
    // 4. Clicar no primeiro produto
    await page.click('[data-testid="product-card"]:first-child')
    
    // 5. Verificar página do produto
    await expect(page.locator('h1')).toContainText(/laptop/i)
    
    // 6. Adicionar ao carrinho
    await page.click('[data-testid="add-to-cart-button"]')
    
    // 7. Verificar carrinho
    await page.click('[data-testid="cart-icon"]')
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
    
    // 8. Ir para checkout
    await page.click('[data-testid="checkout-button"]')
    
    // 9. Preencher informações de checkout
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="name-input"]', 'Test User')
    await page.fill('[data-testid="address-input"]', '123 Test St')
    await page.fill('[data-testid="city-input"]', 'Test City')
    await page.fill('[data-testid="zip-input"]', '12345')
    
    // 10. Continuar para pagamento
    await page.click('[data-testid="continue-to-payment"]')
    
    // 11. Preencher informações de pagamento (Stripe test card)
    const stripeFrame = page.frameLocator('[data-testid="stripe-card-element"] iframe')
    await stripeFrame.locator('[name="cardnumber"]').fill('4242424242424242')
    await stripeFrame.locator('[name="exp-date"]').fill('12/25')
    await stripeFrame.locator('[name="cvc"]').fill('123')
    
    // 12. Finalizar compra
    await page.click('[data-testid="place-order-button"]')
    
    // 13. Verificar confirmação
    await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-number"]')).toContainText(/order #[0-9]+/i)
  })
  
  test('guest checkout flow', async ({ page }) => {
    // Similar ao teste acima, mas sem login
    await page.goto('/products')
    
    // Adicionar produtos ao carrinho como guest
    await page.click('[data-testid="add-to-cart-guest"]')
    
    // Verificar que pode prosseguir sem login
    await page.click('[data-testid="cart-icon"]')
    await page.click('[data-testid="checkout-as-guest"]')
    
    // Continuar com checkout...
  })
})
```

### 3. Testes de Autenticação

#### Testes de Login e Registro
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user registration and login', async ({ page }) => {
    // 1. Navegar para registro
    await page.goto('/register')
    
    // 2. Preencher formulário de registro
    await page.fill('[data-testid="email-input"]', 'newuser@example.com')
    await page.fill('[data-testid="name-input"]', 'New User')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!')
    
    // 3. Submeter formulário
    await page.click('[data-testid="register-button"]')
    
    // 4. Verificar redirecionamento
    await expect(page).toHaveURL('/login')
    
    // 5. Fazer login
    await page.fill('[data-testid="email-input"]', 'newuser@example.com')
    await page.fill('[data-testid="password-input"]', 'SecurePass123!')
    await page.click('[data-testid="login-button"]')
    
    // 6. Verificar login bem-sucedido
    await expect(page).toHaveURL('/')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })
  
  test('password reset flow', async ({ page }) => {
    await page.goto('/forgot-password')
    
    await page.fill('[data-testid="email-input"]', 'user@example.com')
    await page.click('[data-testid="send-reset-email"]')
    
    await expect(page.locator('[data-testid="reset-email-sent"]')).toBeVisible()
    
    // Verificar email (mock)
    // Clicar no link de reset
    // Preencher nova senha
    // Confirmar reset
  })
})
```

### 4. Testes de Admin

#### Testes do Painel Administrativo
```typescript
// e2e/admin.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Login como admin
    await page.goto('/admin/login')
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.click('[data-testid="admin-login-button"]')
  })
  
  test('admin can create new product', async ({ page }) => {
    await page.goto('/admin/products')
    
    await page.click('[data-testid="add-product-button"]')
    
    await page.fill('[data-testid="product-name"]', 'New Admin Product')
    await page.fill('[data-testid="product-price"]', '299.99')
    await page.fill('[data-testid="product-stock"]', '50')
    await page.selectOption('[data-testid="product-category"]', 'Electronics')
    await page.fill('[data-testid="product-description"]', 'Test description')
    
    // Upload de imagem (mock)
    await page.setInputFiles('[data-testid="product-images"]', [
      'test/fixtures/test-image.jpg'
    ])
    
    await page.click('[data-testid="save-product-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-list"]')).toContainText('New Admin Product')
  })
  
  test('admin can view and manage orders', async ({ page }) => {
    await page.goto('/admin/orders')
    
    // Verificar lista de pedidos
    await expect(page.locator('[data-testid="orders-table"]')).toBeVisible()
    
    // Verificar detalhes de um pedido
    await page.click('[data-testid="order-details-1"]')
    
    await expect(page.locator('[data-testid="order-details"]')).toBeVisible()
    
    // Atualizar status do pedido
    await page.selectOption('[data-testid="order-status"]', 'shipped')
    await page.click('[data-testid="update-status-button"]')
    
    await expect(page.locator('[data-testid="status-updated"]')).toBeVisible()
  })
})
```

## Testes de Performance

### 1. Testes de Carga com K6

#### Script de Teste de Carga
```javascript
// k6/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],   // Error rate under 10%
  },
}

const BASE_URL = 'http://localhost:3000'

export default function () {
  // Test home page
  const homeResponse = http.get(`${BASE_URL}/`)
  check(homeResponse, {
    'home page status is 200': (r) => r.status === 200,
    'home page load time < 500ms': (r) => r.timings.duration < 500,
  })
  
  // Test product listing
  const productsResponse = http.get(`${BASE_URL}/api/products`)
  check(productsResponse, {
    'products api status is 200': (r) => r.status === 200,
    'products api returns data': (r) => JSON.parse(r.body).products.length > 0,
  })
  
  // Test search functionality
  const searchResponse = http.get(`${BASE_URL}/api/products?search=laptop`)
  check(searchResponse, {
    'search api status is 200': (r) => r.status === 200,
  })
  
  sleep(1)
}
```

### 2. Testes de Performance Frontend

#### Testes Lighthouse
```typescript
// test/lighthouse.test.js
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] })
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  }
  
  const runnerResult = await lighthouse(url, options)
  const report = runnerResult.report
  
  const result = JSON.parse(report)
  
  console.log('Performance Score:', result.categories.performance.score * 100)
  console.log('Accessibility Score:', result.categories.accessibility.score * 100)
  console.log('Best Practices Score:', result.categories['best-practices'].score * 100)
  console.log('SEO Score:', result.categories.seo.score * 100)
  
  await chrome.kill()
  
  return result
}

// Testes para diferentes páginas
const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/products',
  'http://localhost:3000/product/1',
  'http://localhost:3000/cart',
  'http://localhost:3000/checkout'
]

urls.forEach(async (url) => {
  console.log(`Testing ${url}...`)
  await runLighthouse(url)
})
```

### 3. Testes de Database Performance

#### Testes de Queries
```typescript
// test/performance/database.test.ts
import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'

const prisma = new PrismaClient()

describe('Database Performance', () => {
  beforeAll(async () => {
    // Seed large dataset
    await seedLargeDataset()
  })
  
  test('product search performance', async () => {
    const start = performance.now()
    
    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'laptop', mode: 'insensitive' } },
          { description: { contains: 'laptop', mode: 'insensitive' } }
        ]
      },
      include: { category: true },
      take: 20
    })
    
    const end = performance.now()
    const duration = end - start
    
    expect(duration).toBeLessThan(100) // Should complete in under 100ms
    expect(results.length).toBeGreaterThan(0)
  })
  
  test('order statistics performance', async () => {
    const start = performance.now()
    
    const stats = await prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })
    
    const end = performance.now()
    const duration = end - start
    
    expect(duration).toBeLessThan(50)
  })
  
  test('concurrent user operations', async () => {
    const operations = Array.from({ length: 100 }, () => 
      prisma.product.findMany({ take: 10 })
    )
    
    const start = performance.now()
    await Promise.all(operations)
    const end = performance.now()
    
    const duration = end - start
    expect(duration).toBeLessThan(1000) // 100 concurrent requests under 1s
  })
})
```

## Testes de Segurança

### 1. Testes de Vulnerabilidades

#### Testes de SQL Injection
```typescript
// test/security/sql-injection.test.ts
import request from 'supertest'
import { createApp } from '@/test/helpers'

describe('SQL Injection Prevention', () => {
  let app: any
  
  beforeAll(() => {
    app = createApp()
  })
  
  test('prevents SQL injection in search', async () => {
    const maliciousQueries = [
      "'; DROP TABLE products; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; UPDATE products SET price = 0; --"
    ]
    
    for (const query of maliciousQueries) {
      const response = await request(app)
        .get(`/api/products?search=${encodeURIComponent(query)}`)
        .expect(200)
      
      // Should return empty results, not crash
      expect(response.body.products).toEqual([])
    }
  })
  
  test('prevents SQL injection in product ID', async () => {
    const maliciousIds = [
      "1'; DROP TABLE products; --",
      "1 OR 1=1",
      "1 UNION SELECT * FROM users"
    ]
    
    for (const id of maliciousIds) {
      const response = await request(app)
        .get(`/api/products/${id}`)
        .expect(400)
      
      expect(response.body.error).toContain('Invalid ID')
    }
  })
})
```

#### Testes de XSS
```typescript
// test/security/xss.test.ts
import { render, screen } from '@testing-library/react'
import { ProductCard } from '@/components/ProductCard'

describe('XSS Prevention', () => {
  test('sanitizes product names', () => {
    const maliciousProduct = {
      id: '1',
      name: '<script>alert("XSS")</script>',
      price: 99.99,
      stock: 10
    }
    
    render(
      <CartProvider>
        <ProductCard product={maliciousProduct} />
      </CartProvider>
    )
    
    const productName = screen.getByText('<script>alert("XSS")</script>')
    expect(productName).toBeInTheDocument()
    expect(productName.tagName).toBe('H3') // Not a script tag
  })
  
  test('sanitizes user input in forms', async () => {
    const { user } = renderWithProviders(<ReviewForm />)
    
    const maliciousInput = '<img src=x onerror=alert(1)>'
    
    const reviewTextarea = screen.getByLabelText('Review')
    await user.type(reviewTextarea, maliciousInput)
    
    await user.click(screen.getByText('Submit Review'))
    
    // Should not execute script
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})
```

### 2. Testes de Autenticação e Autorização

#### Testes de Permissões
```typescript
// test/security/auth.test.ts
import request from 'supertest'
import { createApp } from '@/test/helpers'

describe('Authorization Tests', () => {
  let app: any
  let userToken: string
  let adminToken: string
  
  beforeAll(async () => {
    app = createApp()
    
    // Create test users
    userToken = await createUserToken()
    adminToken = await createAdminToken()
  })
  
  describe('Admin endpoints', () => {
    test('allows admin to access admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('products')
    })
    
    test('prevents regular users from accessing admin endpoints', async () => {
      await request(app)
        .get('/api/admin/products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)
    })
    
    test('prevents unauthenticated access', async () => {
      await request(app)
        .get('/api/admin/products')
        .expect(401)
    })
  })
  
  describe('User data access', () => {
    test('users can only access their own orders', async () => {
      const user1Token = await createUserToken('user1@example.com')
      const user2Token = await createUserToken('user2@example.com')
      
      // Create order for user1
      const order = await createOrderForUser('user1@example.com')
      
      // User1 can access their order
      await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200)
      
      // User2 cannot access user1's order
      await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403)
    })
  })
})
```

## Testes de Acessibilidade

### 1. Testes WCAG

#### Testes de Acessibilidade
```typescript
// test/accessibility/homepage.test.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Homepage Accessibility', () => {
  test('homepage meets WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/')
    
    // Inject axe-core
    await injectAxe(page)
    
    // Check for accessibility violations
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true
      }
    })
  })
  
  test('product cards are keyboard navigable', async ({ page }) => {
    await page.goto('/products')
    
    // Tab through product cards
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid="product-card"]:first-child')).toBeFocused()
    
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/product\/[0-9]+/)
  })
  
  test('screen reader announcements work correctly', async ({ page }) => {
    await page.goto('/')
    
    // Add product to cart
    await page.click('[data-testid="add-to-cart-button"]:first-child')
    
    // Check if screen reader announces the addition
    const announcement = page.locator('[aria-live="polite"]')
    await expect(announcement).toContainText('Product added to cart')
  })
})
```

### 2. Testes de Contraste e Navegação

```typescript
// test/accessibility/contrast.test.ts
import { test, expect } from '@playwright/test'

test.describe('Color Contrast Tests', () => {
  test('text has sufficient contrast', async ({ page }) => {
    await page.goto('/')
    
    // Check contrast ratios
    const results = await page.evaluate(() => {
      const elements = document.querySelectorAll('body *')
      const violations = []
      
      elements.forEach(element => {
        const style = window.getComputedStyle(element)
        const color = style.color
        const background = style.backgroundColor
        
        // Simple contrast check (would use proper library in real tests)
        if (color === background) {
          violations.push({
            element: element.tagName,
            color,
            background
          })
        }
      })
      
      return violations
    })
    
    expect(results).toHaveLength(0)
  })
  
  test.skip('skip links are present', async ({ page }) => {
    await page.goto('/')
    
    // Check for skip to content link
    await page.keyboard.press('Tab')
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeVisible()
    
    await skipLink.click()
    await expect(page.locator('#main-content')).toBeFocused()
  })
})
```

## Testes de Regressão Visual

### 1. Configuração do Storybook

#### Storybook Configuration
```typescript
// .storybook/main.ts
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    'storybook-addon-designs'
  ],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5'
  },
  features: {
    interactionsDebugger: true
  }
}
```

### 2. Testes Visuais com Chromatic

#### Visual Regression Tests
```typescript
// src/components/ProductCard.stories.tsx
import { ProductCard } from './ProductCard'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof ProductCard> = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    chromatic: { disableSnapshot: false }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    product: {
      id: '1',
      name: 'Premium Laptop',
      price: 1299.99,
      images: ['laptop.jpg'],
      stock: 10
    }
  }
}

export const OutOfStock: Story = {
  args: {
    product: {
      id: '2',
      name: 'Sold Out Product',
      price: 99.99,
      images: ['sold-out.jpg'],
      stock: 0
    }
  }
}

export const LongName: Story = {
  args: {
    product: {
      id: '3',
      name: 'This is a very long product name that might wrap to multiple lines',
      price: 49.99,
      images: ['long-name.jpg'],
      stock: 5
    }
  }
}
```

## Relatórios de Teste

### 1. Geração de Relatórios

#### Configuração de Coverage
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:performance": "k6 run k6/load-test.js",
    "test:security": "npm run test:security:sql && npm run test:security:xss",
    "test:accessibility": "axe-core",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```

#### Exemplo de Relatório de Coverage
```
-----------------------------------|---------|----------|---------|---------|-------------------
File                               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------------------------|---------|----------|---------|---------|-------------------
All files                          |   85.67 |    82.34 |   87.12 |   85.67 |
 src/components                    |   92.45 |    89.67 |   94.23 |   92.45 |
  ProductCard.tsx                  |   95.12 |    91.67 |   96.00 |   95.12 | 45-47,89
  CartItem.tsx                     |   90.00 |    87.50 |   92.31 |   90.00 | 23,67-69
  CheckoutForm.tsx                 |   91.89 |    89.19 |   93.33 |   91.89 | 78,112-114
 src/lib                           |   88.34 |    85.12 |   89.45 |   88.34 |
  cart.ts                          |   95.65 |    92.31 |   96.00 |   95.65 | 45,67
  stripe.ts                        |   82.35 |    78.95 |   85.71 |   82.35 | 23-25,67-69
 src/app/api                       |   78.90 |    74.56 |   82.34 |   78.90 |
  products/route.ts                |   85.00 |    81.25 |   87.50 |   85.00 | 45-47,89-91
  orders/route.ts                  |   72.73 |    67.86 |   77.27 |   72.73 | 34-39,56-61
-----------------------------------|---------|----------|---------|---------|-------------------
```

### 2. Dashboard de Testes

#### Monitoramento de Qualidade
```typescript
// test/dashboard/quality-dashboard.ts
export class QualityDashboard {
  async generateReport() {
    const metrics = await this.collectMetrics()
    
    return {
      summary: {
        totalTests: metrics.totalTests,
        passed: metrics.passed,
        failed: metrics.failed,
        skipped: metrics.skipped,
        coverage: metrics.coverage,
        performance: metrics.performance
      },
      trends: {
        testCount: this.calculateTrend(metrics.testHistory, 'count'),
        coverage: this.calculateTrend(metrics.coverageHistory, 'percentage'),
        buildTime: this.calculateTrend(metrics.buildHistory, 'duration')
      },
      recommendations: this.generateRecommendations(metrics)
    }
  }
  
  private async collectMetrics() {
    return {
      unit: await this.getUnitTestMetrics(),
      integration: await this.getIntegrationTestMetrics(),
      e2e: await this.getE2ETestMetrics(),
      performance: await this.getPerformanceMetrics(),
      security: await this.getSecurityMetrics()
    }
  }
}
```

## CI/CD e Automação

### 1. GitHub Actions Workflow

#### Pipeline de Testes
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/

  performance:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run performance tests
        run: |
          npm install -g k6
          k6 run k6/load-test.js
      
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

### 2. Pre-commit Hooks

#### Husky Configuration
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

## Troubleshooting de Testes

### 1. Problemas Comuns

#### Testes Falhando Aleatoriamente
```typescript
// Solução para testes flaky
// test/helpers/wait-for.ts
export async function waitFor(fn: () => Promise<any>, options = {}) {
  const { timeout = 5000, interval = 50 } = options
  
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const result = await fn()
      if (result) return result
    } catch (error) {
      // Continue waiting
    }
    
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Timeout after ${timeout}ms`)
}

// Uso nos testes
await waitFor(() => screen.getByText('Loading...'))
```

#### Testes de Tempo Dependentes
```typescript
// test/helpers/time-travel.ts
import { advanceTo, clear } from 'jest-date-mock'

beforeEach(() => {
  advanceTo(new Date('2024-01-01'))
})

afterEach(() => {
  clear()
})
```

### 2. Debug de Testes

#### Ferramentas de Debug
```typescript
// test/debug/setup.ts
import { configure } from '@testing-library/react'

// Enable debug mode
configure({
  asyncUtilTimeout: 10000,
  showOriginalStackTrace: true
})

// Enhanced logging
process.env.DEBUG = 'test:*'

// Debug utilities
export const debugTest = {
  log: (message: string, data?: any) => {
    if (process.env.DEBUG?.includes('test')) {
      console.log(`[TEST] ${message}`, data)
    }
  },
  
  dumpDOM: () => {
    console.log(document.body.innerHTML)
  }
}
```

## Checklist de Qualidade

### Pre-Release Checklist
- [ ] Todos os testes unitários passando (coverage > 80%)
- [ ] Todos os testes de integração passando
- [ ] Todos os testes E2E passando
- [ ] Testes de performance aprovados
- [ ] Testes de segurança aprovados
- [ ] Testes de acessibilidade aprovados
- [ ] Testes de regressão visual aprovados
- [ ] Documentação de testes atualizada
- [ ] CI/CD pipeline verde
- [ ] Testes de stress aprovados
- [ ] Testes de compatibilidade de navegadores aprovados

### Post-Deployment Monitoring
- [ ] Monitoramento de erros em produção
- [ ] Performance monitoring ativo
- [ ] Alertas de testes falhando configurados
- [ ] Rollback automático em caso de falhas
- [ ] Métricas de usuário sendo coletadas
- [ ] A/B tests configurados para novas features

## Recursos e Referências

### Documentação de Referência
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [K6 Documentation](https://k6.io/docs/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Ferramentas Adicionais
- [Cypress](https://www.cypress.io/) - Alternativa ao Playwright
- [WebdriverIO](https://webdriver.io/) - Automação de navegador
- [Percy](https://percy.io/) - Testes visuais
- [Applitools](https://applitools.com/) - Testes visuais AI
- [BrowserStack](https://www.browserstack.com/) - Testes cross-browser
- [Sauce Labs](https://saucelabs.com/) - Testes em dispositivos reais