# Fluxo de Compra

## Visão Geral

O fluxo de compra no EcomercePro foi projetado para ser simples, seguro e intuitivo, guiando o usuário desde a descoberta do produto até a confirmação do pedido. O sistema utiliza **Stripe Checkout** para processamento de pagamentos, garantindo segurança e conformidade com PCI-DSS.

## Etapas do Fluxo de Compra

### 1. Descoberta do Produto

#### Catálogo de Produtos
- **Página Inicial**: `/` - Exibe produtos em grid com paginação
- **Filtros Disponíveis**:
  - Por categoria
  - Por preço (intervalo)
  - Por nome (busca textual)
  - Ordenação (preço, nome, data)

#### Página de Produto
- **URL**: `/produto/[slug]`
- **Informações Exibidas**:
  - Imagens do produto (galeria)
  - Nome, descrição e preço
  - Status de estoque
  - Categoria
  - Botão "Adicionar ao Carrinho"

### 2. Carrinho de Compras

#### Adicionar ao Carrinho
```typescript
// Fluxo de adição ao carrinho
1. Usuário clica em "Adicionar ao Carrinho"
2. Sistema verifica disponibilidade de estoque
3. Produto é adicionado ao carrinho (sessão ou usuário)
4. Atualização visual do contador do carrinho
5. Notificação de sucesso ao usuário
```

#### Gerenciamento do Carrinho
- **Visualização**: `/carrinho`
- **Ações Disponíveis**:
  - Ajustar quantidade de itens
  - Remover itens do carrinho
  - Verificar subtotal e total
  - Continuar comprando ou ir para checkout

#### Cálculo do Total
```typescript
interface CartTotal {
  itemsTotal: number        // Soma dos produtos
  shipping: number          // Frete (calculado no checkout)
  discount: number        // Descontos aplicados
  total: number           // Total final
}
```

### 3. Processo de Checkout

#### 3.1 Revisão do Pedido
- **Confirmação de Itens**: Lista final de produtos
- **Quantidades**: Última chance de ajustar
- **Preços**: Preços unitários e total
- **Disponibilidade**: Verificação final de estoque

#### 3.2 Checkout com Stripe

##### Criação da Sessão de Checkout
```http
POST /api/checkout
```

**Headers:**
- `X-Session-ID`: ID da sessão (se não autenticado)
- `Authorization`: Bearer token (se autenticado)

**Body:**
```json
{
  "items": [
    {
      "productId": "clt123...",
      "quantity": 2
    }
  ],
  "successUrl": "http://localhost:8180/checkout/sucesso",
  "cancelUrl": "http://localhost:8180/checkout/cancelado"
}
```

##### Fluxo do Checkout
```typescript
// Processo de checkout
1. Validação dos itens e estoque
2. Criação do pedido com status PENDING
3. Criação da sessão no Stripe
4. Redirecionamento para Stripe Checkout
5. Processamento do pagamento no Stripe
6. Retorno para URLs de sucesso/cancelamento
```

#### 3.3 Configuração do Stripe Checkout

##### Modo de Pagamento
- **Payment Mode**: Pagamento único
- **Currency**: BRL (Real Brasileiro)
- **Capture Method**: Automatic

##### Campos de Checkout
- **Email**: Obrigatório (pré-preenchido se autenticado)
- **Endereço**: Obrigatório para cálculo de frete
- **Telefone**: Opcional
- **Nome**: Obrigatório

##### Configuração de Shipping
```typescript
const shippingOptions = [
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 1500, currency: "brl" },
      display_name: "Entrega Padrão",
      delivery_estimate: {
        minimum: { unit: "business_day", value: 5 },
        maximum: { unit: "business_day", value: 10 }
      }
    }
  }
]
```

### 4. Confirmação do Pedido

#### Página de Sucesso
- **URL**: `/checkout/sucesso`
- **Informações Exibidas**:
  - Número do pedido
  - Resumo da compra
  - Preço total pago
  - Data estimada de entrega
  - Botão para imprimir recibo

#### Página de Cancelamento
- **URL**: `/checkout/cancelado`
- **Ações Disponíveis**:
  - Voltar ao carrinho
  - Modificar o pedido
  - Tentar novamente

### 5. Processamento Pós-Pagamento

#### Webhook do Stripe
- **Endpoint**: `/api/stripe/webhook`
- **Evento Principal**: `checkout.session.completed`

#### Fluxo do Webhook
```typescript
// Processamento do webhook
1. Recebe evento do Stripe
2. Verifica assinatura do webhook
3. Atualiza status do pedido para PAID
4. Baixa estoque dos produtos vendidos
5. Limpa carrinho do usuário
6. Envia email de confirmação (planejado)
```

#### Atualização de Estoque
```typescript
// Lógica de atualização de estoque
for (const item of order.items) {
  await prisma.product.update({
    where: { id: item.productId },
    data: {
      stock: {
        decrement: item.quantity
      }
    }
  })
}
```

### 6. Gerenciamento do Pedido

#### Status do Pedido
- **PENDING**: Aguardando pagamento
- **PAID**: Pagamento confirmado
- **PROCESSING**: Em processamento
- **SHIPPED**: Enviado
- **DELIVERED**: Entregue
- **CANCELLED**: Cancelado

#### Histórico do Pedido
- **Para Usuários**: `/minha-conta/pedidos/[id]`
- **Para Admin**: `/admin/pedidos/[id]`

## Integração com Sistema de Autenticação

### Compras Anônimas
- **Funcionamento**: Usuário pode comprar sem criar conta
- **Identificação**: Usado session ID para rastreamento
- **Limitações**: Não tem histórico de pedidos

### Compras com Conta
- **Benefícios**:
  - Histórico completo de pedidos
  - Endereços salvos
  - Informações de pagamento salvos (planejado)
  - Rastreamento de pedidos

### Migração de Carrinho
```typescript
// Quando usuário faz login
const migrateCart = async (sessionId: string, userId: string) => {
  // Transferir itens do carrinho anônimo para o usuário
  await prisma.cart.updateMany({
    where: { sessionId },
    data: { userId }
  })
}
```

## Tratamento de Erros

### Erros Comuns no Checkout

#### Estoque Insuficiente
```typescript
{
  "error": "INSUFFICIENT_STOCK",
  "message": "Produto X não tem estoque suficiente",
  "available": 5,
  "requested": 10
}
```

#### Produto Indisponível
```typescript
{
  "error": "PRODUCT_UNAVAILABLE",
  "message": "Produto X não está mais disponível"
}
```

#### Erro de Pagamento
```typescript
{
  "error": "PAYMENT_FAILED",
  "message": "Pagamento não foi aprovado",
  "stripeError": "card_declined"
}
```

### Fluxo de Recuperação
1. **Erro de Estoque**: Voltar ao carrinho e ajustar quantidades
2. **Erro de Pagamento**: Tentar método de pagamento diferente
3. **Erro de Sistema**: Contatar suporte

## Segurança no Fluxo de Compra

### Validações de Segurança
- **Verificação de Estoque**: Antes de cada etapa
- **Validação de Preços**: Preços congelados no momento da compra
- **Limite de Compra**: Prevenir compras fraudulentas
- **Rate Limiting**: Limitar tentativas de checkout

### Auditoria
```typescript
// Log de ações importantes
interface PurchaseLog {
  action: "CART_ADDED" | "CHECKOUT_STARTED" | "PAYMENT_COMPLETED" | "ORDER_CANCELLED"
  userId?: string
  sessionId: string
  productId?: string
  quantity?: number
  amount?: number
  timestamp: Date
}
```

## Experiência do Usuário

### Indicadores Visuais
- **Loading States**: Spinners durante processamento
- **Progress Bars**: Indicar etapas do checkout
- **Notificações**: Toast messages para feedback
- **Validação em Tempo Real**: Verificar estoque antes de adicionar

### Mobile Experience
- **Checkout Responsivo**: Adaptado para mobile
- **Apple Pay/Google Pay**: Integração planejada
- **One-Click Checkout**: Para usuários logados

## Análise e Métricas

### Métricas de Conversão
- **Taxa de Conversão**: Pedidos concluídos / Visitantes
- **Taxa de Abandono**: Carrinhos abandonados / Total
- **Tempo Médio de Checkout**: Tempo desde carrinho até pagamento
- **Valor Médio do Pedido**: Total / Número de pedidos

### Eventos de Tracking
```typescript
// Google Analytics events
gtag('event', 'add_to_cart', {
  currency: 'BRL',
  value: 29.99,
  items: [{
    item_id: 'prod-123',
    item_name: 'Produto Exemplo',
    price: 29.99,
    quantity: 1
  }]
})
```

## Otimizações de Performance

### Cache de Estoque
- **Redis**: Cache de disponibilidade de produtos
- **Invalidação**: Atualizar quando estoque mudar
- **TTL**: 5 minutos para dados de estoque

### Preços Dinâmicos
- **Preços em Cache**: Preços congelados no momento da adição
- **Atualização**: Notificar usuário se preço mudar

### Checkout otimizado
- **Lazy Loading**: Carregar componentes sob demanda
- **Code Splitting**: Dividir bundle por etapas
- **CDN**: Assets servidos globalmente

## Integrações Futuras

### Sistema de Frete
- **Correios**: Integração com API dos Correios
- **Transportadoras**: Diversas opções de entrega
- **Calculadora**: Frete automático por CEP

### Sistema de Pagamento
- **PIX**: Integração com sistema PIX
- **Boleto**: Pagamento via boleto bancário
- **Parcelamento**: Opções de parcelamento

### Programa de Fidelidade
- **Pontos**: Sistema de pontos por compra
- **Descontos**: Cupons automáticos
- **VIP**: Benefícios para clientes frequentes

## Testes do Fluxo de Compra

### Testes Automatizados
```typescript
describe("Purchase Flow", () => {
  it("should complete purchase successfully", async () => {
    // Adicionar produto ao carrinho
    // Iniciar checkout
    // Simular pagamento
    // Verificar pedido criado
  })

  it("should handle out of stock", async () => {
    // Tentar adicionar produto sem estoque
    // Verificar mensagem de erro
  })
})
```

### Testes Manuais
- **Cenários de Teste**:
  1. Compra anônima bem-sucedida
  2. Compra com conta de usuário
  3. Adicionar múltiplos produtos
  4. Ajustar quantidades no carrinho
  5. Cancelar durante checkout
  6. Falha de pagamento

## Documentação para Equipe de Suporte

### Problemas Comuns e Soluções

#### Pedido não aparece após pagamento
1. Verificar webhook do Stripe
2. Checar logs do servidor
3. Confirmar ID do pedido no Stripe
4. Verificar se webhook está configurado corretamente

#### Carrinho vazio após login
1. Verificar migração de carrinho
2. Checar session ID
3. Confirmar se usuário tem carrinho anterior

#### Erro "Produto indisponível"
1. Verificar estoque real
2. Checar se produto está ativo
3. Confirmar preço e disponibilidade

### Templates de Resposta
- **Confirmação de Pedido**: Email automático
- **Atualização de Status**: Notificação de mudança
- **Problema de Pagamento**: Instruções para retentativa