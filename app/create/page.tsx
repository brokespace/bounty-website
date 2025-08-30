
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { CreateBountyClient } from './_components/create-bounty-client'

export default async function CreateBountyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  if (!session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Navigation />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <CreateBountyClient user={session.user} />
      </main>
    </div>
  )
}
