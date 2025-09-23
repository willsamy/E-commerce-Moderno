import "./globals.css"
import type { Metadata } from "next"
import Link from "next/link"
import { ReactNode } from "react"
import HeaderAuth from "@/components/HeaderAuth"
import { NextAuthProvider } from "@/lib/auth-provider"

export const metadata: Metadata = {
  title: "EcomercePro",
  description: "Loja online",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background text-foreground">
        <NextAuthProvider>
          <header className="border-b">
            <div className="container flex h-14 items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link href="/" className="font-semibold">EcomercePro</Link>
                <nav className="hidden sm:flex items-center gap-3 text-sm">
                  <Link href="/">Home</Link>
                  <Link href="/carrinho">Carrinho</Link>
                  {/* Link do Admin removido do menu público para manter área administrativa oculta */}
                </nav>
              </div>
              <HeaderAuth />
            </div>
          </header>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}