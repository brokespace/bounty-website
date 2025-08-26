
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SimpleNavigation } from '@/components/simple-navigation'
import { HomePageClient } from './_components/homepage-client'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  // If user is logged in, redirect to bounties
  if (session) {
    redirect('/bounties')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SimpleNavigation />
      <HomePageClient />
    </div>
  )
}
