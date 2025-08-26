import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SimpleNavigation } from '@/components/simple-navigation'
import { BountyDetailClient } from '../_components/bounty-detail-client'

interface AdminBountyPageProps {
  params: { id: string }
}

export default async function AdminBountyPage({ params }: AdminBountyPageProps) {
  const session = await getServerSession(authOptions)
  
  // Redirect to sign in if not authenticated
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }
  
  // Fetch bounty data to verify ownership
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
    redirect('/bounties')
  }
  
  // Redirect if user is not the bounty creator
  if (!bountyData || session.user.id !== bountyData.creator?.id) {
    redirect(`/bounties/${params.id}/public`)
  }
  
  // Bounty data will be loaded client-side (but we already verified ownership)
  const bounty = { id: params.id, loading: true }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <SimpleNavigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <BountyDetailClient 
          bounty={bounty} 
          user={session?.user}
          isAdminView={true}
        />
      </main>
    </div>
  )
}