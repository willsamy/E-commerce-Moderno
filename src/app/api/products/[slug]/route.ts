import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type Params = { params: { slug: string } }

export async function GET(_req: Request, { params }: Params) {
  const { slug } = params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  }

  return NextResponse.json(product)
}