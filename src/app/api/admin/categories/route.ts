import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/admin/categories  -> listar todas as categorias
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (err: any) {
    console.error("admin categories GET error", err)
    return NextResponse.json({ error: "Erro ao carregar categorias" }, { status: 500 })
  }
}

// POST /api/admin/categories  -> criar categoria
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || "").trim()
    const slug = String(body?.slug || "").trim().toLowerCase()

    if (!name || !slug) {
      return NextResponse.json({ error: "Nome e slug são obrigatórios" }, { status: 400 })
    }

    const exists = await prisma.category.findUnique({ where: { slug } })
    if (exists) {
      return NextResponse.json({ error: "Slug já está em uso" }, { status: 409 })
    }

    const created = await prisma.category.create({
      data: { name, slug },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    console.error("admin categories POST error", err)
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }
}