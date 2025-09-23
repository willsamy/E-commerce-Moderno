import { POST, GET } from '@/src/app/api/admin/categories/route'
import { GET as getById, PUT, DELETE } from '@/src/app/api/admin/categories/[id]/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
 },
}))

describe('Admin Categories API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Category 1',
          slug: 'category-1',
        },
        {
          id: '2',
          name: 'Category 2',
          slug: 'category-2',
        },
      ]

      ;(prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories)

      const mockRequest = {} as Request
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCategories)
    })

    it('should handle database errors', async () => {
      ;(prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const mockRequestError = {} as Request
      const response = await GET()

      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('should create category successfully', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'New Category',
          slug: 'new-category',
        }),
      } as unknown as Request

      const mockCategory = {
        id: 'new1',
        name: 'New Category',
        slug: 'new-category',
      }

      ;(prisma.category.create as jest.Mock).mockResolvedValue(mockCategory)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockCategory)
      expect(prisma.category.create).toHaveBeenCalled()
    })

    it('should return error for invalid data', async () => {
      const mockRequest = {
        json: async () => ({
          name: '',
          slug: '',
        }),
      } as unknown as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should return error for duplicate slug', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'New Category',
          slug: 'existing-category',
        }),
      } as unknown as Request

      ;(prisma.category.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing',
        name: 'Existing Category',
        slug: 'existing-category',
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Slug já está em uso')
    })

    it('should handle database errors', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'New Category',
          slug: 'new-category',
        }),
      } as unknown as Request

      ;(prisma.category.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.category.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao criar categoria')
    })
  })
})
