import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

// Helper ADMIN guard
async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== "ADMIN") return null
  return session
}

// GET /api/admin/users/[id] -> retorna um usuário
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}

// PUT /api/admin/users/[id] -> atualiza role
// Aceita body JSON: { role: "USER" | "ADMIN" }
// Também suporta submission form-urlencoded com _method=PUT e role no corpo (para forms simples)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  let role: "USER" | "ADMIN" | undefined

  // Tenta ler JSON primeiro
  const contentType = req.headers.get("content-type") || ""
  try {
    if (contentType.includes("application/json")) {
      const body = await req.json()
      role = body?.role
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await req.formData()
      // _method já é tratado pelo App Router, mas estamos chegando no handler PUT diretamente
      const r = form.get("role")
      if (typeof r === "string") role = r as "USER" | "ADMIN"
    }
  } catch {
    // Ignora parse error e segue para validação
  }

  if (role !== "USER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Role inválida" }, { status: 400 })
  }

  try {
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}