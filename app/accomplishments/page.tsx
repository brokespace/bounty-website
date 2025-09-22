import { Navigation } from '@/components/navigation'
import { AccomplishmentsClient } from './_components/accomplishments-client'

export default function AccomplishmentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AccomplishmentsClient />
    </div>
  )
}