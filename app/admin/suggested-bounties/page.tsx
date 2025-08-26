import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SuggestedBountiesAdminClient } from './_components/suggested-bounties-admin-client'

export default async function AdminSuggestedBountiesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin/suggested-bounties')
  }

  if (!session.user.isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SuggestedBountiesAdminClient user={session.user} />
    </div>
  )
}