import Link from "next/link"
import { prisma } from "@/src/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminUsuarioDetailPage(props: { params: { id: string } }) {
  const { id } = props.params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        select: {
          id: true,
          totalCents: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!user) {
    return (
      <main className="space-y-4">
        <h2 className="text-lg font-semibold">Usuário</h2>
        <div className="rounded border p-4">
          <p className="text-sm text-red-700">Usuário não encontrado.</p>
          <div className="mt-4">
            <Link href="/admin/usuarios" className="text-blue-600 hover:underline">
              Voltar para Usuários
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuário #{user.id}</h2>
        <Link href="/admin/usuarios" className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
          Voltar
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded border p-4">
          <h3 className="mb-2 font-medium">Dados</h3>
          <div className="text-sm">
            <p><span className="text-gray-500">Nome:</span> {user.name ?? "-"}</p>
            <p><span className="text-gray-500">Email:</span> {user.email}</p>
            <p><span className="text-gray-500">Role:</span> <span className="font-semibold">{user.role}</span></p>
          </div>
        </div>
        <div className="rounded border p-4">
          <h3 className="mb-2 font-medium">Datas</h3>
          <p className="text-sm">Criado: {new Date(user.createdAt).toLocaleString("pt-BR")}</p>
          <p className="text-sm">Atualizado: {new Date(user.updatedAt).toLocaleString("pt-BR")}</p>
        </div>
        <div className="rounded border p-4">
          <h3 className="mb-2 font-medium">Ações</h3>
          <form action={`/api/admin/users/${user.id}`} method="post" className="space-y-2">
            <input type="hidden" name="_method" value="PUT" />
            <label className="block text-sm">
              Atualizar Role
              <select name="role" defaultValue={user.role} className="mt-1 w-full rounded border px-2 py-1 text-sm">
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            <button className="rounded border px-3 py-1 text-sm hover:bg-gray-50">Salvar</button>
          </form>
        </div>
      </section>

      <section className="rounded border">
        <div className="border-b p-4">
          <h3 className="font-medium">Pedidos recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Criado em</th>
                <th className="px-3 py-2 text-left">Total</th>
                <th className="px-3 py-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {user.orders.map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="px-3 py-2">{o.id}</td>
                  <td className="px-3 py-2">{o.status}</td>
                  <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2">
                    {(o.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Link href={`/admin/pedidos/${o.id}`} className="rounded border px-2 py-1 hover:bg-gray-50">
                      Ver pedido
                    </Link>
                  </td>
                </tr>
              ))}
              {user.orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                    Nenhum pedido.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}