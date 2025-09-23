import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

// GET /api/admin/products -> listar produtos com categorias
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const role = (session as any)?.user?.role
    if (!session || role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        orderBy: { name: 'asc' }
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
    ])

    return NextResponse.json({ products, categories })
  } catch (err: any) {
    console.error("admin products GET error", err)
    return NextResponse.json({ error: "Erro ao carregar produtos" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  // Somente ADMIN
  const session = await getServerSession(authOptions)
  const role = (session as any)?.user?.role
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
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
      name: string
      slug: string
      description?: string
      priceCents: number
      stock: number
      categoryId?: string | null
      images?: string[]
    }

    if (!name || !slug) {
      return NextResponse.json({ error: "Nome e slug são obrigatórios" }, { status: 400 })
    }
    if (priceCents == null || isNaN(Number(priceCents)) || Number(priceCents) < 0) {
      return NextResponse.json({ error: "Preço inválido" }, { status: 400 })
    }
    if (stock == null || isNaN(Number(stock)) || Number(stock) < 0) {
      return NextResponse.json({ error: "Estoque inválido" }, { status: 400 })
    }

    // Normaliza imagens
    const imagesArr = Array.isArray(images)
      ? images.filter((s) => typeof s === "string" && s.trim().length > 0)
      : []

    // Evita slug duplicado
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Slug já está em uso" }, { status: 409 })
    }

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || "",
        priceCents: Number(priceCents),
        stock: Number(stock),
        images: imagesArr,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (err: any) {
    console.error("admin products POST error", err)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}