"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"

function InnerLogin() {
  const router = useRouter()
  const search = useSearchParams()
  const callbackUrl = search.get("callbackUrl") || "/"

  const schema = z.object({
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  })
  type FormValues = z.infer<typeof schema>

  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl,
        redirect: false,
      })

      if (!result || result.error) {
        setError(result?.error || "Credenciais inválidas. Verifique seu e-mail e senha.")
        return
      }

      // Login bem-sucedido, redireciona.
      // O refresh é importante para o estado do servidor ser atualizado.
      router.push(callbackUrl)
      router.refresh()
    } catch (e: any) {
      setError("Falha no login")
    }
  }

  return (
    <main className="container py-8 max-w-md">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">E-mail</label>
          <input
            type="email"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="seu@email.com"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="********"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted-foreground">
        Não tem conta? <a className="underline" href="/register">Crie uma</a>
      </p>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="container py-8">Carregando...</main>}>
      <InnerLogin />
    </Suspense>
  )
}