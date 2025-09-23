import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/src/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const raw = await req.text()
    const body = raw ? JSON.parse(raw) : {}

    // URLs de retorno do checkout
    const base = process.env.APP_BASE_URL || "http://localhost:8180"
    const success_url = body?.success_url || `${base}/checkout/sucesso`
    const cancel_url = body?.cancel_url || `${base}/checkout/cancelado`

    // Sessão do carrinho (sid em cookie)
    const cookieHeader = req.headers.get("cookie") || ""
    const sidMatch = cookieHeader.match(/(?:^|; )sid=([^;]+)/)
    const sid = sidMatch ? decodeURIComponent(sidMatch[1]) : crypto.randomUUID()

    const cart = await prisma.cart.findUnique({
      where: { sessionId: sid },
      include: { items: { include: { product: true } } },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
    }

    // Calcula total do pedido
    const totalCents = cart.items.reduce((acc, ci) => acc + ci.product.priceCents * ci.quantity, 0)

    // Cria Order PENDING e seus itens (tipagem exige totalCents e unitPriceCents + connect do produto)
    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        totalCents,
        items: {
          create: cart.items.map((ci) => ({
            quantity: ci.quantity,
            unitPriceCents: ci.product.priceCents,
            product: {
              connect: { id: ci.productId },
            },
          })),
        },
      },
      include: { items: true },
    })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-06-20",
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((ci) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: ci.product.name,
        },
        unit_amount: ci.product.priceCents,
      },
      quantity: ci.quantity,
      adjustable_quantity: { enabled: true, minimum: 1 },
    }))

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url,
      cancel_url,
      metadata: { orderId: String(order.id) },
    })

    const res = NextResponse.json({ id: session.id, url: session.url })
    if (!sidMatch) {
      res.headers.append(
        "Set-Cookie",
        `sid=${encodeURIComponent(sid)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; HttpOnly; SameSite=Lax`
      )
    }
    return res
  } catch (err: any) {
    console.error("checkout error", err)
    return NextResponse.json({ error: "Erro ao iniciar checkout" }, { status: 500 })
  }
}