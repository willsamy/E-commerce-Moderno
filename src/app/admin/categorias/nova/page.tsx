"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const CategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120, "Máximo 120 caracteres"),
  slug: z
    .string()
    .min(1, "Slug é obrigatório")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use minúsculas, números e hífens"),
})
type CategoryForm = z.infer<typeof CategorySchema>

export default function NovaCategoriaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(CategorySchema) as any,
    defaultValues: { name: "", slug: "" },
  })

  const onSubmit: SubmitHandler<CategoryForm> = async (values) => {
    setLoading(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
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
      setSubmitError(err.message || "Erro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="space-y-6 container py-6">
      <h2 className="text-lg font-semibold">Nova categoria</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
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