import NextAuth, { type NextAuthOptions } from "next-auth"
import { authOptions as base } from "@/src/lib/auth"

export const dynamic = "force-dynamic"

const handler = (req: any, res: any) => {
  console.log("--- NextAuth API Route ---")
  console.log("Request URL:", req.url)
  console.log("Request method:", req.method)
  return NextAuth(req, res, base)
}

export { handler as GET, handler as POST }