import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/admin/categories/[id]  -> obter categoria
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const cat = await prisma.category.findUnique({
      where: { id: params.id },
    })
    if (!cat) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    }
    return NextResponse.json(cat)
  } catch (err: any) {
    console.error("admin categories GET error", err)
    return NextResponse.json({ error: "Erro ao carregar categoria" }, { status: 500 })
  }
}

// PUT /api/admin/categories/[id]  -> atualizar categoria
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? "").toString().trim()
    const slug = (body?.slug ?? "").toString().trim().toLowerCase()

    if (!name || !slug) {
      return NextResponse.json({ error: "Nome e slug são obrigatórios" }, { status: 400 })
    }

    // garante slug único (exceto a própria categoria)
    const exists = await prisma.category.findFirst({
      where: { slug, NOT: { id: params.id } },
      select: { id: true },
    })
    if (exists) {
      return NextResponse.json({ error: "Slug já está em uso" }, { status: 409 })
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: { name, slug },
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error("admin categories PUT error", err)
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[id]  -> excluir categoria
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // opcional: verificar se há produtos relacionados e impedir exclusão
    const related = await prisma.product.count({ where: { categoryId: params.id } })
    if (related > 0) {
      return NextResponse.json(
        { error: "Categoria possui produtos vinculados. Remova ou recategorize antes de excluir." },
        { status: 400 }
      )
    }

    await prisma.category.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("admin categories DELETE error", err)
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 })
  }
}