import { GET } from '@/src/app/api/admin/orders/[id]/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
    },
 },
}))

describe('Admin Orders API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET order by id', () => {
    it('should return order with items when found', async () => {
      const mockOrder = {
        id: '1',
        totalCents: 2000,
        currency: 'BRL',
        status: 'PENDING',
        createdAt: '2025-09-23T14:00:52.010Z',
        items: [
          {
            id: 'item1',
            quantity: 2,
            unitPriceCents: 1000,
            product: {
              id: 'prod1',
              name: 'Product 1',
              images: ['image1.jpg'],
            },
          },
        ],
      }

      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(mockOrder)

      const mockRequest = {} as Request
      const mockContext = { params: { id: '1' } }
      const response = await GET(mockRequest, mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockOrder)
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          user: true,
          items: { include: { product: true } },
        },
      })
    })

    it('should return 404 when order not found', async () => {
      ;(prisma.order.findUnique as jest.Mock).mockResolvedValue(null)

      const mockRequest = {} as Request
      const mockContext = { params: { id: 'non-existent' } }
      const response = await GET(mockRequest, mockContext)

      expect(response.status).toBe(404)
    })

    it('should handle database errors', async () => {
      ;(prisma.order.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const mockRequest = {} as Request
      const mockContext = { params: { id: '1' } }
      const response = await GET(mockRequest, mockContext)

      expect(response.status).toBe(500)
    })
  })
})
