import { authOptions } from '@/src/lib/auth'

describe('Auth configuration', () => {
 describe('authOptions', () => {
    it('should have correct session strategy', () => {
      expect(authOptions.session).toBeDefined()
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('should have correct pages configuration', () => {
      expect(authOptions.pages).toBeDefined()
      expect(authOptions.pages?.signIn).toBe('/login')
    })

    it('should have credentials provider', () => {
      expect(authOptions.providers).toBeDefined()
      expect(Array.isArray(authOptions.providers)).toBe(true)
      expect(authOptions.providers.length).toBeGreaterThan(0)
      
      const credentialsProvider = authOptions.providers[0]
      expect(credentialsProvider).toBeDefined()
      expect(typeof credentialsProvider).toBe('object')
    })

    it('should have required callbacks', () => {
      expect(authOptions.callbacks).toBeDefined()
      expect(typeof authOptions.callbacks?.jwt).toBe('function')
      expect(typeof authOptions.callbacks?.session).toBe('function')
    })
  })
})
