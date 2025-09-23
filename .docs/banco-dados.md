# Banco de Dados

## Visão Geral

O EcomercePro utiliza **PostgreSQL 16** como banco de dados principal, gerenciado através do **Prisma ORM**. O schema foi projetado para suportar um sistema de e-commerce completo com gestão de produtos, usuários, pedidos e carrinhos de compras.

## Schema do Banco de Dados

### Diagrama de Entidades

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │   Order     │    │  Product    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │────┤ id (PK)     │────┤ id (PK)    │
│ email       │    │ userId (FK) │    │ name       │
│ password    │    │ totalCents  │    │ priceCents │
│ role        │    │ status      │    │ stock      │
│ createdAt   │    │ createdAt   │    │ categoryId │
│ updatedAt   │    │ updatedAt   │    │ createdAt  │
└─────────────┘    └─────────────┘    └─────────────┘
                            │                    │
                            │                    │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ OrderItem   │    │   Cart      │    │ Category    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)    │
│ orderId (FK)│    │ sessionId   │    │ name       │
│ productId   │    │ userId (FK) │    │ slug       │
│ quantity    │    │ createdAt   │    │ createdAt  │
│ unitPrice   │    │ updatedAt   │    │ updatedAt  │
└─────────────┘    └─────────────┘    └─────────────┘
                            │
                            │
                    ┌─────────────┐
                    │ CartItem   │
                    ├─────────────┤
                    │ id (PK)     │
                    │ cartId (FK)│
                    │ productId   │
                    │ quantity    │
                    └─────────────┘
```

## Modelos Detalhados

### User (Usuário)

**Descrição**: Armazena informações dos usuários da plataforma.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `email` | String (Unique) | Email do usuário |
| `password` | String | Hash da senha (bcrypt) |
| `role` | Enum | Role do usuário (USER/ADMIN) |
| `name` | String? | Nome opcional do usuário |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relações**:
- Um usuário pode ter múltiplos `Order` (pedidos)
- Um usuário pode ter múltiplos `Cart` (carrinhos)

### Product (Produto)

**Descrição**: Informações dos produtos disponíveis na loja.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `name` | String | Nome do produto |
| `slug` | String (Unique) | URL slug único |
| `description` | String | Descrição do produto |
| `priceCents` | Int | Preço em centavos |
| `currency` | String | Moeda (padrão: BRL) |
| `stock` | Int | Quantidade em estoque |
| `images` | String[] | Array de URLs de imagens |
| `stripePriceId` | String? | ID do preço no Stripe |
| `active` | Boolean | Se o produto está ativo |
| `categoryId` | String? | ID da categoria |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relações**:\- Pertence a uma `Category`
- Pode estar em múltiplos `OrderItem` e `CartItem`

### Category (Categoria)

**Descrição**: Organização dos produtos por categorias.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `name` | String | Nome da categoria |
| `slug` | String (Unique) | URL slug único |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relações**:
- Tem múltiplos `Product`

### Order (Pedido)

**Descrição**: Pedidos realizados pelos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `userId` | String? | ID do usuário (opcional) |
| `totalCents` | Int | Valor total em centavos |
| `currency` | String | Moeda (padrão: BRL) |
| `status` | Enum | Status do pedido |
| `stripeSessionId` | String? | ID da sessão Stripe |
| `stripePaymentIntentId` | String? | ID do pagamento Stripe |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Enums**:
- `OrderStatus`: PENDING, PAID, CANCELED

**Relações**:
- Pertence a um `User` (opcional)
- Tem múltiplos `OrderItem`

### OrderItem (Item do Pedido)

**Descrição**: Itens individuais dentro de um pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `orderId` | String | ID do pedido |
| `productId` | String | ID do produto |
| `quantity` | Int | Quantidade comprada |
| `unitPriceCents` | Int | Preço unitário no momento da compra |

**Relações**:
- Pertence a um `Order`
- Referencia um `Product`

### Cart (Carrinho)

**Descrição**: Carrinhos de compras por sessão ou usuário.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `sessionId` | String (Unique) | ID da sessão |
| `userId` | String? | ID do usuário (opcional) |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relações**:
- Pertence a um `User` (opcional)
- Tem múltiplos `CartItem`

### CartItem (Item do Carrinho)

**Descrição**: Itens dentro de um carrinho de compras.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | String (CUID) | Identificador único |
| `cartId` | String | ID do carrinho |
| `productId` | String | ID do produto |
| `quantity` | Int | Quantidade no carrinho |

**Restrições**:
- Índice único: `[cartId, productId]`

**Relações**:
- Pertence a um `Cart`
- Referencia um `Product`

## Índices e Performance

### Índices Primários
- Todas as tabelas têm índice primário em `id`

### Índices Únicos
- `User.email`
- `Product.slug`
- `Category.slug`
- `Cart.sessionId`
- `CartItem.[cartId, productId]`

### Índices para Performance
- `Order.userId` (para queries de pedidos por usuário)
- `Order.status` (para filtro de pedidos)
- `Product.categoryId` (para produtos por categoria)
- `Product.active` (para produtos ativos)

## Relacionamentos

### User → Order
- **Tipo**: Um-para-Muitos
- **Descrição**: Um usuário pode ter múltiplos pedidos
- **Campo**: `Order.userId`

### User → Cart
- **Tipo**: Um-para-Muitos
- **Descrição**: Um usuário pode ter múltiplos carrinhos
- **Campo**: `Cart.userId`

### Category → Product
- **Tipo**: Um-para-Muitos
- **Descrição**: Uma categoria pode ter múltiplos produtos
- **Campo**: `Product.categoryId`

### Product → OrderItem
- **Tipo**: Um-para-Muitos
- **Descrição**: Um produto pode estar em múltiplos itens de pedido
- **Campo**: `OrderItem.productId`

### Order → OrderItem
- **Tipo**: Um-para-Muitos
- **Descrição**: Um pedido pode ter múltiplos itens
- **Campo**: `OrderItem.orderId`

### Cart → CartItem
- **Tipo**: Um-para-Muitos
- **Descrição**: Um carrinho pode ter múltiplos itens
- **Campo**: `CartItem.cartId`

### Product → CartItem
- **Tipo**: Um-para-Muitos
- **Descrição**: Um produto pode estar em múltiplos carrinhos
- **Campo**: `CartItem.productId`

## Migrations

### Como executar migrações

```bash
# Desenvolvimento
npx prisma migrate dev

# Produção
npx prisma migrate deploy

# Reset do banco (desenvolvimento)
npx prisma migrate reset
```

### Seed do Banco

O arquivo `prisma/seed.ts` contém dados iniciais:
- Usuário admin padrão
- Categorias de exemplo
- Produtos de exemplo

```bash
# Executar seed
npm run db:seed
```

## Queries Comuns

### Buscar produtos com categorias
```typescript
const products = await prisma.product.findMany({
  include: {
    category: true
  },
  where: {
    active: true
  }
});
```

### Buscar pedidos do usuário com itens
```typescript
const orders = await prisma.order.findMany({
  where: { userId },
  include: {
    items: {
      include: {
        product: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

### Buscar carrinho com itens
```typescript
const cart = await prisma.cart.findUnique({
  where: { sessionId },
  include: {
    items: {
      include: {
        product: true
      }
    }
  }
});
```

## Backup e Restore

### Backup do PostgreSQL
```bash
# Backup completo
pg_dump -h localhost -U postgres -d ecomercepro > backup.sql

# Restore
psql -h localhost -U postgres -d ecomercepro < backup.sql
```

### Backup com Docker
```bash
# Backup
docker exec ecomercepro-db pg_dump -U postgres ecomercepro > backup.sql

# Restore
docker exec -i ecomercepro-db psql -U postgres -d ecomercepro < backup.sql
```

## Monitoramento e Manutenção

### Queries de Monitoramento
```sql
-- Contar usuários
SELECT COUNT(*) FROM "User";

-- Contar produtos ativos
SELECT COUNT(*) FROM "Product" WHERE active = true;

-- Contar pedidos por status
SELECT status, COUNT(*) FROM "Order" GROUP BY status;

-- Produtos com baixo estoque
SELECT name, stock FROM "Product" WHERE stock < 10;
```

### Manutenção Regular
- **Atualização de estatísticas**: `ANALYZE`
- **Vacuum**: `VACUUM ANALYZE`
- **Reindexação**: `REINDEX`
- **Verificação de integridade**: `CHECK`

## Próximos Passos

### Melhorias de Schema
- Adicionar tabela de endereços
- Sistema de avaliações de produtos
- Tabela de histórico de preços
- Sistema de cupons de desconto
- Tabela de envios e rastreamento

### Otimizações
- Particionamento de tabelas grandes
- Índices compostos para queries complexas
- Materialized views para relatórios
- Full-text search com PostgreSQL