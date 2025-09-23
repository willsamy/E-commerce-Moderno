"use client"

import Link from "next/link"

type Category = { id: string; name: string; slug: string }
type Product = {
  id: string
  name: string
  slug: string
  priceCents: number
  images: string[]
  category: Category | null
}
type ProductList = {
  items: Product[]
  total: number
  pages: number
  page: number
  perPage: number
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${process.env.APP_BASE_URL || ""}${path}`, {
    cache: "no-store",
    ...init,
  })
  if (!res.ok) {
    throw new Error(`Falha ao buscar ${path}`)
  }
  return res.json()
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string; page?: string }
}) {
  const q = searchParams?.q?.toString() || ""
  const category = searchParams?.category?.toString() || ""
  const page = Number(searchParams?.page || "1")

  const [categories, products] = await Promise.all([
    fetchJSON<Category[]>("/api/categories"),
    fetchJSON<ProductList>(`/api/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&page=${page}`),
  ])

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Catálogo</h1>

      <form className="flex flex-wrap items-center gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar produtos..."
          className="flex-1 min-w-[220px] rounded border px-3 py-2"
        />
        <select name="category" defaultValue={category} className="rounded border px-3 py-2">
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="rounded bg-black px-4 py-2 text-white">Filtrar</button>
      </form>

      {products.items.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto encontrado.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.items.map((p) => (
            <li key={p.id} className="border rounded p-3 flex flex-col">
              <Link href={`/produto/${p.slug}`}>
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/600x400.png?text=Produto"}
                  alt={p.name}
                  className="aspect-[4/3] w-full object-cover rounded"
                />
              </Link>
              <div className="mt-3 flex-1">
                <Link href={`/produto/${p.slug}`} className="font-medium hover:underline">
                  {p.name}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {(p.priceCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {/* Evita navegar para /api/cart exibindo JSON.
                   Usa fetch e redireciona para /carrinho no cliente. */}
                <button
                  className="flex-1 rounded border px-3 py-2 hover:bg-gray-50"
                  onClick={async (ev) => {
                    try {
                      const res = await fetch("/api/cart", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId: p.id, quantity: 1 }),
                      })
                      if (!res.ok) {
                        const data = await res.json().catch(() => null)
                        console.error("Falha ao adicionar:", data || res.statusText)
                        alert("Falha ao adicionar ao carrinho")
                        return
                      }
                    } catch (err) {
                      console.error(err)
                      alert("Erro ao adicionar ao carrinho")
                      return
                    }
                    // redireciona somente após sucesso
                    window.location.href = "/carrinho"
                  }}
                >
                  Adicionar ao carrinho
                </button>
                <Link href={`/produto/${p.slug}`} className="rounded border px-3 py-2">
                  Ver
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {products.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: products.pages }).map((_, i) => {
            const n = i + 1
            const sp = new URLSearchParams()
            if (q) sp.set("q", q)
            if (category) sp.set("category", category)
            sp.set("page", String(n))
            const href = `/?${sp.toString()}`
            const isActive = n === products.page
            return (
              <a
                key={n}
                href={href}
                className={`px-3 py-1 rounded border ${isActive ? "bg-black text-white" : ""}`}
              >
                {n}
              </a>
            )
          })}
        </div>
      )}
    </main>
  )
}