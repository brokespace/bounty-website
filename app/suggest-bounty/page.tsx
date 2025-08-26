import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SuggestBountyClient } from './_components/suggest-bounty-client'

export default async function SuggestBountyPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/suggest-bounty')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SuggestBountyClient user={session.user} />
    </div>
  )
}