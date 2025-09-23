import { NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const runtime = "nodejs" // garante Node runtime (necessário para Buffer e libs nativas)

export async function POST(req: Request) {
  const sig = (req.headers as any).get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET não configurado" }, { status: 500 })
  }
  if (!sig) {
    return NextResponse.json({ error: "Assinatura do Stripe ausente" }, { status: 400 })
  }

  const buf = await req.arrayBuffer()
  const rawBody = Buffer.from(buf)

  let event: Stripe.Event
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" })
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const stripeSessionId = session.id
        const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id

        // Marca pedido como pago
        const order = await prisma.order.findUnique({ where: { stripeSessionId } })
        if (order) {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: { status: "PAID", stripePaymentIntentId: paymentIntentId ?? null },
            })
            // baixa de estoque
            const items = await tx.orderItem.findMany({ where: { orderId: order.id } })
            for (const it of items) {
              await tx.product.update({
                where: { id: it.productId },
                data: { stock: { decrement: it.quantity } },
              })
            }

            // limpeza do carrinho associado à sessão (sid) se disponível
            // Observação: no momento da criação do pedido (checkout API) usamos cookie "sid" para o carrinho.
            // Se houver um Cart vinculado a um usuário, ele será limpo; se for apenas por sessão, precisamos do sessionId.
            // Como não persistimos o sid no Order schema, tentamos limpar pelo userId (se houver).
            if (order.userId) {
              const userCart = await tx.cart.findFirst({
                where: { userId: order.userId },
                include: { items: true },
              })
              if (userCart) {
                await tx.cartItem.deleteMany({ where: { cartId: userCart.id } })
              }
            }
          })
        }

        break
      }
      case "checkout.session.expired":
      case "payment_intent.canceled": {
        // Em cenários de cancelamento, poderíamos marcar como CANCELED
        break
      }
      default:
        // Ignorar outros eventos por ora
        break
    }
  } catch (e: any) {
    console.error("Erro ao processar webhook:", e)
    return NextResponse.json({ received: true, error: e?.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}