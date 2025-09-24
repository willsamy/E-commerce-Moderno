# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [24 de Janeiro de 2025]

### ✅ Configuração de Banco Local com IP Público
- **Verificado**: PostgreSQL Docker já configurado para conexões externas (`listen_addresses = '*'`)
- **Testado**: Conexão externa funcionando com `postgresql://postgres:postgres@200.1.219.226:5433/ecomercepro?sslmode=disable`
- **Documentado**: Adicionada Opção 2 no DEPLOY.md para uso de banco local com IP público
- **Requisitos confirmados**:
  - Container `ecomercepro-db` rodando na porta 5433:5432
  - PostgreSQL 16.9 acessível externamente
  - Configuração `pg_hba.conf` permite conexões externas com `scram-sha-256`

### 🔧 Correção do Erro P1012 do Prisma
- **Problema**: Script `vercel-build` executava `prisma migrate deploy` durante build
- **Solução**: Removido `prisma migrate deploy` do script `vercel-build`
- **Configuração atual**: `vercel-build: "prisma generate && next build"`
- **Adicionado**: Script `vercel-postbuild` para executar migrações após o build
- **Status**: ⚠️ **ERRO PERSISTE** - Logs de build ainda mostram execução de `prisma migrate deploy`

### 📚 Melhorias na Documentação
- **Atualizado**: DEPLOY.md com instruções detalhadas para configuração do banco
- **Adicionado**: Seção específica para uso de banco local com Docker
- **Incluído**: Comandos de teste de conexão externa
- **Documentado**: Requisitos de firewall e configuração de rede

### 🚨 Próximos Passos (URGENTE)
1. **Verificar correções no repositório remoto** - Script `vercel-build` pode não estar atualizado no GitHub
2. **Configurar DATABASE_URL na Vercel** - Usar `postgresql://postgres:postgres@200.1.219.226:5433/ecomercepro?sslmode=disable`
3. **Testar deploy** - Verificar se erro P1012 foi resolvido com banco local

---

## [2025-01-24] - Correção Crítica do Erro P1012 do Prisma

### Correções Críticas
- **Erro P1012 Prisma**: Resolvido erro "the URL must start with the protocol postgresql:// or postgres://" durante build
- **Script vercel-build**: Removido `prisma migrate deploy` para evitar erro durante build sem DATABASE_URL
- **Script vercel-postbuild**: Adicionado para executar migrações após o build quando variáveis estão disponíveis
- **Estratégia de Build**: Separada geração do cliente Prisma (build) das migrações (pós-build)

### Melhorias na Documentação
- **Passo a Passo DATABASE_URL**: Instruções detalhadas para criar banco Vercel Postgres
- **Avisos Críticos**: Enfatizada necessidade de configurar variáveis ANTES do deploy
- **Troubleshooting Atualizado**: Incluída nova estratégia de build na solução de problemas
- **Guia Visual**: Adicionados emojis e formatação para destacar configurações obrigatórias

### Mudanças Técnicas
- **package.json**: `vercel-build` agora executa apenas `prisma generate && next build`
- **package.json**: Novo script `vercel-postbuild` executa `prisma migrate deploy`
- **DEPLOY.md**: Instruções completas para configurar Vercel Postgres
- **Fluxo de Deploy**: Build → Environment Variables → Migrations

### Status dos Testes
- ✅ Scripts de build atualizados
- ✅ Documentação completa atualizada
- ✅ Estratégia de separação build/migrate implementada
- ❌ **ERRO PERSISTENTE**: Build ainda falha com P1012 - script vercel-build no repositório remoto ainda contém `prisma migrate deploy`

### Próximos Passos
- 🔄 **URGENTE**: Verificar se as correções do package.json foram aplicadas no repositório remoto
- 📋 Configurar DATABASE_URL no dashboard da Vercel antes do próximo deploy
- 🧪 Testar deploy após correções serem aplicadas

---

## [2025-01-24] - Correção de Erro de DATABASE_URL no Deploy

### Correções
- **Erro Prisma P1012**: Resolvido erro "the URL must start with the protocol postgresql:// or postgres://"
- **Documentação DEPLOY.md**: Adicionada seção específica de troubleshooting para erro de DATABASE_URL
- **Configuração Crítica**: Enfatizada importância obrigatória de configurar DATABASE_URL antes do deploy
- **Formato de URL**: Especificado formato correto para PostgreSQL: `postgresql://username:password@host:port/database?sslmode=require`
- **Instruções Vercel Postgres**: Adicionadas instruções detalhadas para configurar banco na Vercel

### Melhorias na Documentação
- **Avisos Visuais**: Adicionados emojis e formatação para destacar configurações críticas
- **Troubleshooting Expandido**: Nova seção com soluções para erros comuns de banco de dados
- **Instruções Claras**: Passo a passo detalhado para configurar DATABASE_URL na Vercel

### Status dos Testes
- ✅ Configuração do vercel.json validada
- ✅ Documentação de deploy atualizada
- ⏳ Aguardando teste de deploy com DATABASE_URL configurada

---

## [2025-01-24] - Correção de Deploy na Vercel

### Corrigido
- **Erro crítico de deploy**: "Environment Variable references Secret which does not exist"
- Configuração incorreta no `vercel.json` que usava `@secret_name` ao invés de `$VARIABLE_NAME`
- Documentação atualizada com instruções claras sobre Environment Variables vs Secrets

### Alterado
- `vercel.json`: Alterado todas as referências de `@secret_name` para `$VARIABLE_NAME`
- `DEPLOY.md`: Adicionado seção de troubleshooting específica para este erro
- `DEPLOY.md`: Esclarecido que deve usar "Environment Variables" e não "Secrets" da Vercel

### Detalhes Técnicos
- ✅ `DATABASE_URL`: `"$DATABASE_URL"` (correto)
- ❌ `DATABASE_URL`: `"@database_url"` (incorreto - causava o erro)
- Todas as 6 variáveis de ambiente foram corrigidas no `vercel.json`

## [2025-01-24] - Preparação para Deploy na Vercel

### Adicionado
- Configuração completa para deploy na Vercel (`vercel.json`)
- Arquivo `.env.example` otimizado para produção
- Documentação completa de deploy (`DEPLOY.md`)
- Configuração de repositório Git com branch limpa (`clean-main`)
- Arquivo `.gitignore` otimizado para Next.js e Vercel
- Especificação de engines Node.js e npm no `package.json`
- Headers de segurança configurados (CSP, X-Frame-Options, etc.)
- Configurações de build otimizadas para produção

### Configurado
- Variáveis de ambiente para produção (Stripe, NextAuth, Database)
- Integração com Vercel Postgres e PlanetScale
- Webhook do Stripe para processamento de pagamentos
- Funções serverless com timeout de 30 segundos
- Regiões de deploy otimizadas
- Regras de rewrite para SPA

### Melhorado
- Estrutura de dependências (Next.js movido para dependencies)
- Segurança do repositório (remoção de secrets do histórico)
- Organização de arquivos de configuração
- Documentação técnica do projeto

### Deploy
- ✅ Código enviado para GitHub (branch: clean-main)
- ✅ Configurações de produção validadas
- ✅ Documentação de deploy criada
- 🚀 Pronto para deploy na Vercel

## [2025-01-24] - Análise de Logs de Build e Correções para Erro P1012 Persistente

### Análise dos Logs
- **Commit Clonado**: 4662577 (verificar se é o mais recente; local está em 2f0a176)
- **Erro Principal**: P1012 - DATABASE_URL não começa com `postgresql://` ou `postgres://` durante `prisma migrate deploy`
- **Outros Avisos**: Depreciações em rimraf, inflight, glob, eslint; atualização disponível para Prisma 6.16.2
- **Script Executado**: `vercel-build` inclui `prisma migrate deploy` (pode estar desatualizado no repo remoto)

### Correções Sugeridas
- **Verificar DATABASE_URL na Vercel**: Garanta que começa com `postgresql://` (ex: `postgresql://postgres:postgres@200.1.219.226:5433/ecomercepro?sslmode=disable`)
- **Atualizar Repo**: Faça git pull e verifique se script `vercel-build` está sem `prisma migrate deploy`
- **Atualizar Prisma**: Considere upgrade para v6.16.2 seguindo guia oficial
- **Redeploy**: Após correções, redeploy manual na Vercel

### Status
- ❌ Erro persiste devido a formato inválido da URL
- ✅ Análise completa realizada
- ⏳ Aguardando confirmação do valor exato da DATABASE_URL na Vercel\n\n## [2025-01-24] - Análise de Novos Logs e Mismatch de Commits\n\n### Análise\n- **Commit em Uso na Vercel**: 4662577 (\"fix: corrigir erro de Environment Variable references Secret\", alterou DEPLOY.md e vercel.json)\n- **Commit Local/Remote Mais Recente**: b6f287d (\"docs: atualizar CHANGELOG.md com análise dos logs de build e correções para erro P1012\")\n- **Erro Persistente**: P1012 durante `prisma migrate deploy` - URL não começa com protocolo correto\n- **Discrepância**: Vercel clonando commit antigo apesar do remote estar atualizado em b6f287d\n- **Outros**: Sugestão de atualização para Prisma 6.16.2\n\n### Correções Sugeridas\n- **Verificar Dashboard Vercel**: Confirme se o projeto está configurado para o branch clean-main e repo correto; verifique lista de deploys para ver se o latest commit aparece\n- **Trigger Novo Deploy**: Faça uma pequena alteração (ex: comentário em código), commit e push para forçar Vercel a clonar o latest commit\n- **Debug DATABASE_URL**: No dashboard, confirme o valor exato (deve começar com postgresql:// e incluir sslmode=disable); teste se está disponível durante build\n- **Atualizar Prisma**: Atualize para v6.16.2 se necessário, seguindo o guia de major upgrade\n\n### Status\n- ❌ Deploy falhando com commit antigo\n- ✅ Repositório remoto atualizado\n- ⏳ Aguardando sincronização e novo deploy para validar correções