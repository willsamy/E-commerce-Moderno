# APIs e Endpoints

## Visão Geral

O EcomercePro fornece uma API RESTful completa organizada em rotas públicas e administrativas. Todas as APIs são construídas usando **Next.js API Routes** e seguem as melhores práticas de design RESTful.

## Estrutura de URLs

### Base URL
- **Desenvolvimento**: `http://localhost:8180`
- **Produção**: Configurado via variável de ambiente `APP_BASE_URL`

### Versionamento
- Todas as APIs são versionadas por namespace
- Prefixo `/api/v1/` não é utilizado, mas pode ser implementado futuramente

## APIs Públicas

### Produtos

#### Listar Produtos
```http
GET /api/products
```

**Parâmetros de Query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 12)
- `category` (opcional): Slug da categoria
- `search` (opcional): Termo de busca
- `sort` (opcional): Ordenação (price_asc, price_desc, name_asc, name_desc)

**Exemplo de Resposta:**
```json
{
  "products": [
    {
      "id": "clt123...",
      "name": "Produto Exemplo",
      "slug": "produto-exemplo",
      "description": "Descrição do produto...",
      "priceCents": 2999,
      "currency": "BRL",
      "stock": 15,
      "images": ["https://exemplo.com/image1.jpg"],
      "category": {
        "id": "clt456...",
        "name": "Categoria Exemplo",
        "slug": "categoria-exemplo"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 12,
  "totalPages": 3
}
```

#### Buscar Produto por Slug
```http
GET /api/products/[slug]
```

**Exemplo de Resposta:**
```json
{
  "id": "clt123...",
  "name": "Produto Exemplo",
  "slug": "produto-exemplo",
  "description": "Descrição completa...",
  "priceCents": 2999,
  "currency": "BRL",
  "stock": 15,
  "images": ["https://exemplo.com/image1.jpg"],
  "category": {
    "id": "clt456...",
    "name": "Categoria Exemplo",
    "slug": "categoria-exemplo"
  }
}
```

### Categorias

#### Listar Todas as Categorias
```http
GET /api/categories
```

**Exemplo de Resposta:**
```json
{
  "categories": [
    {
      "id": "clt456...",
      "name": "Eletrônicos",
      "slug": "eletronicos"
    },
    {
      "id": "clt789...",
      "name": "Vestuário",
      "slug": "vestuario"
    }
  ]
}
```

### Carrinho

#### Buscar Carrinho
```http
GET /api/cart
```

**Headers:**
- `X-Session-ID`: ID da sessão (obrigatório)

**Exemplo de Resposta:**
```json
{
  "cart": {
    "id": "cltabc...",
    "sessionId": "sess123...",
    "items": [
      {
        "id": "cltdef...",
        "quantity": 2,
        "product": {
          "id": "clt123...",
          "name": "Produto Exemplo",
          "priceCents": 2999,
          "images": ["https://exemplo.com/image1.jpg"]
        }
      }
    ],
    "total": 5998
  }
}
```

#### Adicionar Item ao Carrinho
```http
POST /api/cart
```

**Headers:**
- `X-Session-ID`: ID da sessão (obrigatório)

**Body:**
```json
{
  "productId": "clt123...",
  "quantity": 2
}
```

**Exemplo de Resposta:**
```json
{
  "cart": { ... }
}
```

#### Atualizar Quantidade
```http
PUT /api/cart/[itemId]
```

**Headers:**
- `X-Session-ID`: ID da sessão (obrigatório)

**Body:**
```json
{
  "quantity": 3
}
```

#### Remover Item do Carrinho
```http
DELETE /api/cart/[itemId]
```

**Headers:**
- `X-Session-ID`: ID da sessão (obrigatório)

### Autenticação

#### Registro de Usuário
```http
POST /api/register
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

**Exemplo de Resposta:**
```json
{
  "user": {
    "id": "cltuser...",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "role": "USER"
  }
}
```

### Checkout

#### Criar Sessão de Checkout
```http
POST /api/checkout
```

**Headers:**
- `X-Session-ID`: ID da sessão (obrigatório)

**Body:**
```json
{
  "items": [
    {
      "productId": "clt123...",
      "quantity": 2
    }
  ]
}
```

**Exemplo de Resposta:**
```json
{
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

## APIs Administrativas

Todas as APIs administrativas requerem autenticação com role `ADMIN`.

### Produtos

#### Criar Produto
```http
POST /api/admin/products
```

**Body:**
```json
{
  "name": "Novo Produto",
  "description": "Descrição do produto",
  "priceCents": 2999,
  "stock": 10,
  "categoryId": "clt456...",
  "images": ["https://exemplo.com/image.jpg"]
}
```

#### Atualizar Produto
```http
PUT /api/admin/products/[id]
```

**Body:** Mesmo que criar, mas campos opcionais

#### Excluir Produto
```http
DELETE /api/admin/products/[id]
```

#### Listar Produtos (Admin)
```http
GET /api/admin/products
```

**Parâmetros de Query:**
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página
- `search` (opcional): Busca por nome
- `category` (opcional): Filtrar por categoria

### Categorias

#### Criar Categoria
```http
POST /api/admin/categories
```

**Body:**
```json
{
  "name": "Nova Categoria",
  "slug": "nova-categoria"
}
```

#### Atualizar Categoria
```http
PUT /api/admin/categories/[id]
```

#### Excluir Categoria
```http
DELETE /api/admin/categories/[id]
```

#### Listar Categorias (Admin)
```http
GET /api/admin/categories
```

### Pedidos

#### Listar Pedidos
```http
GET /api/admin/orders
```

**Parâmetros de Query:**
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página
- `status` (opcional): Filtrar por status
- `userId` (opcional): Filtrar por usuário

**Exemplo de Resposta:**
```json
{
  "orders": [
    {
      "id": "cltorder...",
      "totalCents": 5998,
      "status": "PAID",
      "user": {
        "id": "cltuser...",
        "email": "usuario@exemplo.com"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

#### Buscar Pedido por ID
```http
GET /api/admin/orders/[id]
```

**Exemplo de Resposta:**
```json
{
  "order": {
    "id": "cltorder...",
    "totalCents": 5998,
    "status": "PAID",
    "items": [
      {
        "id": "cltitem...",
        "quantity": 2,
        "unitPriceCents": 2999,
        "product": {
          "id": "clt123...",
          "name": "Produto Exemplo"
        }
      }
    ],
    "user": {
      "id": "cltuser...",
      "email": "usuario@exemplo.com"
    }
  }
}
```

#### Atualizar Status do Pedido
```http
PUT /api/admin/orders/[id]
```

**Body:**
```json
{
  "status": "PAID"
}
```

### Usuários

#### Listar Usuários
```http
GET /api/admin/users
```

**Parâmetros de Query:**
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página
- `search` (opcional): Busca por email ou nome
- `role` (opcional): Filtrar por role

**Exemplo de Resposta:**
```json
{
  "users": [
    {
      "id": "cltuser...",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "role": "USER",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

#### Buscar Usuário por ID
```http
GET /api/admin/users/[id]
```

#### Atualizar Role do Usuário
```http
PUT /api/admin/users/[id]
```

**Body:**
```json
{
  "role": "ADMIN"
}
```

## Webhooks

### Stripe Webhook
```http
POST /api/stripe/webhook
```

**Headers:**
- `stripe-signature`: Assinatura do webhook (verificação automática)

**Eventos Processados:**
- `checkout.session.completed`: Pedido pago com sucesso

**Exemplo de Payload:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_...",
      "payment_intent": "pi_test_...",
      "metadata": {
        "orderId": "cltorder..."
      }
    }
  }
}
```

## Códigos de Status HTTP

### Códigos de Sucesso
- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida sem conteúdo

### Códigos de Erro
- `400 Bad Request`: Requisição inválida
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Sem permissão
- `404 Not Found`: Recurso não encontrado
- `422 Unprocessable Entity`: Validação falhou
- `500 Internal Server Error`: Erro no servidor

## Formato de Erros

### Erro Padrão
```json
{
  "error": {
    "message": "Mensagem de erro",
    "code": "ERROR_CODE",
    "details": {
      "field": "Descrição do erro no campo"
    }
  }
}
```

### Erro de Validação
```json
{
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["Email inválido"],
      "password": ["Senha deve ter pelo menos 6 caracteres"]
    }
  }
}
```

## Rate Limiting

### Limites Atuais
- **APIs Públicas**: 100 requisições por minuto por IP
- **APIs Administrativas**: 60 requisições por minuto por usuário
- **Checkout**: 10 requisições por minuto por sessão

### Headers de Rate Limit
- `X-RateLimit-Limit`: Limite total
- `X-RateLimit-Remaining`: Requisições restantes
- `X-RateLimit-Reset`: Tempo até resetar (timestamp)

## Autenticação e Autorização

### NextAuth.js
- **Provider**: Credentials Provider
- **Session**: JWT com armazenamento em cookie
- **Roles**: USER, ADMIN

### Headers de Autenticação
- **Session Token**: Armazenado em cookie `next-auth.session-token`
- **CSRF Token**: Cookie `next-auth.csrf-token`

### Middleware de Proteção
- **Admin Routes**: `/admin/*` requer role ADMIN
- **API Admin**: `/api/admin/*` requer role ADMIN

## Testes de API

### Ferramentas Recomendadas
- **Postman**: Interface gráfica completa
- **curl**: Linha de comando
- **HTTPie**: Alternativa moderna ao curl
- **Insomnia**: Interface similar ao Postman

### Exemplos de Teste com curl

#### Listar Produtos
```bash
curl -X GET http://localhost:8180/api/products
```

#### Adicionar ao Carrinho
```bash
curl -X POST http://localhost:8180/api/cart \
  -H "X-Session-ID: sess123..." \
  -H "Content-Type: application/json" \
  -d '{"productId":"clt123...","quantity":2}'
```

#### Criar Produto (Admin)
```bash
curl -X POST http://localhost:8180/api/admin/products \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json" \
  -d '{"name":"Novo Produto","priceCents":2999,"stock":10}'
```

## Documentação OpenAPI

### Status
- **Swagger/OpenAPI**: Em desenvolvimento
- **Rota**: `/api/docs` (planejado)
- **Geração Automática**: Usando `next-swagger-doc`

## Próximas Melhorias

### Versionamento de API
- Implementar `/api/v1/` namespace
- Manter compatibilidade com versões anteriores

### GraphQL
- Adicionar endpoint GraphQL opcional
- Manter REST como principal

### Webhooks Adicionais
- Webhook para cancelamento de pedidos
- Webhook para atualização de estoque
- Webhook para novos usuários

### Real-time Updates
- WebSocket para atualizações em tempo real
- Server-Sent Events para notificações