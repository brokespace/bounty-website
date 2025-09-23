import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SubmissionClient } from './_components/submission-client'

export default async function SubmissionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Suspense fallback={<div>Loading submission...</div>}>
        <SubmissionClient submissionId={params.id} user={session.user} />
      </Suspense>
    </div>
  )
}