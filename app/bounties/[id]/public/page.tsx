import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SimpleNavigation } from '@/components/simple-navigation'
import { PublicBountyClient } from '../_components/public-bounty-client'

interface PublicBountyPageProps {
  params: { id: string }
}

export default async function PublicBountyPage({ params }: PublicBountyPageProps) {
  const session = await getServerSession(authOptions)
  
  // Bounty data will be loaded client-side
  const bounty = { id: params.id, loading: true }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <SimpleNavigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <PublicBountyClient 
          bounty={bounty} 
          user={session?.user}
        />
      </main>
    </div>
  )
}