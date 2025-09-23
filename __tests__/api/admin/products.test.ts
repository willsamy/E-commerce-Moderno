import { POST, GET as getProducts } from '@/src/app/api/admin/products/route'
import { GET, PUT, DELETE } from '@/src/app/api/admin/products/[id]/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
 },
}))

describe('Admin Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return all products with categories', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          slug: 'product-1',
          priceCents: 1000,
          stock: 10,
          active: true,
          categoryId: 'cat1',
          category: {
            id: 'cat1',
            name: 'Category 1',
          },
        },
      ]

      const mockCategories = [
        {
          id: 'cat1',
          name: 'Category 1',
        },
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories)

      const mockRequest = {} as Request
      const response = await getProducts()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.products).toEqual(mockProducts)
      expect(data.categories).toEqual(mockCategories)
    })

    it('should handle database errors', async () => {
      ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await getProducts()

      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('should create product successfully', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'New Product',
          slug: 'new-product',
          description: 'New product description',
          priceCents: 1500,
          stock: 5,
          categoryId: 'cat1',
          images: ['image1.jpg'],
        }),
      } as unknown as Request

      const mockProduct = {
        id: 'new1',
        name: 'New Product',
        slug: 'new-product',
        description: 'New product description',
        priceCents: 1500,
        stock: 5,
        active: true,
        categoryId: 'cat1',
        images: ['image1.jpg'],
      }

      ;(prisma.product.create as jest.Mock).mockResolvedValue(mockProduct)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockProduct)
      expect(prisma.product.create).toHaveBeenCalled()
    })

    it('should return error for invalid data', async () => {
      const mockRequest = {
        json: async () => ({
          name: '',
          slug: '',
          priceCents: -100,
        }),
      } as unknown as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should handle database errors', async () => {
      const mockRequest = {
        json: async () => ({
          name: 'New Product',
          slug: 'new-product',
          description: 'New product description',
          priceCents: 1500,
          stock: 5,
          categoryId: 'cat1',
          images: ['image1.jpg'],
        }),
      } as unknown as Request

      ;(prisma.product.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao criar produto')
    })
  })
})
