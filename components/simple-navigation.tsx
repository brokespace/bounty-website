
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession, signOut } from 'next-auth/react'
import { Wallet, Plus, Trophy, User, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function SimpleNavigation() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-primary/20 glass-effect shadow-lg shadow-primary/10">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 animate-glow">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
              BountyHunter
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </header>
    )
  }

  const navigationItems = [
    { href: '/bounties', label: 'Bounties', icon: Trophy },
    ...(session?.user?.isAdmin ? [{ href: '/create', label: 'Create Bounty', icon: Plus }] : []),
    ...(session ? [{ href: '/dashboard', label: 'Dashboard', icon: User }] : [])
  ]

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-primary/20 glass-effect shadow-lg shadow-primary/10"
    >
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 animate-glow">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
              BountyHunter
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Menu / Auth */}
        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <span>@{session.user.username || 'Hunter'}</span>
              </div>
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {(session.user?.username?.[0] || session.user?.hotkey?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="hover:text-primary transition-all duration-300 hover:scale-105">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300 border border-primary/50">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-primary/20 glass-effect"
        >
          <div className="container mx-auto max-w-6xl px-4 py-2 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            
            {!session && (
              <>
                <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            {session && (
              <Button
                variant="ghost"
                onClick={() => {
                  handleSignOut()
                  setIsMenuOpen(false)
                }}
                className="w-full justify-start gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
