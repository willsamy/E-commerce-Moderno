import Image from "next/image"
import type { Metadata } from "next"

type Category = { id: string; name: string; slug: string }
type Product = {
  id: string
  name: string
  slug: string
  description?: string | null
  priceCents: number
  images: string[]
  stock: number
  category: Category | null
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${process.env.APP_BASE_URL || ""}${path}`, {
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Falha ao buscar ${path}`)
  return res.json()
}

async function getProduct(slug: string): Promise<Product> {
  const data = await fetchJSON<Product>(`/api/products/${encodeURIComponent(slug)}`)
  return data
}

// SEO dinâmico
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const p = await getProduct(params.slug)
    const title = `${p.name} | EcomercePro`
    const description = p.description || "Produto da loja EcomercePro"
    const images = p.images && p.images.length > 0 ? [{ url: p.images[0] }] : undefined

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images,
      },
      alternates: {
        canonical: `/produto/${p.slug}`,
      },
    }
  } catch {
    return {
      title: "Produto | EcomercePro",
      description: "Detalhe de produto",
    }
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  const priceBRL = (product.priceCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })

  return (
    <main className="container py-8">
      <nav className="text-sm text-muted-foreground">
        <a href="/" className="hover:underline">Home</a> <span>/</span>{" "}
        {product.category ? (
          <a href={`/?category=${encodeURIComponent(product.category.slug)}`} className="hover:underline">
            {product.category.name}
          </a>
        ) : (
          <span>Sem categoria</span>
        )} <span>/</span> <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          {product.images && product.images.length > 0 ? (
            <div className="aspect-[4/3] relative w-full overflow-hidden rounded border">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          ) : (
            <img
              src="https://via.placeholder.com/1200x800.png?text=Produto"
              alt={product.name}
              className="aspect-[4/3] w-full object-cover rounded border"
            />
          )}

          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded border">
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="text-lg">{priceBRL}</div>
          <div className="text-sm text-muted-foreground">
            {product.stock > 0 ? `Em estoque: ${product.stock}` : "Sem estoque"}
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-sm leading-6">{product.description}</p>
          )}

          <form
            action="/api/cart"
            method="POST"
            className="flex items-center gap-3"
          >
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="number"
              name="quantity"
              min={1}
              defaultValue={1}
              className="w-24 rounded border px-3 py-2"
            />
            <button
              formAction="/api/cart"
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              disabled={product.stock <= 0}
            >
              Adicionar ao carrinho
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}