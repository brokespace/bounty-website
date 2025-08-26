
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface BountyDetailPageProps {
  params: { id: string }
  searchParams: { view?: string }
}

export default async function BountyDetailPage({ params, searchParams }: BountyDetailPageProps) {
  const session = await getServerSession(authOptions)
  
  // Fetch bounty data to determine ownership
  let bountyData = null
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/bounties/${params.id}`)
    if (response.ok) {
      bountyData = await response.json()
    }
  } catch (error) {
    console.error('Error fetching bounty data:', error)
  }

  const isOwner = session?.user?.id === bountyData?.creator?.id
  const view = searchParams.view

  // If no view specified, redirect to public view (default for all users)
  if (!view) {
    redirect(`/bounties/${params.id}/public`)
  }

  // Handle view-specific access control
  if (view === 'admin') {
    if (!session?.user?.id) {
      redirect('/auth/signin')
    }
    if (!isOwner) {
      redirect(`/bounties/${params.id}/public`)
    }
  }
  
  if (view === 'user' && !session?.user?.id) {
    redirect('/auth/signin')
  }

  // This shouldn't be reached, but just in case
  redirect(`/bounties/${params.id}/public`)
}
