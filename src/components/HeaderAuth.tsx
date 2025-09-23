"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function HeaderAuth() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div data-testid="loading-skeleton" className="h-9 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" aria-hidden />
    )
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
          Entrar
        </Link>
        <Link href="/register" className="rounded border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
          Criar conta
        </Link>
      </div>
    )
  }

  const name = (session.user?.name || session.user?.email || "").toString()

  return (
    <div className="flex items-center gap-2">
      <span className="truncate max-w-[160px] text-sm text-muted-foreground" title={name}>
        {name}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        Sair
      </button>
    </div>
  )
}
