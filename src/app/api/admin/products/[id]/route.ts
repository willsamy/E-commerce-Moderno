import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/admin/products/[id]  -> obter produto para edição
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (err: any) {
    console.error("admin products GET error", err)
    return NextResponse.json({ error: "Erro ao carregar produto" }, { status: 500 })
  }
}

// PUT /api/admin/products/[id]  -> atualizar produto
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

    const body = await req.json()
    const {
      name,
      slug,
      description,
      priceCents,
      stock,
      categoryId,
      images,
    } = body as {
      name?: string
      slug?: string
      description?: string
      priceCents?: number
      stock?: number
      categoryId?: string | null
      images?: string[]
    }

    // validações simples
    if (name != null && name.trim().length === 0) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 })
    }
    if (slug != null && slug.trim().length === 0) {
      return NextResponse.json({ error: "Slug inválido" }, { status: 400 })
    }
    if (priceCents != null && (isNaN(Number(priceCents)) || Number(priceCents) < 0)) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 })
    }
    if (stock != null && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return NextResponse.json({ error: "Estoque inválido" }, { status: 400 })
    }

    // checa duplicidade de slug se alterado
    if (slug) {
      const existing = await prisma.product.findFirst({
        where: { slug, NOT: { id: params.id } },
        select: { id: true },
      })
      if (existing) {
        return NextResponse.json({ error: "Slug já está em uso" }, { status: 409 })
      }
    }

    // normaliza imagens
    const imagesArr = Array.isArray(images)
      ? images.filter((s) => typeof s === "string" && s.trim().length > 0)
      : undefined

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name != null ? { name } : {}),
        ...(slug != null ? { slug } : {}),
        ...(description != null ? { description } : {}),
        ...(priceCents != null ? { priceCents: Number(priceCents) } : {}),
        ...(stock != null ? { stock: Number(stock) } : {}),
        ...(imagesArr != null ? { images: imagesArr } : {}),
        ...(categoryId === null
          ? { category: { disconnect: true } }
          : categoryId
          ? { category: { connect: { id: categoryId } } }
          : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error("admin products PUT error", err)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}

// DELETE /api/admin/products/[id]  -> excluir produto
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

    await prisma.product.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("admin products DELETE error", err)
    // verificação simples: pode falhar por FK em OrderItem
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}