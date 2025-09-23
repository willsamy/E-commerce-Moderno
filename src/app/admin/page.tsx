import { prisma } from "@/src/lib/prisma"

export const dynamic = "force-dynamic"

async function getCounts() {
  const [products, categories, orders, users] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.user.count(),
  ])
  return { products, categories, orders, users }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts()

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Admin • Dashboard</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Produtos</div>
          <div className="text-3xl font-bold">{counts.products}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Categorias</div>
          <div className="text-3xl font-bold">{counts.categories}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Pedidos</div>
          <div className="text-3xl font-bold">{counts.orders}</div>
        </div>
        <div className="rounded border p-4">
          <div className="text-sm text-muted-foreground">Usuários</div>
          <div className="text-3xl font-bold">{counts.users}</div>
        </div>
      </section>

      <p className="text-sm text-muted-foreground">
        Este é um painel inicial. Em breve: atalhos e gráficos, além de navegação para CRUDs.
      </p>
    </main>
  )
}