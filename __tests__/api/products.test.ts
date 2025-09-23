import { GET as getAllProducts } from '@/src/app/api/products/route'
import { GET as getProductBySlug } from '@/src/app/api/products/[slug]/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
 },
}))

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET all products', () => {
    it('should return all active products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          slug: 'product-1',
          description: 'Description 1',
          priceCents: 1000,
          currency: 'BRL',
          stock: 10,
          images: ['image1.jpg'],
          active: true,
          categoryId: 'cat1',
          category: {
            id: 'cat1',
            name: 'Category 1',
            slug: 'category-1',
          },
        },
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.product.count as jest.Mock).mockResolvedValue(mockProducts.length)

      const mockRequest = {
        url: 'http://localhost:3000/api/products?page=1&pageSize=12'
      } as Request
      const response = await getAllProducts(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toEqual(mockProducts)
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { active: true },
        include: { category: true },
      })
    })

    it('should handle database errors', async () => {
      ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))
      ;(prisma.product.count as jest.Mock).mockRejectedValue(new Error('Database error'))

      const mockRequestError = {
        url: 'http://localhost:3000/api/products?page=1&pageSize=12'
      } as Request
      const response = await getAllProducts(mockRequestError)
      
      expect(response.status).toBe(500)
    })
  })

  describe('GET product by slug', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        slug: 'product-1',
        description: 'Description 1',
        priceCents: 1000,
        currency: 'BRL',
        stock: 10,
        images: ['image1.jpg'],
        active: true,
        categoryId: 'cat1',
        category: {
          id: 'cat1',
          name: 'Category 1',
          slug: 'category-1',
        },
      }

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)

      const mockRequest = {
        url: 'http://localhost:3000/api/products/product-1'
      } as Request
      const mockContext = { params: { slug: 'product-1' } }

      const response = await getProductBySlug(mockRequest, mockContext)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockProduct)
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'product-1' },
        include: { category: true },
      })
    })

    it('should return 404 when product not found', async () => {
      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const mockRequest = {} as Request
      const mockContext = { params: { slug: 'non-existent' } }

      const response = await getProductBySlug(mockRequest, mockContext)

      expect(response.status).toBe(404)
    })

    it('should handle database errors', async () => {
      ;(prisma.product.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

      const mockRequest = {} as Request
      const mockContext = { params: { slug: 'product-1' } }

      const response = await getProductBySlug(mockRequest, mockContext)

      expect(response.status).toBe(500)
    })
  })
})
