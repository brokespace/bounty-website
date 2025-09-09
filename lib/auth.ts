
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
            
            // Mark this as a new user for later redirect
            user.isNewUser = true
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
        token.isNewUser = user.isNewUser
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
    },
    async redirect({ url, baseUrl, token }: any) {
      // If user is new and doesn't have a wallet, redirect to profile setup
      if (token?.isNewUser) {
        return `${baseUrl}/profile?newUser=true`
      }
      
      // If url is provided and relative, use it
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // If url is from the same host, use it
      if (new URL(url).origin === baseUrl) return url
      // Otherwise redirect to bounties
      return `${baseUrl}/bounties`
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
