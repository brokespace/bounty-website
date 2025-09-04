import { Navigation } from '@/components/navigation'
import { NetworkClient } from './_components/network-client'

export default function ScreenersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Navigation />
      <NetworkClient />
    </div>
  )
}