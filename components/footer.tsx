'use client'

import { motion } from 'framer-motion'
import { BugReportForm } from './bug-report-form'
import { Bug, Heart } from 'lucide-react'
import Link from 'next/link'

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={`border-t border-border/40 bg-background/95 backdrop-blur mt-auto ${className || ''}`}
    >
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left side - Footer info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {/* Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by AIBoards Team */}
            </div>
            <div className="text-xs">
              {/* © 2025 AIBoards. All rights reserved. */}
            </div>
          </div>
          
          {/* Right side - Links and Bug report button */}
          <div className="flex items-center gap-4">
            <Link 
              href="/tos"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <BugReportForm 
              trigger={
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
                  <Bug className="h-4 w-4" />
                  Report Bug
                </button>
              }
            />
          </div>
        </div>
      </div>
    </motion.footer>
  )
}