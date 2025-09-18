
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { DashboardClient } from './_components/dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  // Empty initial data - will be loaded client-side
  const dashboardData = {
    user: session.user,
    stats: { totalBounties: 0, totalSubmissions: 0, totalSuggestedBounties: 0 },
    bounties: [],
    submissions: [],
    suggestedBounties: [],
    recentActivity: []
  }

  return (
    <AuthGuard requireWallet={true} requireTOS={true}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <Navigation />
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <DashboardClient 
            initialData={dashboardData}
            user={session.user}
          />
        </main>
      </div>
    </AuthGuard>
  )
}
