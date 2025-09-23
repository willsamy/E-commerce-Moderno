import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { hashPassword } from "@/src/lib/hash"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null) as { name?: string; email?: string; password?: string } | null
    if (!body?.name || !body?.email || !body?.password) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const email = body.email.toLowerCase().trim()
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 })
    }

    const passwordHash = await hashPassword(body.password)
    await prisma.user.create({
      data: {
        name: body.name.trim(),
        email,
        password: passwordHash,
        role: "USER",
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Erro ao registrar" }, { status: 500 })
  }
}