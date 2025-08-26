import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SimpleNavigation } from '@/components/simple-navigation'
import { UserBountyClient } from '../_components/user-bounty-client'

interface UserBountyPageProps {
  params: { id: string }
}

export default async function UserBountyPage({ params }: UserBountyPageProps) {
  const session = await getServerSession(authOptions)
  
  // Redirect to sign in if not authenticated
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }
  
  // Bounty data will be loaded client-side if needed
  const bounty = { id: params.id, loading: true }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <SimpleNavigation />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <UserBountyClient 
          bounty={bounty} 
          user={session?.user}
        />
      </main>
    </div>
  )
}