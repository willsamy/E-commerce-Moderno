import Link from "next/link"
import { prisma } from "@/src/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  })

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Produtos</h2>
        <Link href="/admin/produtos/novo" className="rounded border px-3 py-2 hover:bg-gray-50">
          Novo produto
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Categoria</th>
              <th className="px-3 py-2 text-left">Preço</th>
              <th className="px-3 py-2 text-left">Estoque</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.category?.name || "-"}</td>
                <td className="px-3 py-2">
                  {(p.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
                <td className="px-3 py-2">{p.stock}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/produtos/${p.id}`} className="rounded border px-2 py-1 hover:bg-gray-50">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}