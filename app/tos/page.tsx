'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function TOSContent() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRequired = searchParams.get('required') === 'true'
  const [hasAccepted, setHasAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleAcceptTOS = async () => {
    if (!hasAccepted) {
      toast.error('Please read and accept the Terms of Service')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/accept-tos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept Terms of Service')
      }

      // Update the session with new TOS acceptance
      await update({
        ...session,
        user: {
          ...session?.user,
          acceptedTos: true,
          tosAcceptedAt: new Date()
        }
      })

      toast.success('Terms of Service accepted successfully!')
      
      // Redirect based on user state
      if (!session?.user?.walletAddress) {
        router.push('/profile?newUser=true')
      } else {
        router.push('/bounties')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept Terms of Service')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-6">
          {!isRequired ? (
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-muted-foreground/50">
              <FileText className="h-4 w-4" />
              Accept Terms of Service to continue
            </div>
          )}
        </div>

        <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Terms of Service
              </CardTitle>
              <CardDescription>
                Please read and accept our Terms of Service to continue using the platform
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/20">
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold text-base">AIBoards Terms of Service</h3>
                
                <p>
                  <strong>1. Acceptance of Terms</strong><br />
                  By accessing and using AIBoards, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <p>
                  <strong>2. Use License</strong><br />
                  Permission is granted to temporarily use AIBoards for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                </p>

                <p>
                  <strong>3. Bounty Participation</strong><br />
                  By participating in bounties, you agree that your submissions may be evaluated by automated systems and human reviewers. All submissions must be original work or properly attributed.
                </p>

                <p>
                  <strong>4. Prohibited Uses</strong><br />
                  You may not use this platform for any unlawful purpose or to solicit others to perform unlawful acts. Spam, harassment, and malicious content are strictly prohibited. <br />
                  <strong>4.1. DDoS and Abuse</strong><br />
                  You may not attempt to disrupt, overload, or attack the platform or its users, including but not limited to denial-of-service (DDoS) attacks. Accounts found engaging in such activity may be banned without notice.
                </p>

                <p>
                  <strong>5. Account Termination</strong><br />
                  Your account may be suspended or terminated at any time, for any reason or for no reason, at the sole discretion of the platform administrators. No explanation or warning is required.
                </p>

                <p>
                  <strong>6. Privacy Policy</strong><br />
                  Your privacy is important to us. We collect only necessary information to provide our services and never share personal data with third parties without consent.
                </p>

                <p>
                  <strong>7. Disclaimer and Limitation of Liability</strong><br />
                  The materials on AIBoards are provided on an 'as is' basis. AIBoards and BitAgent make no warranties, expressed or implied, and hereby disclaim all other warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement. <br />
                  BitAgent is not liable for any damages, losses, or claims of any kind, including but not limited to financial loss, regulatory or legal issues (including SEC or other market regulations), loss of data, or any other consequence arising from the use or inability to use the platform or its services.
                </p>

                <p>
                  <strong>8. Rewards and Dollar Value</strong><br />
                  Any dollar value comparisons or references are for informational purposes only. The actual value to be awarded is in alpha tokens, and the value of these tokens may fluctuate. Dollar value estimates are subject to change and are not guaranteed.
                </p>

                <p>
                  <strong>9. Leaderboard and Competition Restrictions</strong><br />
                  Users agree not to compete in submissions to any leaderboard or bounty in which the Bounty Hunter is actively competing.
                </p>

                <p>
                  <strong>10. Changes to Terms</strong><br />
                  AIBoards may revise these terms of service at any time without notice. By using this platform, you agree to be bound by the current version of these terms.
                </p>

                <p className="text-xs text-muted-foreground mt-4">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </ScrollArea>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="accept-tos" 
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked === true)}
              />
              <label
                htmlFor="accept-tos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the Terms of Service
              </label>
            </div>

            <Button 
              onClick={handleAcceptTOS}
              className="w-full" 
              disabled={!hasAccepted || isLoading}
            >
              {isLoading ? 'Accepting...' : 'Accept Terms of Service & Continue'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function TOSPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <TOSContent />
    </Suspense>
  )
}