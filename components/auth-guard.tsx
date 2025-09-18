'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireWallet?: boolean
  requireTOS?: boolean
}

export function AuthGuard({ children, requireWallet = true, requireTOS = true }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'loading') return

    // If not authenticated, redirect to sign in with current path as callback
    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(pathname)
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`)
      return
    }

    // Skip checks for auth pages and TOS page
    if (pathname.startsWith('/auth/') || pathname === '/tos') {
      return
    }

    if (session?.user) {
      // Check TOS acceptance first
      if (requireTOS && session.user.acceptedTos === false) {
        router.push('/tos?required=true')
        return
      }

      // Then check wallet address (only if TOS is accepted or not required)
      // if (requireWallet && (!session.user.walletAddress || session.user.walletAddress.trim() === '')) {
      //   router.push('/profile?newUser=true')
      //   return
      // }
    }
  }, [session, status, router, pathname, requireWallet, requireTOS])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  // Don't render children if redirecting
  if (status === 'unauthenticated') {
    return null
  }

  // Don't render if TOS not accepted and required (unless on auth or TOS pages)
  if (requireTOS && 
      session?.user?.acceptedTos === false && 
      !pathname.startsWith('/auth/') && 
      pathname !== '/tos') {
    return null
  }

  // Don't render if wallet not set and required (unless on auth, TOS, or profile pages)
  // if (requireWallet && 
  //     (!session?.user?.walletAddress || session.user.walletAddress.trim() === '') &&
  //     !pathname.startsWith('/auth/') && 
  //     pathname !== '/tos' && 
  //     pathname !== '/profile') {
  //   return null
  // }

  return <>{children}</>
}