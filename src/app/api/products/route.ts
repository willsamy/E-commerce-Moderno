import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") || "1")
  const pageSize = Math.min(Number(searchParams.get("pageSize") || "12"), 50)
  const q = searchParams.get("q")?.trim()
  const category = searchParams.get("category")?.trim()

  const where: any = { active: true }
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }]
  if (category) where.category = { slug: category }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
  ])

  return NextResponse.json({
    page,
    pageSize,
    total,
    pages: Math.ceil(total / pageSize),
    items,
  })
}