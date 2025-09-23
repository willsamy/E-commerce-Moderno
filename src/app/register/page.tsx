"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z
  .object({
    name: z.string().min(2, "Nome é obrigatório"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirm: z.string().min(8, "Confirmação obrigatória"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Senhas não conferem",
    path: ["confirm"],
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setError(null)
    setSuccess(null)
    try {
      // Chama API de criação de usuário simples
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Falha ao registrar")

      setSuccess("Conta criada com sucesso. Redirecionando para login...")
      setTimeout(() => router.push("/login"), 1200)
    } catch (e: any) {
      setError(e.message || "Falha ao registrar")
    }
  }

  return (
    <main className="container py-8 max-w-md">
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input className="mt-1 w-full rounded border px-3 py-2" placeholder="Seu nome" {...register("name")} />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">E-mail</label>
          <input type="email" className="mt-1 w-full rounded border px-3 py-2" placeholder="seu@email.com" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input type="password" className="mt-1 w-full rounded border px-3 py-2" placeholder="********" {...register("password")} />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Confirmar senha</label>
          <input type="password" className="mt-1 w-full rounded border px-3 py-2" placeholder="********" {...register("confirm")} />
          {errors.confirm && <p className="text-sm text-red-600 mt-1">{errors.confirm.message}</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button type="submit" className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Já tem conta? <a className="underline" href="/login">Entrar</a>
      </p>
    </main>
  )
}