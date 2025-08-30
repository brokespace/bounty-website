
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            // Generate random username
            const randomUsername = `user_${Math.random().toString(36).substring(2, 8)}`
            
            await prisma.user.create({
              data: {
                email: user.email,
                username: randomUsername,
                isActive: true,
                isAdmin: false
              }
            })
          }
          return true
        } catch (error) {
          console.error('Error creating user:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.username = user.username
        token.isActive = user.isActive
        token.isAdmin = user.isAdmin
        token.email = user.email
        token.walletAddress = user.walletAddress
      }
      return token
    },
    async session({ session, token }: any) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email }
        })
        
        session.user = {
          ...session.user,
          id: dbUser?.id || token.sub,
          username: dbUser?.username,
          email: dbUser?.email,
          walletAddress: dbUser?.walletAddress,
          isActive: dbUser?.isActive,
          isAdmin: dbUser?.isAdmin
        }
      } else {
        session.user = {
          ...session.user,
          id: token.sub,
          username: token.username,
          isActive: token.isActive,
          isAdmin: token.isAdmin
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
