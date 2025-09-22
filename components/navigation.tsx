
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Wallet, Plus, Trophy, User, LogOut, Menu, X, Lightbulb, Settings, Target, Activity, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const navigationItems = [
    { href: '/bounties', label: 'Bounties', icon: Trophy },
    { href: '/network', label: 'Network Status', icon: Activity },
    { href: '/faq', label: 'FAQ', icon: HelpCircle },
    // { href: '/milestones', label: 'Roadmap', icon: Target },
    ...(session?.user?.isAdmin ? [
      { href: '/create', label: 'Create Bounty', icon: Plus },
    ] : []),
    // ...(session && !session.user?.isAdmin ? [{ href: '/suggest-bounty', label: 'Suggest Bounty', icon: Lightbulb }] : []),
    ...(session ? [{ href: '/dashboard', label: 'Dashboard', icon: User }] : [])
  ]

  const isActiveRoute = (href: string) => pathname === href

  return (
    <>
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className || ''}`}
    >

      {/* Main navigation container using CSS Grid for perfect alignment */}
      <div className="container mx-auto max-w-full px-4 h-16 grid grid-cols-3 items-center">
        
        {/* Logo Section - Far Left */}
        <div className="flex items-center justify-start">
          <Link href="/" className="group flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Image 
                  src="/favicon.png" 
                  alt="AIBoards Logo" 
                  width={28} 
                  height={28} 
                  className="drop-shadow-sm"
                />
              </div>
              <span className="font-bold text-xl text-primary tracking-tight whitespace-nowrap">
                AIBoards
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Navigation Items - Center Column (perfectly centered) */}
        <nav className="hidden md:flex items-center justify-center">
          <div className="flex items-center gap-1 p-1 rounded-full bg-muted/30 border border-border/50">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-full font-medium transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                          : 'hover:bg-primary/10 hover:text-primary'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </Button>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Menu/Auth - Right Column */}
        <div className="flex items-center justify-end gap-3">
          {status === 'loading' ? (
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-9 w-9 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full"
            />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-muted/80">
                    <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-bold text-sm">
                        {(session.user?.username?.[0] || session.user?.email?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end" sideOffset={5}>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold leading-none">
                      {session.user?.username || 'Hunter'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard" className="flex items-center gap-3 p-2 rounded-md">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center gap-3 p-2 rounded-md">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>

                {session.user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin/suggested-bounties" className="flex items-center gap-3 p-2 rounded-md">
                        <Lightbulb className="h-4 w-4 text-muted-foreground" />
                        <span>Manage Suggestions</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin/scoring-jobs" className="flex items-center gap-3 p-2 rounded-md">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span>Scoring Jobs</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-2 rounded-md cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="hover:bg-muted/80">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg shadow-primary/25">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 hover:bg-muted/80"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.div>
          </Button>
        </div>
      </div>

      {/* Enhanced Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur shadow-lg"
          >
            <div className="container mx-auto max-w-7xl px-4 py-4 space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button 
                        variant={isActive ? "default" : "ghost"}
                        className={`
                          w-full justify-start gap-3 h-11 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : 'hover:bg-muted/80'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Button>
                    </Link>
                  </motion.div>
                )
              })}
              
              {!session && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navigationItems.length * 0.05 }}
                  className="pt-4 border-t border-border/40 space-y-2"
                >
                  <Link href="/auth/signin" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start h-11 rounded-lg">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full justify-start h-11 rounded-lg bg-gradient-to-r from-primary to-blue-600">
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  )
}
