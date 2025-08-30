
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
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
  )
}
