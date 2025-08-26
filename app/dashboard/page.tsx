
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SimpleNavigation } from '@/components/simple-navigation'
import { DashboardClient } from './_components/dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Empty initial data - will be loaded client-side
  const dashboardData = {
    user: session.user,
    stats: { totalBounties: 0, totalSubmissions: 0 },
    bounties: [],
    submissions: [],
    recentActivity: []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <SimpleNavigation />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <DashboardClient 
          initialData={dashboardData}
          user={session.user}
        />
      </main>
    </div>
  )
}
