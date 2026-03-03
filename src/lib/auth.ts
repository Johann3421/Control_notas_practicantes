import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const email = parsed.data.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({
          where: { email },
          include: { internProfile: true },
        })
        if (!user?.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          internProfile: user.internProfile,
        } as never
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as never as { role: string }).role
        token.id = user.id!
        token.internId = (user as never as { internProfile?: { id: string } | null }).internProfile?.id ?? null
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as never
      session.user.id = token.id as string
      session.user.internId = token.internId as string | null
      return session
    },
  },
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  debug: false,
})
