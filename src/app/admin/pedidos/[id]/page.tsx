import Link from "next/link"
import { prisma } from "@/src/lib/prisma"

export const dynamic = "force-dynamic"

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function AdminPedidoDetailPage(props: { params: { id: string } }) {
  const { id } = props.params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    return (
      <main className="space-y-4">
        <h2 className="text-lg font-semibold">Pedido</h2>
        <div className="rounded border p-4">
          <p className="text-sm text-red-700">Pedido não encontrado.</p>
          <div className="mt-4">
            <Link href="/admin/pedidos" className="text-blue-600 hover:underline">
              Voltar para Pedidos
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const totalItens = order.items.reduce((sum, it) => sum + it.quantity, 0)
  const subtotalCents = order.items.reduce((sum, it) => sum + it.quantity * it.unitPriceCents, 0)
  const freteCents = 0
  const totalCents = order.totalCents

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pedido #{order.id}</h2>
        <Link href="/admin/pedidos" className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
          Voltar
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <h3 className="mb-2 font-medium">Status</h3>
          <p className="text-sm">
            {order.status}
          </p>
        </div>
        <div className="rounded border p-4">
          <h3 className="mb-2 font-medium">Datas</h3>
          <p className="text-sm">Criado: {new Date(order.createdAt).toLocaleString("pt-BR")}</p>
          <p className="text-sm">Atualizado: {new Date(order.updatedAt).toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded border p-4">
          <h3 className="mb-2 font-medium">Cliente</h3>
          <p className="text-sm">
            {order.user ? (order.user.name ? `${order.user.name} · ${order.user.email}` : order.user.email) : "Não associado"}
          </p>
        </div>
      </section>

      <section className="rounded border">
        <div className="border-b p-4">
          <h3 className="font-medium">Itens ({totalItens})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left">Produto</th>
                <th className="px-3 py-2 text-right">Qtd</th>
                <th className="px-3 py-2 text-right">Preço un.</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{it.product.name}</span>
                      <span className="text-xs text-gray-500">{it.product.id}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">{it.quantity}</td>
                  <td className="px-3 py-2 text-right">{formatBRL(it.unitPriceCents)}</td>
                  <td className="px-3 py-2 text-right">{formatBRL(it.unitPriceCents * it.quantity)}</td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/admin/produtos/${it.product.id}`} className="rounded border px-2 py-1 hover:bg-gray-50">
                      Ver produto
                    </Link>
                  </td>
                </tr>
              ))}
              {order.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Sem itens neste pedido.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ml-auto w-full max-w-md rounded border p-4">
        <h3 className="mb-3 font-medium">Totais</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatBRL(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Frete</span>
            <span>{formatBRL(freteCents)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatBRL(totalCents)}</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <p>Stripe Session: {order.stripeSessionId ?? "-"}</p>
          <p>Payment Intent: {order.stripePaymentIntentId ?? "-"}</p>
        </div>
      </section>
    </main>
  )
}