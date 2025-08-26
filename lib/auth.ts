
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'crypto-auth',
      credentials: {
        hotkey: { label: 'Wallet Address', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.hotkey || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { hotkey: credentials.hotkey }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            hotkey: user.hotkey,
            username: user.username,
            isActive: user.isActive,
            isAdmin: user.isAdmin
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.hotkey = user.hotkey
        token.username = user.username
        token.isActive = user.isActive
        token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({ session, token }: any) {
      session.user = {
        ...session.user,
        id: token.sub,
        hotkey: token.hotkey,
        username: token.username,
        isActive: token.isActive,
        isAdmin: token.isAdmin
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
}
