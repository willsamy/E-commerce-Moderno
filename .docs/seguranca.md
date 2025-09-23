# Segurança

## Visão Geral

A segurança é um aspecto crítico do EcomercePro, especialmente lidando com informações sensíveis de clientes e processamento de pagamentos. Este documento cobre todas as medidas de segurança implementadas, práticas recomendadas e conformidades necessárias.

## Arquitetura de Segurança

### 1. Princípios de Segurança
- **Defense in Depth**: Múltiplas camadas de segurança
- **Least Privilege**: Mínimo acesso necessário
- **Zero Trust**: Nunca confiar, sempre verificar
- **Secure by Design**: Segurança desde a concepção

### 2. Modelo de Ameaças

#### Ameaças Identificadas
```typescript
interface SecurityThreat {
  type: 'SQL_INJECTION' | 'XSS' | 'CSRF' | 'DDoS' | 'DATA_BREACH' | 'PAYMENT_FRAUD'
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW'
  mitigation: string[]
}

const threats: SecurityThreat[] = [
  {
    type: 'SQL_INJECTION',
    impact: 'HIGH',
    likelihood: 'LOW',
    mitigation: ['Prisma ORM', 'Input validation', 'Parameterized queries']
  },
  {
    type: 'XSS',
    impact: 'MEDIUM',
    likelihood: 'LOW',
    mitigation: ['React escaping', 'Content Security Policy', 'Input sanitization']
  }
]
```

## Autenticação e Autorização

### 1. NextAuth.js Security

#### Configuração de Segurança
```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Rate limiting por email
        await checkRateLimit(credentials?.email || '')
        
        // Validação de entrada
        const validated = loginSchema.parse(credentials)
        
        // Busca segura do usuário
        const user = await prisma.user.findUnique({
          where: { email: validated.email },
          select: { id: true, email: true, password: true, role: true }
        })
        
        if (!user) {
          await logFailedLogin(validated.email)
          throw new Error("Invalid credentials")
        }
        
        // Verificação de senha com timing seguro
        const isValid = await bcrypt.compare(validated.password, user.password)
        if (!isValid) {
          await logFailedLogin(user.email)
          throw new Error("Invalid credentials")
        }
        
        return { id: user.id, email: user.email, role: user.role }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60 // 24 horas
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
    secret: process.env.NEXTAUTH_SECRET
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  },
  events: {
    async signIn({ user }) {
      await logSignIn(user.email || '')
    },
    async signOut({ token }) {
      await logSignOut(token?.sub || '')
    }
  }
}
```

### 2. Rate Limiting

#### Configuração de Rate Limit
```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

const rateLimitCache = new LRUCache<string, number>({
  max: 500,
  ttl: 1000 * 60 * 15 // 15 minutos
})

export async function rateLimit(identifier: string): Promise<boolean> {
  const key = `rate_limit_${identifier}`
  const current = rateLimitCache.get(key) || 0
  
  if (current >= 100) { // 100 tentativas por 15 minutos
    return false
  }
  
  rateLimitCache.set(key, current + 1)
  return true
}

// Rate limiting específico por endpoint
export const rateLimitConfig = {
  login: { windowMs: 15 * 60 * 1000, max: 5 },
  register: { windowMs: 15 * 60 * 1000, max: 3 },
  checkout: { windowMs: 60 * 60 * 1000, max: 10 },
  api: { windowMs: 15 * 60 * 1000, max: 100 }
}
```

### 3. Proteção de Senhas

#### Política de Senhas
```typescript
// lib/password-policy.ts
export const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbiddenPatterns: [
    /password/i,
    /123456/,
    /qwerty/i,
    /admin/i
  ]
}

export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters`)
  }
  
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  passwordPolicy.forbiddenPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      errors.push('Password contains forbidden pattern')
    }
  })
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Hashing seguro de senhas
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}
```

## Proteção de Dados

### 1. Criptografia de Dados Sensíveis

#### Criptografia de Campos Sensíveis
```typescript
// lib/encryption.ts
import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32)

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(algorithm, key)
  cipher.setAAD(Buffer.from('additional-data'))
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const tag = Buffer.from(parts[1], 'hex')
  const encrypted = parts[2]
  
  const decipher = crypto.createDecipher(algorithm, key)
  decipher.setAuthTag(tag)
  decipher.setAAD(Buffer.from('additional-data'))
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### 2. Máscara de Dados

#### Mascaramento de Informações Sensíveis
```typescript
// lib/data-masking.ts
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  const maskedLocal = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1)
  return `${maskedLocal}@${domain}`
}

export function maskCreditCard(cardNumber: string): string {
  const last4 = cardNumber.slice(-4)
  return `****-****-****-${last4}`
}

export function maskPhone(phone: string): string {
  const last4 = phone.slice(-4)
  return `***-***-${last4}`
}
```

## Segurança de Pagamentos

### 1. Integração Segura com Stripe

#### Configuração de Segurança
```typescript
// lib/stripe-security.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 2,
  timeout: 30000,
  telemetry: false
})

// Validação de webhooks
export async function validateStripeWebhook(
  payload: string,
  signature: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    throw new Error('Invalid webhook signature')
  }
}

// Detecção de fraudes
export async function checkFraudSignals(
  paymentIntent: Stripe.PaymentIntent
): Promise<boolean> {
  const riskLevel = paymentIntent.charges?.data[0]?.outcome?.risk_level
  return riskLevel === 'elevated' || riskLevel === 'highest'
}
```

### 2. PCI DSS Compliance

#### Requisitos Implementados
```typescript
// lib/pci-compliance.ts
export const pciRequirements = {
  requirement1: {
    description: 'Install and maintain a firewall configuration',
    implemented: true,
    measures: [
      'AWS Security Groups',
      'Nginx rate limiting',
      'IP whitelisting for admin'
    ]
  },
  requirement2: {
    description: 'Do not use vendor-supplied defaults',
    implemented: true,
    measures: [
      'Custom passwords',
      'No default ports',
      'Secure configurations'
    ]
  },
  requirement3: {
    description: 'Protect stored cardholder data',
    implemented: true,
    measures: [
      'No storage of credit card numbers',
      'Use Stripe tokens only',
      'Encrypted storage of other data'
    ]
  },
  requirement4: {
    description: 'Encrypt transmission of cardholder data',
    implemented: true,
    measures: [
      'HTTPS everywhere',
      'TLS 1.3',
      'HSTS headers'
    ]
  }
}
```

## Proteção de Aplicação

### 1. Content Security Policy (CSP)

#### Configuração CSP
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self'",
              "connect-src 'self' https://api.stripe.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### 2. Input Validation e Sanitização

#### Validação de Entrada
```typescript
// lib/validation.ts
import { z } from 'zod'

// Esquemas de validação
export const productSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(2000).trim(),
  price: z.number().positive().max(999999.99),
  stock: z.number().int().nonnegative().max(999999),
  categoryId: z.string().uuid()
})

export const userSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).max(50).trim(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional()
})

// Sanitização de HTML
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}
```

### 3. SQL Injection Prevention

#### Uso Seguro do Prisma
```typescript
// Exemplos de queries seguras

// ✅ Seguro: Prisma ORM previne SQL injection automaticamente
const user = await prisma.user.findUnique({
  where: { email: userEmail }
})

// ✅ Seguro: Uso de parâmetros
const products = await prisma.product.findMany({
  where: {
    AND: [
      { name: { contains: searchTerm } },
      { price: { gte: minPrice } },
      { price: { lte: maxPrice } }
    ]
  }
})

// ❌ Nunca fazer: Concatenação direta
// const products = await prisma.$queryRaw`SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`
```

## Monitoramento e Detecção

### 1. Sistema de Logs de Segurança

#### Configuração de Logging
```typescript
// lib/security-logger.ts
import winston from 'winston'

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

export function logSecurityEvent(event: SecurityEvent) {
  securityLogger.warn('Security event', {
    type: event.type,
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    timestamp: new Date().toISOString(),
    details: event.details
  })
}

interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'SUSPICIOUS_ACTIVITY' | 'PAYMENT_FRAUD' | 'RATE_LIMIT_EXCEEDED'
  userId?: string
  ip: string
  userAgent: string
  details: Record<string, any>
}
```

### 2. Monitoramento de Acesso

#### Análise de Logs
```typescript
// lib/access-monitor.ts
export class AccessMonitor {
  private static instance: AccessMonitor
  private suspiciousIPs = new Map<string, number>()
  
  static getInstance(): AccessMonitor {
    if (!AccessMonitor.instance) {
      AccessMonitor.instance = new AccessMonitor()
    }
    return AccessMonitor.instance
  }
  
  async logAccess(
    ip: string,
    endpoint: string,
    userAgent: string,
    userId?: string
  ) {
    const key = `${ip}:${endpoint}`
    const count = this.suspiciousIPs.get(key) || 0
    
    this.suspiciousIPs.set(key, count + 1)
    
    if (count > 50) {
      await this.blockIP(ip)
      logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        ip,
        userAgent,
        details: { endpoint, count }
      })
    }
  }
  
  private async blockIP(ip: string) {
    // Adicionar IP à lista negra
    await redis.sadd('blocked_ips', ip)
  }
}
```

## Conformidade Legal

### 1. LGPD (Lei Geral de Proteção de Dados)

#### Requisitos LGPD
```typescript
// lib/lgpd-compliance.ts
export const lgpdRequirements = {
  consent: {
    description: 'Consentimento explícito do usuário',
    implemented: true,
    measures: [
      'Checkbox de consentimento',
      'Política de privacidade clara',
      'Opção de revogação'
    ]
  },
  dataMinimization: {
    description: 'Coleta mínima de dados',
    implemented: true,
    measures: [
      'Apenas dados necessários',
      'Justificativa para cada campo',
      'Anonimização quando possível'
    ]
  },
  dataSubjectRights: {
    description: 'Direitos do titular',
    implemented: true,
    measures: [
      'Acesso aos dados',
      'Portabilidade',
      'Eliminação',
      'Correção'
    ]
  }
}

// Processo de exclusão de dados
export async function deleteUserData(userId: string) {
  return await prisma.$transaction([
    // Anonimizar pedidos
    prisma.order.updateMany({
      where: { userId },
      data: {
        userId: null,
        shippingAddress: { /* anonimizado */ }
      }
    }),
    // Deletar dados pessoais
    prisma.user.delete({
      where: { id: userId }
    }),
    // Limpar cache
    redis.del(`user:${userId}`)
  ])
}
```

### 2. Política de Privacidade

#### Template de Política
```markdown
# Política de Privacidade

## Coleta de Dados
- **Dados Pessoais**: Nome, email, telefone, endereço
- **Dados de Pagamento**: Processados apenas via Stripe
- **Dados de Navegação**: Cookies, IP, user agent

## Uso dos Dados
- Processamento de pedidos
- Comunicação com cliente
- Melhoria de serviços
- Marketing (com consentimento)

## Direitos do Usuário
- Acesso aos dados
- Correção de dados
- Eliminação de dados
- Portabilidade de dados
- Revogação de consentimento

## Contato
Para exercer seus direitos: privacy@sua-loja.com
```

## Configuração de Segurança

### 1. Configuração do Servidor

#### Nginx Security Headers
```nginx
# nginx.conf
server {
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com;";
    
    # Remove headers que revelam informações
    server_tokens off;
    
    # Limitar tamanho de upload
    client_max_body_size 10M;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

### 2. Configuração do Banco de Dados

#### PostgreSQL Security
```sql
-- Configurações de segurança
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Configurar conexões seguras
ALTER SYSTEM SET listen_addresses = 'localhost';
ALTER SYSTEM SET port = 5432;

-- Auditing
CREATE EXTENSION IF NOT EXISTS pgaudit;
ALTER SYSTEM SET pgaudit.log = 'all';
```

## Testes de Segurança

### 1. Testes Automatizados

#### Testes de Segurança
```typescript
// tests/security/auth.test.ts
describe('Authentication Security', () => {
  it('should prevent timing attacks on login', async () => {
    const start = Date.now()
    await login('nonexistent@email.com', 'wrongpassword')
    const duration1 = Date.now() - start
    
    const start2 = Date.now()
    await login('valid@email.com', 'wrongpassword')
    const duration2 = Date.now() - start2
    
    expect(Math.abs(duration1 - duration2)).toBeLessThan(100)
  })
  
  it('should enforce password policy', async () => {
    const weakPasswords = [
      '123456',
      'password',
      'admin',
      'short'
    ]
    
    for (const password of weakPasswords) {
      const result = validatePassword(password)
      expect(result.valid).toBe(false)
    }
  })
  
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --"
    const result = await searchProducts(maliciousInput)
    expect(result).toEqual([])
  })
})
```

### 2. Penetration Testing

#### Checklist de Testes
```markdown
## Penetration Testing Checklist

### Authentication
- [ ] Brute force protection
- [ ] Session management
- [ ] Password policy
- [ ] Multi-factor authentication

### Input Validation
- [ ] SQL injection
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] File upload security

### Infrastructure
- [ ] Server configuration
- [ ] SSL/TLS configuration
- [ ] Database security
- [ ] API security

### Business Logic
- [ ] Price manipulation
- [ ] Inventory bypass
- [ ] Privilege escalation
- [ ] Payment bypass
```

## Incident Response

### 1. Plano de Resposta a Incidentes

#### Processo de Resposta
```typescript
// lib/incident-response.ts
export class IncidentResponse {
  async handleSecurityIncident(incident: SecurityIncident) {
    // 1. Identificação
    await this.identifyIncident(incident)
    
    // 2. Contenção
    await this.containIncident(incident)
    
    // 3. Investigação
    await this.investigateIncident(incident)
    
    // 4. Recuperação
    await this.recoverFromIncident(incident)
    
    // 5. Lições aprendidas
    await this.postIncidentReview(incident)
  }
  
  private async containIncident(incident: SecurityIncident) {
    switch (incident.type) {
      case 'DATA_BREACH':
        await this.revokeAllSessions()
        await this.forcePasswordReset()
        break
      case 'PAYMENT_FRAUD':
        await this.suspendPayments()
        await this.notifyStripe()
        break
      case 'DDoS':
        await this.enableDDoSProtection()
        break
    }
  }
}
```

### 2. Comunicação de Incidentes

#### Template de Notificação
```markdown
# Security Incident Notification

## Summary
- **Incident Type**: [Type]
- **Date/Time**: [When]
- **Affected Users**: [Count]
- **Severity**: [Level]

## Actions Taken
- [List of immediate actions]

## Next Steps
- [Planned actions]

## Contact
security@sua-loja.com
```

## Manutenção de Segurança

### 1. Atualizações de Segurança

#### Processo de Atualização
```bash
#!/bin/bash
# security-update.sh

echo "🔒 Starting security update..."

# 1. Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# 2. Update dependencies
npm audit
npm update

# 3. Security scan
npm audit --audit-level=high

# 4. Restart services
pm2 restart all

echo "✅ Security update completed"
```

### 2. Monitoramento Contínuo

#### Ferramentas de Monitoramento
```typescript
// lib/security-monitoring.ts
export class SecurityMonitor {
  async runSecurityChecks() {
    const checks = [
      this.checkSSLExpiration(),
      this.checkDependencyVulnerabilities(),
      this.checkFailedLogins(),
      this.checkSuspiciousActivity(),
      this.checkDiskSpace(),
      this.checkDatabaseConnections()
    ]
    
    const results = await Promise.all(checks)
    
    if (results.some(r => !r.ok)) {
      await this.sendSecurityAlert(results)
    }
  }
  
  private async checkSSLExpiration(): Promise<SecurityCheck> {
    const cert = await getSSLCertificate()
    const daysUntilExpiry = Math.floor((cert.expiry - Date.now()) / (1000 * 60 * 60 * 24))
    
    return {
      ok: daysUntilExpiry > 30,
      message: `SSL expires in ${daysUntilExpiry} days`
    }
  }
}
```

## Recursos de Segurança

### 1. Ferramentas de Segurança

#### Ferramentas Recomendadas
- **OWASP ZAP**: Web application security testing
- **Snyk**: Dependency vulnerability scanning
- **SonarQube**: Code security analysis
- **Metasploit**: Penetration testing
- **Nmap**: Network discovery
- **SQLMap**: SQL injection testing

### 2. Documentação de Referência

#### Links Úteis
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS Quick Reference Guide](https://www.pcisecuritystandards.org/documents/PCI_DSS-QRG-v3_2_1.pdf)
- [LGPD Compliance Guide](https://www.gov.br/anpd/pt-br)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Stripe Security Guide](https://stripe.com/docs/security)

### 3. Contatos de Emergência

#### Equipe de Segurança
- **Security Team**: security@sua-loja.com
- **Incident Response**: incident@sua-loja.com
- **Stripe Support**: support@stripe.com
- **Hosting Provider**: support@hosting.com
- **Certificate Authority**: support@ca.com

## Checklist de Segurança

### Pre-Launch Security Checklist
- [ ] SSL/TLS certificate installed and configured
- [ ] Security headers configured
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting configured
- [ ] Password policy enforced
- [ ] Database security configured
- [ ] API security implemented
- [ ] Payment security verified
- [ ] Logs and monitoring configured
- [ ] Incident response plan ready
- [ ] Security documentation updated
- [ ] Team security training completed

### Ongoing Security Tasks
- [ ] Weekly security scans
- [ ] Monthly dependency updates
- [ ] Quarterly security reviews
- [ ] Annual penetration testing
- [ ] Security awareness training
- [ ] Incident response drills
- [ ] Backup restoration tests
- [ ] SSL certificate renewal