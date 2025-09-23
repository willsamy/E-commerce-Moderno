import { GET, POST, DELETE } from '@/src/app/api/cart/route'
import { prisma } from '@/src/lib/prisma'

// Mock do Prisma
jest.mock('@/src/lib/prisma', () => ({
  prisma: {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      count: jest.fn(),
    },
 },
}))

// Mock do Next.js server components
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockReturnValue({ value: 'test-session-id' }),
    set: jest.fn(),
  })),
  headers: jest.fn().mockReturnValue(new Map()),
}))

describe('Cart API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should return empty cart when no session', async () => {
      const mockCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
        items: [],
      }

      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart)
      ;(prisma.cart.create as jest.Mock).mockResolvedValue(mockCart)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toEqual([])
      expect(data.id).toBe('cart1')
    })

    it('should return cart items when session exists', async () => {
      const mockCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            quantity: 2,
            product: {
              id: 'prod1',
              name: 'Product 1',
              priceCents: 1000,
              images: ['image1.jpg'],
            },
          },
        ],
      }

      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items.length).toBe(1)
      expect(data.id).toBe('cart1')
    })
  })

  describe('POST', () => {
    it('should add item to cart successfully', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('test-session-id'),
        },
        json: async () => ({
          productId: 'prod1',
          quantity: 1,
        }),
      } as unknown as Request

      const mockProduct = {
        id: 'prod1',
        name: 'Product 1',
        priceCents: 1000,
        stock: 10,
        active: true,
      }

      const mockCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
      }

      const mockCartItem = {
        id: 'item1',
        cartId: 'cart1',
        productId: 'prod1',
        quantity: 1,
      }

      const mockFullCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
        items: [mockCartItem],
      }

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart)
      ;(prisma.cartItem.upsert as jest.Mock).mockResolvedValue(mockCartItem)
      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValueOnce(mockCart).mockResolvedValueOnce(mockFullCart)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.item).toEqual(mockCartItem)
    })

    it('should return error for invalid product', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('test-session-id'),
        },
        json: async () => ({
          productId: 'invalid-prod',
          quantity: 1,
        }),
      } as unknown as Request

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Produto inválido' })
    })

    it('should return error for insufficient stock', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: async () => ({
          productId: 'prod1',
          quantity: 15,
        }),
      } as unknown as Request

      const mockProduct = {
        id: 'prod1',
        name: 'Product 1',
        priceCents: 1000,
        stock: 10,
        active: true,
      }

      const mockCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
      }

      const mockItem = {
        id: 'item1',
        cartId: 'cart1',
        productId: 'prod1',
        quantity: 15,
      }

      const mockFullCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
        items: [mockItem],
      }

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)
      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart)
      ;(prisma.cartItem.upsert as jest.Mock).mockResolvedValue(mockItem)
      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockFullCart)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.item).toEqual(mockItem)
    })
  })

  describe('DELETE', () => {
    it('should remove item from cart successfully', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/cart?productId=prod1',
        headers: {
          get: jest.fn().mockReturnValue('test-session-id'),
        },
        json: async () => ({
          productId: 'prod1',
        }),
      } as unknown as Request

      const mockCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
      }

      const mockFullCart = {
        id: 'cart1',
        sessionId: 'test-session-id',
        items: [],
      }

      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart)
      ;(prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({})
      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockFullCart)

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockFullCart)
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled()
    })

    it('should return error when cart not found', async () => {
      const mockRequest = {
        url: 'http://localhost:3000/api/cart?productId=prod1',
        headers: {
          get: jest.fn().mockReturnValue('invalid-session'),
        },
        json: async () => ({
          productId: 'prod1',
        }),
      } as unknown as Request

      ;(prisma.cart.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Carrinho não encontrado' })
    })
  })
})
