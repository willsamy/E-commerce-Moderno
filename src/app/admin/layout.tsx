import { ReactNode } from "react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin</h1>
        <nav className="flex gap-3 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/categorias">Categorias</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
          <Link href="/admin/usuarios">Usuários</Link>
        </nav>
      </div>
      <div>{children}</div>
    </div>
  )
}