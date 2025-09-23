import { GET } from '@/src/app/api/categories/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    category: {
      findMany: jest.fn(),
    },
 },
}))

describe('Categories API', () => {
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

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockCategories)
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      })
    })

    it('should handle database errors', async () => {
      ;(prisma.category.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await GET()

      expect(response.status).toBe(500)
    })

    it('should return empty array when no categories exist', async () => {
      ;(prisma.category.findMany as jest.Mock).mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })
  })
})
