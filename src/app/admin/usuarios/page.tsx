import Link from "next/link"
import { prisma } from "@/src/lib/prisma"

export const dynamic = "force-dynamic"

function toQuery(params: Record<string, any>) {
  const s = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") s.set(k, String(v))
  })
  return s.toString()
}

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams?: { q?: string; page?: string; perPage?: string }
}) {
  const q = searchParams?.q?.toString() ?? ""
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1)
  const perPage = Math.min(50, Math.max(5, Number(searchParams?.perPage ?? "10") || 10))

  const where =
    q.trim().length > 0
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
  ])

  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <main className="space-y-4">
      <h2 className="text-lg font-semibold">Usuários</h2>

      <form className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome/email"
          className="w-64 rounded border px-3 py-2 text-sm"
        />
        <button className="rounded border px-3 py-2 text-sm hover:bg-gray-50">Buscar</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Nome</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Role</th>
              <th className="px-3 py-2 text-left">Criado em</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.name ?? "-"}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{new Date(u.createdAt).toLocaleString("pt-BR")}</td>
                <td className="px-3 py-2 text-right">
                  <Link href={`/admin/usuarios/${u.id}`} className="rounded border px-2 py-1 hover:bg-gray-50">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Página {page} de {pages} — {total} usuário(s)
        </div>
        <div className="flex gap-2">
          <Link
            className={`rounded border px-2 py-1 text-sm ${page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
            href={`?${toQuery({ q, page: page - 1, perPage })}`}
          >
            Anterior
          </Link>
          <Link
            className={`rounded border px-2 py-1 text-sm ${page >= pages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"}`}
            href={`?${toQuery({ q, page: page + 1, perPage })}`}
          >
            Próxima
          </Link>
        </div>
      </div>
    </main>
  )
}