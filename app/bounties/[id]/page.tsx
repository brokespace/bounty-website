
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Navigation } from '@/components/navigation'
import { UnifiedBountyClient } from './_components/unified-bounty-client'

interface BountyPageProps {
  params: { id: string }
}

export default async function BountyPage({ params }: BountyPageProps) {
  const session = await getServerSession(authOptions)
  
  // Fetch bounty data to determine permissions
  let bountyData = null
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bounties/${params.id}`, {
      cache: 'no-store'
    })
    if (response.ok) {
      bountyData = await response.json()
    }
  } catch (error) {
    console.error('Error fetching bounty data:', error)
  }
  
  // Determine user permissions
  const isOwner = session?.user?.id === bountyData?.creator?.id
  const isAdmin = session?.user?.isAdmin
  const isAuthenticated = !!session?.user?.id
  
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

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-purple/5 rounded-full blur-xl animate-pulse" />
      </div>
      
      <div className="relative z-10">
        <Navigation />
        <main className="container mx-auto max-w-6xl px-4 py-8">
          <UnifiedBountyClient 
            bounty={{ id: params.id, ...bountyData }}
            user={session?.user}
            isOwner={isOwner}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
          />
        </main>
      </div>
    </div>
  )
}
