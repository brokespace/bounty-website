
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SimpleNavigation } from '@/components/simple-navigation'
import { HomePageClient } from './_components/homepage-client'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  // If user is logged in, redirect to bounties
  // if (session) {
  //   redirect('/bounties')
  // }

  return (
    <div className="min-h-screen bg-animated relative overflow-x-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-gradient-shift" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
      
      <div className="relative z-10">
        <SimpleNavigation />
        <HomePageClient />
      </div>
    </div>
  )
}
