import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/src/lib/prisma"
import { verifyPassword } from "@/src/lib/hash"

// Ajuste de paths: usar caminhos relativos baseados em tsconfig "baseUrl": "."
// Se seu tsconfig não define "@/*", manteremos caminhos relativos diretos:
let _prisma = prisma
let _verify = verifyPassword
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        console.log("--- Authorize ---")
        console.log("Credentials:", { email: credentials?.email })

        if (!credentials?.email || !credentials.password) {
          console.log("Authorize: Missing credentials")
          return null
        }

        const user = await _prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        console.log("Authorize: User found in DB:", !!user)

        if (!user || !user.password) {
          console.log("Authorize: User or password not found in DB")
          return null
        }

        const isValid = await _verify(credentials.password, user.password)
        console.log("Authorize: Password valid:", isValid)

        if (!isValid) {
          console.log("Authorize: Invalid password")
          return null
        }

        const result = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
        console.log("Authorize: Success, returning user:", result)
        return result
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role ?? "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).role = (token as any).role
      }
      return session
    },
  },
}
