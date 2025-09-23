import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

async function getOrCreateSessionId() {
  const cookieStore = await cookies()
  let sid = cookieStore.get("sid")?.value
  if (!sid) {
    sid = randomUUID()
    cookieStore.set({
      name: "sid",
      value: sid,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    })
  }
  return sid
}

export async function GET() {
  const sid = await getOrCreateSessionId()
  // Garante carrinho
  let cart = await prisma.cart.findUnique({
    where: { sessionId: sid },
    include: { items: { include: { product: true } } },
  })
  if (!cart) {
    cart = await prisma.cart.create({
      data: { sessionId: sid },
      include: { items: { include: { product: true } } },
    })
  }
  return NextResponse.json(cart)
}

export async function POST(req: Request) {
  const sid = await getOrCreateSessionId()

  // Suporte a form-urlencoded e JSON
  const contentType = req.headers.get("content-type") || ""
  let productId: string | undefined
  let quantity: number | undefined

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}))
    productId = (body as any)?.productId
    quantity = Number((body as any)?.quantity ?? 1)
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null)
    if (form) {
      productId = String(form.get("productId") || "")
      const q = form.get("quantity")
      quantity = Number(q ?? 1)
    }
  } else {
    // Tentar ambos (compatibilidade)
    try {
      const body = await req.json()
      productId = (body as any)?.productId
      quantity = Number((body as any)?.quantity ?? 1)
    } catch {
      const form = await req.formData().catch(() => null)
      if (form) {
        productId = String(form.get("productId") || "")
        const q = form.get("quantity")
        quantity = Number(q ?? 1)
      }
    }
  }

  if (!productId || !Number.isFinite(quantity) || (quantity as number) <= 0) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  }

  // Garante carrinho
  let cart = await prisma.cart.findUnique({ where: { sessionId: sid } })
  if (!cart) cart = await prisma.cart.create({ data: { sessionId: sid } })

  // Verifica produto
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product || !product.active) {
    return NextResponse.json({ error: "Produto inválido" }, { status: 400 })
  }

  // Upsert de item
  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity as number } },
    create: { cartId: cart.id, productId, quantity: quantity as number },
  })

  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  })

  return NextResponse.json({ item, cart: full })
}

export async function PATCH(req: Request) {
  const sid = await getOrCreateSessionId()
  const body = await req.json().catch(() => ({}))
  const { productId, quantity } = body as { productId?: string; quantity?: number }

  if (!productId || !Number.isInteger(quantity) || quantity! < 0) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  }

  const cart = await prisma.cart.findUnique({ where: { sessionId: sid } })
  if (!cart) return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 404 })

  if (quantity === 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
  } else {
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    })
  }

  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  })

  return NextResponse.json(full)
}

export async function DELETE(req: Request) {
  const sid = await getOrCreateSessionId()
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get("productId")

  const cart = await prisma.cart.findUnique({ where: { sessionId: sid } })
  if (!cart) return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 404 })

  if (productId) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } })
  } else {
    // limpa todo carrinho
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  }

  const full = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  })

  return NextResponse.json(full)
}