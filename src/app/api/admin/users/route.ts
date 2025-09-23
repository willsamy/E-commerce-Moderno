import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== "ADMIN") return null
  return session
}

// GET /api/admin/users?q=&page=&perPage=
// Lista usuários com busca (nome/email), paginação e ordenação por createdAt desc
export async function GET(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const perPage = Math.min(50, Math.max(5, Number(searchParams.get("perPage") ?? "10") || 10))

  let where: Prisma.UserWhereInput | undefined = undefined
  if (q.length > 0) {
    where = {
      OR: [
        { name: { contains: q, mode: "insensitive" } as any },
        { email: { contains: q, mode: "insensitive" } as any },
      ],
    }
  }

  try {
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ])

    const pages = Math.max(1, Math.ceil(total / perPage))

    return NextResponse.json({
      items: users,
      total,
      page,
      perPage,
      pages,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Erro" }, { status: 500 })
  }
}