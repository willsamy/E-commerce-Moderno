"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  priceCents: number
  stock: number
  categoryId: string | null
  images: string[]
}

const ProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200, "Máximo 200 caracteres"),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Use minúsculas, números e hífens"),
  description: z.string().default(""),
  priceCents: z
    .number({ invalid_type_error: "Informe um número" })
    .int("Deve ser inteiro")
    .min(0, "Não pode ser negativo"),
  stock: z
    .number({ invalid_type_error: "Informe um número" })
    .int("Deve ser inteiro")
    .min(0, "Não pode ser negativo"),
  categoryId: z.string().optional(),
  images: z.string().default(""),
})
type ProductForm = z.infer<typeof ProductSchema>

export default function EditarProdutoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductForm>({
    resolver: zodResolver(ProductSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      priceCents: 0,
      stock: 0,
      categoryId: "",
      images: "",
    },
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoadingPage(true)
        const [catsRes, prodRes] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }),
          fetch(`/api/products/${id}`, { cache: "no-store" }),
        ])
        if (!catsRes.ok) throw new Error("Falha ao carregar categorias")
        if (!prodRes.ok) throw new Error("Falha ao carregar produto")
        const cats = (await catsRes.json()) as Category[]
        const prod = (await prodRes.json()) as Product
        if (!mounted) return
        setCategories(cats)
        reset({
          name: prod.name,
          slug: prod.slug,
          description: prod.description || "",
          priceCents: prod.priceCents,
          stock: prod.stock,
          categoryId: prod.categoryId || "",
          images: (prod.images || []).join("\n"),
        })
      } catch (e: any) {
        if (!mounted) return
        setError(e.message || "Falha ao carregar dados")
      } finally {
        if (!mounted) return
        setLoadingPage(false)
      }
    }
    if (id) load()
    return () => {
      mounted = false
    }
  }, [id, reset])

  const onSubmit: SubmitHandler<ProductForm> = async (values) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          images: (values.images || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          categoryId: values.categoryId || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Falha ao salvar produto")
      }
      router.push("/admin/produtos")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erro")
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Falha ao excluir produto")
      }
      router.push("/admin/produtos")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erro")
    } finally {
      setLoading(false)
    }
  }

  if (loadingPage) {
    return <main className="container py-8">Carregando...</main>
  }

  return (
    <main className="space-y-6 container py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Editar produto</h2>
        <div className="flex gap-2">
          <button
            onClick={onDelete}
            className="rounded border border-red-300 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-70"
            disabled={loading}
          >
            Excluir
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>}
        <div className="grid gap-2">
          <label className="text-sm">Nome</label>
          <input className="rounded border px-3 py-2" {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Slug</label>
          <input className="rounded border px-3 py-2" {...register("slug")} />
          {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Descrição</label>
          <textarea className="rounded border px-3 py-2 min-h-[100px]" {...register("description")} />
          {errors.description && <p className="text-xs text-red-600">{String(errors.description.message)}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Categoria</label>
          <select className="rounded border px-3 py-2" {...register("categoryId")}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-red-600">{String(errors.categoryId.message)}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Preço (centavos)</label>
          <input type="number" className="rounded border px-3 py-2" {...register("priceCents", { valueAsNumber: true })} min={0} />
          {errors.priceCents && <p className="text-xs text-red-600">{errors.priceCents.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Estoque</label>
          <input type="number" className="rounded border px-3 py-2" {...register("stock", { valueAsNumber: true })} min={0} />
          {errors.stock && <p className="text-xs text-red-600">{errors.stock.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Imagens (1 por linha, URLs)</label>
          <textarea className="rounded border px-3 py-2 min-h-[100px]" {...register("images")} />
          {errors.images && <p className="text-xs text-red-600">{String(errors.images.message)}</p>}
        </div>

        <div className="flex gap-2">
          <button disabled={loading} className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-70">
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button type="button" onClick={() => history.back()} className="rounded border px-4 py-2 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </main>
  )
}