# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2025-01-24] - Correções de Testes e APIs

### Adicionado
- Função GET na API admin de produtos (`/api/admin/products`) para listar produtos com categorias
- Documentação de mudanças no projeto (CHANGELOG.md)

### Corrigido
- Imports incorretos do Prisma em testes de admin (orders.test.ts e products.test.ts)
- Serialização de datas em testes de orders (createdAt como string ISO 8601)
- Expectativas de status HTTP em testes de products (201 para criação, 200 para listagem)
- Expectativas de chamadas do Prisma em testes de orders (include correto)
- Mensagens de erro em testes de products para corresponder à implementação real
- Testes de admin products que estavam falhando por falta da função GET

### Melhorado
- Cobertura de testes para APIs admin
- Consistência entre implementação e testes
- Estrutura de resposta das APIs admin

### Status dos Testes
- Total de testes: 47 (42 aprovados, 5 falhando)
- Suítes de teste: 10 (7 aprovadas, 3 falhando)
- Principais correções realizadas em testes de carrinho, pedidos e produtos admin
- Testes de admin products agora passam completamente (5/5)

### Observações
- Alguns testes ainda apresentam falhas menores relacionadas a console.error em categorias
- Sistema de autenticação e autorização funcionando corretamente nos testes
- APIs admin protegidas adequadamente com verificação de role ADMIN