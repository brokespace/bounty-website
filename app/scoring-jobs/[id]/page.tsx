import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { notFound, redirect } from 'next/navigation'
import { ScoringJobDetailClient } from './_components/scoring-job-detail-client'

const prisma = new PrismaClient()

interface Props {
  params: { id: string }
}

export default async function ScoringJobPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/scoring-jobs/${params.id}`)
  }

  const scoringJob = await prisma.scoringJob.findUnique({
    where: { id: params.id },
    include: {
      submission: {
        include: {
          bounty: {
            select: { 
              title: true, 
              id: true, 
              creatorId: true,
              info: true,
              problem: true,
              requirements: true,
              tasks: true
            }
          },
          submitter: {
            select: { id: true, username: true, walletAddress: true }
          },
          files: true
        }
      },
      screener: true,
      scoringTasks: {
        include: {
          task: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  })

  if (!scoringJob) {
    notFound()
  }

  const isAdmin = session.user.isAdmin
  const isSubmitter = scoringJob.submission.submitterId === session.user.id
  const isBountyCreator = scoringJob.submission.bounty.creatorId === session.user.id

  if (!isAdmin && !isSubmitter && !isBountyCreator) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6">
      <ScoringJobDetailClient 
        scoringJob={scoringJob}
        user={session.user}
        isAdmin={isAdmin}
        isSubmitter={isSubmitter}
        isBountyCreator={isBountyCreator}
      />
    </div>
  )
}