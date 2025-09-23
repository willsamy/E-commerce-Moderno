import { POST } from '@/src/app/api/register/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
 },
}))

describe('Register API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should register a new user successfully', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123',
        }),
      } as unknown as Request

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ ok: true })
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      })
      expect(prisma.user.create).toHaveBeenCalled()
    })

    it('should return error for existing email', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'test123',
        }),
      } as unknown as Request

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        email: 'existing@example.com',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data).toEqual({ error: 'E-mail já cadastrado' })
    })

    it('should return error for invalid data', async () => {
      const mockRequest = {
        json: async () => ({
          name: '',
          email: 'invalid-email',
          password: '',
        }),
      } as unknown as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Dados inválidos' })
    })

    it('should handle database errors', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123',
        }),
      } as unknown as Request

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Database error' })
    })
  })
})
