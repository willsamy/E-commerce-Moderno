import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== "ADMIN") {
    return null
  }
  return session
}

// GET /api/admin/orders/[id]
export async function GET(
  _req: Request,
  ctx: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = ctx.params
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 })
  }
}

// PUT /api/admin/orders/[id]  body: { status?: "PENDING" | "PAID" | "CANCELED" }
export async function PUT(
  req: Request,
  ctx: { params: { id: string } }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = ctx.params
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const allowed = ["PENDING", "PAID", "CANCELED"] as const
  let data: any = {}

  if (body?.status) {
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    data.status = body.status
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No changes" }, { status: 400 })
  }

  try {
    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        user: true,
        items: { include: { product: true } },
      },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 })
  }
}