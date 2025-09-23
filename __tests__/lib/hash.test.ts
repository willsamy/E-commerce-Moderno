import { hashPassword, verifyPassword } from '@/src/lib/hash'

describe('Hash functions', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash.length).toBeGreaterThan(0)
      expect(hash).not.toBe(password)
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'test123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'test123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'test123'
      const wrongPassword = 'wrong123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(wrongPassword, hash)
      
      expect(isValid).toBe(false)
    })

    it('should reject empty password', async () => {
      const password = 'test123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('', hash)
      
      expect(isValid).toBe(false)
    })
  })
})
