"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

type Category = { id: string; name: string; slug: string }

const CategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120, "Máximo 120 caracteres"),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use minúsculas, números e hífens"),
})
type CategoryForm = z.infer<typeof CategorySchema>

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryForm>({
    resolver: zodResolver(CategorySchema) as any,
    defaultValues: { name: "", slug: "" },
  })

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoadingPage(true)
        const res = await fetch(`/api/admin/categories/${id}`, { cache: "no-store" })
        if (!res.ok) throw new Error("Falha ao carregar categoria")
        const cat: Category = await res.json()
        if (!mounted) return
        reset({ name: cat.name, slug: cat.slug })
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

  const onSubmit: SubmitHandler<CategoryForm> = async (values) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Falha ao salvar categoria")
      }
      router.push("/admin/categorias")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erro")
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || "Falha ao excluir categoria")
      }
      router.push("/admin/categorias")
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
        <h2 className="text-lg font-semibold">Editar categoria</h2>
        <button
          onClick={onDelete}
          className="rounded border border-red-300 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-70"
          disabled={loading}
        >
          Excluir
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
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