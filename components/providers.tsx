
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Always wrap with SessionProvider to avoid useSession errors
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        forcedTheme={!mounted ? undefined : undefined}
      >
        <div className="min-h-screen bg-background">
          {children}
        </div>
        {mounted && <Toaster richColors position="top-right" />}
      </ThemeProvider>
    </SessionProvider>
  )
}
