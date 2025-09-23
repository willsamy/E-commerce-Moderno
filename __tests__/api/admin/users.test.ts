import { GET } from '@/src/app/api/admin/users/route'
import { GET as getUser, PUT } from '@/src/app/api/admin/users/[id]/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
 },
}))

describe('Admin Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET all users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'USER',
        },
        {
          id: '2',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      ]

      ;(prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers)
      ;(prisma.user.count as jest.Mock).mockResolvedValue(mockUsers.length)

      const mockRequest = {
        url: 'http://localhost:3000/api/admin/users'
      } as Request
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.users).toEqual(mockUsers)
    })

    it('should handle database errors', async () => {
      ;(prisma.user.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const mockRequestError = {
        url: 'http://localhost:3000/api/admin/users'
      } as Request
      const response = await GET(mockRequestError)

      expect(response.status).toBe(500)
    })
  })

  describe('GET user by id', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        role: 'USER',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const mockRequest = {} as Request
      const mockContext = { params: { id: '1' } }
      const response = await getUser(mockRequest, mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockUser)
    })

    it('should return 404 when user not found', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const mockRequest = {} as Request
      const mockContext = { params: { id: 'non-existent' } }
      const response = await getUser(mockRequest, mockContext)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT update user', () => {
    it('should update user role successfully', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => ({
          role: 'ADMIN',
        }),
      } as unknown as Request

      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        role: 'ADMIN',
      }

      ;(prisma.user.update as jest.Mock).mockResolvedValue(mockUser)

      const mockContext = { params: { id: '1' } }
      const response = await PUT(mockRequest, mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockUser)
      expect(prisma.user.update).toHaveBeenCalled()
    })

    it('should return error for invalid role', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => ({
          role: 'INVALID_ROLE',
        }),
      } as unknown as Request

      const mockContext = { params: { id: '1' } }
      const response = await PUT(mockRequest, mockContext)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })
  })

})
