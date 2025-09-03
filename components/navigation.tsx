
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from 'next-auth/react'
import { Wallet, Plus, Trophy, User, LogOut, Menu, X, Lightbulb, Settings, Target, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const navigationItems = [
    { href: '/bounties', label: 'Bounties', icon: Trophy },
    { href: '/milestones', label: 'Roadmap', icon: Target },
    ...(session?.user?.isAdmin ? [{ href: '/create', label: 'Create Bounty', icon: Plus }] : []),
    ...(session && !session.user?.isAdmin ? [{ href: '/suggest-bounty', label: 'Suggest Bounty', icon: Lightbulb }] : []),
    ...(session ? [{ href: '/dashboard', label: 'Dashboard', icon: User }] : [])
  ]

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}
    >
      <div className="container mx-auto max-w-7xl flex h-16 items-center px-4">
        {/* Logo - always on the far left */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <Wallet className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                BountyHunter
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Menu / Auth */}
        <div className="flex items-center gap-2 ml-auto">
          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {(session.user?.username?.[0] || session.user?.email?.[0] || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.username || 'Hunter'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem asChild>
                  <Link href="/milestones" className="flex items-center gap-2 cursor-pointer">
                    <Target className="h-4 w-4" />
                    <span>Roadmap</span>
                  </Link> */}
                {/* </DropdownMenuItem> */}
                {session.user?.isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/suggested-bounties" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Manage Suggestions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/scoring-jobs" className="flex items-center gap-2 cursor-pointer">
                        <Activity className="h-4 w-4" />
                        <span>Scoring Jobs</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
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
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur"
        >
          <div className="container mx-auto max-w-7xl px-4 py-2 space-y-1">
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
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
