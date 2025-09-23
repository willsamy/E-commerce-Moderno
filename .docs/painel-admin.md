# Painel Administrativo

## Visão Geral

O painel administrativo do EcomercePro é uma interface completa para gerenciar todos os aspectos da loja online. Desenvolvido com Next.js 14 e TypeScript, oferece uma experiência moderna e responsiva para administradores gerenciarem produtos, pedidos, usuários e relatórios de forma eficiente.

## Acesso e Autenticação

### Login Administrativo
- **URL**: `/admin/login`
- **Credenciais**: Apenas usuários com role `ADMIN` podem acessar
- **Redirecionamento**: Após login, redireciona para `/admin/dashboard`
- **Segurança**: Proteção por middleware que verifica role do usuário

### Middleware de Proteção
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('next-auth.session-token')
    // Verifica se usuário tem role ADMIN
  }
}
```

## Dashboard Principal

### URL: `/admin`

#### Visão Geral em Tempo Real
- **Total de Vendas**: Valor total de vendas do dia/mês/ano
- **Pedidos Pendentes**: Número de pedidos aguardando processamento
- **Produtos Ativos**: Contagem de produtos disponíveis
- **Usuários Registrados**: Total de usuários cadastrados

#### Gráficos e Analytics
- **Vendas por Dia**: Gráfico de linha mostrando vendas dos últimos 30 dias
- **Produtos Mais Vendidos**: Top 10 produtos por quantidade vendida
- **Categorias por Vendas**: Distribuição de vendas por categoria
- **Taxa de Conversão**: Visitantes vs compradores

#### Cards de Status
```typescript
interface DashboardCard {
  title: string
  value: string | number
  change: number // Porcentagem de mudança
  icon: string
  color: 'green' | 'red' | 'blue' | 'yellow'
}
```

## Gerenciamento de Produtos

### Lista de Produtos: `/admin/produtos`

#### Filtros e Busca
- **Busca por Nome**: Campo de busca textual
- **Filtro por Categoria**: Dropdown com todas as categorias
- **Filtro por Status**: Ativo/Inativo/Esgotado
- **Ordenação**: Por nome, preço, data de criação
- **Paginação**: 20 produtos por página

#### Tabela de Produtos
```typescript
interface ProductTable {
  columns: [
    'Imagem',
    'Nome',
    'Categoria',
    'Preço',
    'Estoque',
    'Status',
    'Ações'
  ]
}
```

#### Ações Rápidas
- **Editar**: Redireciona para página de edição
- **Desativar/Ativar**: Toggle de status
- **Duplicar**: Cria cópia do produto
- **Excluir**: Com confirmação de exclusão

### Criar Novo Produto: `/admin/produtos/novo`

#### Formulário de Produto
```typescript
interface ProductForm {
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: string[] // Array de URLs
  isActive: boolean
  slug: string // Gerado automaticamente
}
```

#### Upload de Imagens
- **Drag & Drop**: Interface moderna para upload
- **Pré-visualização**: Visualização das imagens antes de salvar
- **Otimização**: Imagens são otimizadas automaticamente
- **Multi-upload**: Até 5 imagens por produto

#### Validações
- **Nome**: Obrigatório, mínimo 3 caracteres
- **Preço**: Número positivo, máximo 2 casas decimais
- **Estoque**: Número inteiro positivo
- **Categoria**: Deve existir no sistema
- **Slug**: Único, gerado automaticamente do nome

### Editar Produto: `/admin/produtos/[id]/editar`

#### Campos Editáveis
- Todas as informações do produto são editáveis
- **Histórico de Mudanças**: Log de alterações (planejado)
- **Pré-visualização**: Visualização ao vivo das mudanças

#### Gerenciamento de Estoque
- **Ajuste Manual**: Adicionar/remover unidades
- **Histórico**: Visualizar movimentações de estoque
- **Alertas**: Notificação quando estoque baixo

## Gerenciamento de Categorias

### Lista de Categorias: `/admin/categorias`

#### Estrutura de Categorias
- **Categorias Pai**: Categorias principais
- **Subcategorias**: Hierarquia de até 2 níveis
- **Contagem de Produtos**: Número de produtos por categoria

#### Formulário de Categoria
```typescript
interface CategoryForm {
  name: string
  description?: string
  parentId?: string // Para subcategorias
  isActive: boolean
  slug: string
}
```

#### Ações de Categoria
- **Criar**: Nova categoria com validação de slug único
- **Editar**: Todas as informações editáveis
- **Reorganizar**: Drag & drop para reordenar
- **Excluir**: Com verificação de produtos vinculados

## Gerenciamento de Pedidos

### Lista de Pedidos: `/admin/pedidos`

#### Filtros Avançados
- **Por Status**: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- **Por Data**: Intervalo de datas
- **Por Cliente**: Busca por nome ou email
- **Por Valor**: Intervalo de valores
- **Por Produto**: Filtrar por produto específico

#### Visualização da Tabela
```typescript
interface OrderTable {
  columns: [
    'Número do Pedido',
    'Cliente',
    'Data',
    'Status',
    'Valor Total',
    'Ações'
  ]
}
```

#### Status do Pedido
- **PENDING**: Aguardando pagamento (amarelo)
- **PAID**: Pagamento confirmado (verde)
- **PROCESSING**: Em preparação (azul)
- **SHIPPED**: Enviado (azul claro)
- **DELIVERED**: Entregue (verde escuro)
- **CANCELLED**: Cancelado (vermelho)

### Detalhes do Pedido: `/admin/pedidos/[id]`

#### Informações do Pedido
- **Dados do Cliente**: Nome, email, endereço
- **Itens do Pedido**: Produtos, quantidades, preços
- **Histórico de Status**: Timeline de mudanças
- **Informações de Pagamento**: Método, status, ID do Stripe

#### Ações do Pedido
- **Atualizar Status**: Dropdown para mudar status
- **Adicionar Nota**: Notas internas sobre o pedido
- **Reembolsar**: Integração com Stripe para reembolsos
- **Imprimir**: Gerar PDF do pedido

#### Timeline de Status
```typescript
interface OrderTimeline {
  status: OrderStatus
  timestamp: Date
  notes?: string
  updatedBy: string // Admin que fez a mudança
}
```

## Gerenciamento de Usuários

### Lista de Usuários: `/admin/usuarios`

#### Informações Exibidas
- **Nome Completo**: Nome do usuário
- **Email**: Endereço de email
- **Role**: USER ou ADMIN
- **Data de Cadastro**: Quando se registrou
- **Total de Pedidos**: Número de pedidos realizados
- **Valor Total**: Total gasto pelo usuário

#### Filtros
- **Por Role**: USER ou ADMIN
- **Por Data de Cadastro**: Intervalo de datas
- **Por Atividade**: Ativo/Inativo
- **Por Busca**: Nome ou email

#### Ações de Usuário
- **Visualizar Perfil**: Ver informações completas
- **Tornar Admin**: Promover usuário para admin
- **Desativar**: Desativar conta do usuário
- **Ver Pedidos**: Ver todos os pedidos do usuário

### Detalhes do Usuário: `/admin/usuarios/[id]`

#### Informações do Perfil
- **Dados Pessoais**: Nome, email, telefone
- **Endereços**: Lista de endereços cadastrados
- **Histórico de Pedidos**: Todos os pedidos realizados
- **Preferências**: Newsletter, notificações

#### Gerenciamento de Admin
- **Promover/Demover**: Toggle de role ADMIN
- **Resetar Senha**: Enviar email de reset de senha
- **Bloquear/Desbloquear**: Controle de acesso

## Relatórios e Analytics

### Dashboard de Vendas: `/admin/relatorios`

#### Relatórios Disponíveis
- **Vendas por Período**: Diário, semanal, mensal, anual
- **Produtos Mais Vendidos**: Ranking de produtos
- **Categorias por Vendas**: Performance por categoria
- **Clientes Top**: Clientes que mais compram
- **Taxa de Conversão**: Visitantes vs compradores

#### Gráficos Interativos
- **Chart.js**: Gráficos responsivos e interativos
- **Exportar**: PDF, Excel, CSV
- **Filtros**: Por período, categoria, produto

#### Métricas de Performance
```typescript
interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  conversionRate: number
  newCustomers: number
  returningCustomers: number
}
```

### Relatório de Estoque: `/admin/relatorios/estoque`

#### Alertas de Estoque
- **Estoque Baixo**: Produtos com menos de X unidades
- **Esgotados**: Produtos sem estoque
- **Movimentação**: Entradas e saídas de estoque

#### Previsão de Demanda
- **Produtos Populares**: Baseado em tendências
- **Sazonalidade**: Previsão por período do ano
- **Recomendações**: Quando reabastecer

## Configurações do Sistema

### Configurações Gerais: `/admin/configuracoes`

#### Informações da Loja
- **Nome da Loja**: Nome exibido no site
- **Descrição**: Meta descrição do site
- **Logo**: Upload de logo da loja
- **Favicon**: Ícone do navegador
- **Cores Primárias**: Personalização de cores

#### Configurações de Email
- **Servidor SMTP**: Configurações de envio
- **Templates**: Personalização de emails
- **Remetente**: Email e nome do remetente

#### Integrações
- **Stripe**: Chaves de API (modo teste/produção)
- **Google Analytics**: ID de tracking
- **Facebook Pixel**: ID do pixel

### Configurações de Frete: `/admin/configuracoes/frete`

#### Métodos de Entrega
- **Correios**: Integração com API dos Correios
- **Transportadora**: Configuração personalizada
- **Retirada Local**: Opção de retirada na loja

#### Tabelas de Frete
- **Por Região**: Diferentes valores por estado
- **Por Peso**: Tabela progressiva por peso
- **Grátis**: Configuração de frete grátis

## Segurança do Painel Admin

### Autenticação de Dois Fatores (Planejado)
- **Google Authenticator**: Código TOTP
- **SMS**: Código por SMS
- **Email**: Código por email

### Logs de Auditoria
```typescript
interface AdminLog {
  action: string
  adminId: string
  timestamp: Date
  details: object
  ipAddress: string
  userAgent: string
}
```

### Permissões Granulares (Planejado)
- **Gerenciar Produtos**: Criar, editar, excluir
- **Gerenciar Pedidos**: Ver, atualizar status
- **Gerenciar Usuários**: Ver, promover, bloquear
- **Ver Relatórios**: Acesso a relatórios
- **Configurações**: Alterar configurações do sistema

## Interface e Experiência

### Design Responsivo
- **Desktop**: Layout completo com sidebar
- **Tablet**: Layout adaptativo
- **Mobile**: Menu hamburger e cards empilhados

### Componentes Reutilizáveis
- **DataTable**: Tabela com filtros e paginação
- **FormBuilder**: Formulários dinâmicos
- **Modal**: Modais para confirmações
- **Toast**: Notificações toast
- **Loading**: Skeletons e spinners

### Tema e Estilização
- **Tailwind CSS**: Classes utilitárias
- **Dark Mode**: Toggle de tema claro/escuro
- **Customização**: Cores da marca
- **Acessibilidade**: WCAG 2.1 compliance

## Performance e Otimização

### Lazy Loading
- **Rota**: Carregamento sob demanda por página
- **Imagens**: Lazy loading de thumbnails
- **Dados**: Paginação server-side

### Cache de Dados
- **React Query**: Cache de queries
- **SWR**: Revalidação inteligente
- **Local Storage**: Cache de filtros e preferências

### Otimizações
- **Debouncing**: Busca com debounce
- **Throttling**: Limitar requisições
- **Memoização**: Componentes otimizados

## Testes e Qualidade

### Testes Automatizados
```typescript
describe("Admin Panel", () => {
  it("should login as admin", async () => {
    // Teste de login com credenciais admin
  })

  it("should create new product", async () => {
    // Teste de criação de produto
  })

  it("should update order status", async () => {
    // Teste de atualização de pedido
  })
})
```

### Testes de Performance
- **Lighthouse**: Score de performance
- **Bundle Size**: Análise de tamanho do bundle
- **Core Web Vitals**: FCP, LCP, TTI

### Testes de Segurança
- **SQL Injection**: Testes de segurança
- **XSS**: Proteção contra XSS
- **CSRF**: Tokens de proteção

## Documentação para Equipe

### Guia de Onboarding
1. **Login**: Acessar `/admin/login`
2. **Dashboard**: Familiarizar-se com o dashboard
3. **Produtos**: Aprender a criar/editar produtos
4. **Pedidos**: Gerenciar status de pedidos
5. **Relatórios**: Entender os relatórios disponíveis

### Procedimentos Padrão
- **Criar Produto**: Passo a passo para criar novo produto
- **Processar Pedido**: Fluxo de processamento
- **Gerar Relatório**: Como gerar e exportar relatórios
- **Backup**: Procedimentos de backup

### Troubleshooting
- **Erro 403**: Verificar permissões de admin
- **Dados não carregam**: Verificar conexão com API
- **Imagens não aparecem**: Verificar upload e URLs
- **Pedidos não atualizam**: Verificar webhook do Stripe

## Integrações Futuras

### Sistema de Notificações
- **Email**: Notificações de novos pedidos
- **Slack**: Integração com canal do Slack
- **Push**: Notificações push para admin

### Ferramentas Avançadas
- **Zapier**: Integração com outras ferramentas
- **API**: Endpoints para integrações externas
- **Mobile App**: Aplicativo mobile para admin

### Analytics Avançado
- **Mixpanel**: Event tracking avançado
- **Hotjar**: Heatmaps e gravações
- **Google Data Studio**: Dashboards customizados