"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

type Category = { id: string; name: string }

// Definimos o schema com todos os campos do form de forma compatível com RHF
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

export default function NovoProdutoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
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
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((cats) => setCategories(cats))
      .catch(() => setCategories([]))
  }, [])

  const onSubmit: SubmitHandler<ProductForm> = async (values) => {
    setLoading(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          images: (values.images || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          categoryId: values.categoryId ? values.categoryId : undefined,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Falha ao salvar produto")
      }
      router.push("/admin/produtos")
    } catch (err: any) {
      setSubmitError(err.message || "Erro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-6">
      <h2 className="text-lg font-semibold">Novo produto</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        {submitError && <div className="rounded border border-red-300 bg-red-50 p-3 text-red-800">{submitError}</div>}

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
          <input
            type="number"
            className="rounded border px-3 py-2"
            {...register("priceCents", { valueAsNumber: true })}
            min={0}
          />
          {errors.priceCents && <p className="text-xs text-red-600">{errors.priceCents.message}</p>}
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Estoque</label>
          <input
            type="number"
            className="rounded border px-3 py-2"
            {...register("stock", { valueAsNumber: true })}
            min={0}
          />
          {errors.stock && <p className="text-xs text-red-600">{errors.stock.message}</p>}
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Imagens (1 por linha, URLs)</label>
          <textarea
            className="rounded border px-3 py-2 min-h-[100px]"
            {...register("images")}
            placeholder={`https://.../img1.jpg
https://.../img2.jpg`}
          />
          {errors.images && <p className="text-xs text-red-600">{String(errors.images.message)}</p>}
        </div>

        <div className="flex gap-2">
          <button disabled={loading} className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-70">
            {loading ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={() => history.back()}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  )
}