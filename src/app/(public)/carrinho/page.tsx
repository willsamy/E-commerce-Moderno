"use client"

import { useEffect, useMemo, useState } from "react"

type CartProduct = {
  id: string
  name: string
  slug: string
  priceCents: number
  images: string[]
}
type CartItem = {
  id: string
  productId: string
  quantity: number
  product: CartProduct
}
type Cart = {
  id: string
  items: CartItem[]
}

export default function CartPage() {
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<Cart | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currency = "BRL"

  const totalCents = useMemo(() => {
    if (!cart) return 0
    return cart.items.reduce((acc, it) => acc + it.quantity * it.product.priceCents, 0)
  }, [cart])

  async function loadCart() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/cart", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Falha ao carregar carrinho")
      setCart(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(productId: string, quantity: number) {
    setLoading(true)
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Falha ao atualizar item")
      setCart(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function removeItem(productId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Falha ao remover item")
      setCart(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function checkout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/checkout", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Falha ao iniciar checkout")
      if (data.url) {
        window.location.href = data.url
      }
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  if (loading && !cart) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-semibold">Carrinho</h1>
        <p className="mt-2 text-muted-foreground">Carregando...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-semibold">Carrinho</h1>
        <p className="mt-2 text-red-600">{error}</p>
      </main>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="container py-8">
        <h1 className="text-2xl font-semibold">Carrinho</h1>
        <p className="mt-2 text-muted-foreground">Seu carrinho está vazio.</p>
      </main>
    )
  }

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Carrinho</h1>

      <ul className="divide-y">
        {cart.items.map((it) => (
          <li key={it.id} className="py-4 flex items-center gap-4">
            <img
              src={it.product.images?.[0] || "https://via.placeholder.com/80x80.png?text=Imagem"}
              alt={it.product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <div className="font-medium">{it.product.name}</div>
              <div className="text-sm text-muted-foreground">
                {(it.product.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => updateQuantity(it.productId, Math.max(0, it.quantity - 1))}
                disabled={loading}
              >
                -
              </button>
              <span className="w-8 text-center">{it.quantity}</span>
              <button
                className="px-2 py-1 border rounded"
                onClick={() => updateQuantity(it.productId, it.quantity + 1)}
                disabled={loading}
              >
                +
              </button>
              <button
                className="ml-4 px-3 py-1 border rounded text-red-600"
                onClick={() => removeItem(it.productId)}
                disabled={loading}
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t pt-4">
        <span className="text-lg font-semibold">Total</span>
        <span className="text-lg font-semibold">
          {(totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency })}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          onClick={checkout}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          disabled={loading || totalCents === 0}
        >
          Ir para pagamento
        </button>
      </div>
    </main>
  )
}