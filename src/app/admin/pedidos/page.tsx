import { prisma } from "@/src/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: true },
      },
    },
  })

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Pedidos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Criado em</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Itens</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="px-3 py-2">{o.id}</td>
                <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString("pt-BR")}</td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2">
                  {o.items.reduce((acc, it) => acc + it.quantity, 0)}
                </td>
                <td className="px-3 py-2">
                  {(o.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/pedidos/${o.id}`} className="rounded border px-2 py-1 hover:bg-gray-50">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}