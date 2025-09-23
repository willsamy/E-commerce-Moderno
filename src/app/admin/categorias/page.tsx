import Link from "next/link"
import { prisma } from "@/src/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  })

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <Link href="/admin/categorias/nova" className="rounded border px-3 py-2 hover:bg-gray-50">
          Nova categoria
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Slug</th>
              <th className="px-3 py-2 text-left">Produtos</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.slug}</td>
                <td className="px-3 py-2">{(c as any)._count?.products ?? 0}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/categorias/${c.id}`} className="rounded border px-2 py-1 hover:bg-gray-50">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhuma categoria cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}