import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ScoringJobsAdminClient } from './_components/scoring-jobs-admin-client'

export default async function ScoringJobsAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto p-6">
      <ScoringJobsAdminClient user={session.user} />
    </div>
  )
}