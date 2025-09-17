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
                <div>
                  <h4 className="font-semibold mt-4 mb-1">Acceptance</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      By creating an account, logging in, submitting any artifact (code, models, data, documentation), or clicking “I Agree,” you accept these Terms on behalf of yourself and any organization you represent (“You”).
                    </li>
                    <li>
                      “BitAgent,” “Bounty Hunter,” and related services (the “Services”) are operated by BitAgent (and affiliates/contractors).
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Definitions</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      “Submission” means any model, weights, fine-tune, code, prompts, handler, documentation, data, logs, or other materials You provide.
                    </li>
                    <li>
                      “Alpha” means the token or unit used for rewards within Bounty Hunter.
                    </li>
                    <li>
                      “Leaderboard(s)” means any third-party benchmark or ranking where Bounty Hunter is actively competing or publishing results.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Ownership &amp; License Grant</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      You retain ownership of Your Submission, subject to third-party licenses that may apply to any base model or dataset You used.
                    </li>
                    <li>
                      You grant BitAgent a <strong>non-exclusive, worldwide, perpetual, irrevocable, royalty-free, sublicensable license</strong> to <strong>use, host, store, copy, test, evaluate, display, perform, and create derivative works from</strong> Your Submission <strong>as needed for business operations</strong>, including:
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li>running automated and manual evaluations and graders,</li>
                        <li>deploying limited demos/tests for reliability, safety, and compatibility checks,</li>
                        <li>sharing artifacts internally and with service providers strictly for evaluation, security, and operations,</li>
                        <li>publicizing results, writing case studies, and marketing/PR (including naming You as a participant and describing Your Submission’s performance),</li>
                        <li>noting Bounty Hunter’s and Bittensor’s role in the creation/evaluation context of Your Submission for downstream needs.</li>
                      </ul>
                    </li>
                    <li>
                      You acknowledge that <strong>Submission alone does not guarantee any payment or consideration</strong>.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Representations, Warranties, and Licensing</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      You represent and warrant that You:
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li>have the <strong>necessary rights and permissions</strong> to submit the artifacts and to grant the license above,</li>
                        <li>have <strong>adhered to all licensing requirements</strong> for any derivative products You create (e.g., base checkpoints, datasets, code),</li>
                        <li>will not include <strong>confidential, proprietary, or personal data</strong> You do not have the right to share,</li>
                        <li>understand that <strong>submissions may be similar</strong> or of “variable difference” to other artifacts that exist or are later produced by others.</li>
                      </ul>
                    </li>
                    <li>
                      If Your Submission requires third-party licenses or attributions (e.g., Apache-2.0), You will <strong>include and honor</strong> those terms.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Use of the Services; Prohibited Conduct</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      You agree not to misuse the Services, including by:
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li>launching or attempting <strong>DDoS</strong>, stress testing, scraping beyond rate limits, or other abusive behaviors.</li>
                        <li>submitting malware or content designed to <strong>disrupt</strong> the Services or harm other users.</li>
                      </ul>
                    </li>
                    <li>
                      BitAgent may <strong>suspend or terminate</strong> Your account <strong>at any time, for any reason or no reason</strong>, with or without notice.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Competitive Participation</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      You agree <strong>not to submit the same or substantially similar work</strong> to <strong>leaderboards where Bounty Hunter is actively competing</strong> during the relevant bounty/verification window, or as otherwise specified in a bounty’s rules. (Scope and duration may be further defined in the bounty brief or the aiboards flow.)
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Disclaimers; No Advice</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      The Services and all outputs are provided <strong>“AS IS” and “AS AVAILABLE.”</strong> BitAgent disclaims <strong>all warranties</strong>, express or implied.
                    </li>
                    <li>
                      BitAgent does <strong>not</strong> provide financial, investment, legal, or regulatory advice. Participation is at Your own risk.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Limitation of Liability</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      To the maximum extent permitted by law, <strong>BitAgent is not liable for any damages of any kind</strong>, including without limitation:
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li>financial loss, trading/market losses, opportunity cost,</li>
                        <li><strong>SEC/regulatory</strong> actions or consequences,</li>
                        <li>loss of data, reputational harm, consequential or incidental damages,</li>
                        <li>service interruptions, bugs, or vulnerabilities, whether foreseeable or not.</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Token/Value Disclaimers</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Dollar value comparisons are illustrative only</strong> and subject to change. <strong>Payouts are denominated in Alpha</strong>, whose <strong>market value may fluctuate</strong> substantially.
                    </li>
                    <li>
                      Any stated “jackpot” or “bounty” amounts may reflect future or annuity-style payments and are <strong>not guaranteed</strong>.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Submission &amp; Access</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      You must allow BitAgent and designated graders <strong>access</strong> to any private repositories or artifacts strictly for verification and payout operations.
                    </li>
                    <li>
                      A submission <strong>disclaimer</strong> applies at the time of submission confirming: You own or have the rights to submit; no guarantee of payout; and You accept the evaluation/payout terms in effect at that time.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Fees; Payments; Taxes</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Grading, evaluation, network, and service fees</strong> may be <strong>deducted</strong> from any payout. Payment <strong>structures and fees</strong> are as described in the <strong>Payout &amp; Fee Structure Terms</strong>.
                    </li>
                    <li>
                      You are responsible for <strong>taxes</strong>, reporting, and compliance in Your jurisdiction. BitAgent may require <strong>identity or tax verification</strong> to process payouts.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Account Actions; Enforcement</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      BitAgent may <strong>ban</strong> accounts for DDoS or other abuse and may <strong>limit access</strong> at its discretion to preserve network integrity.
                    </li>
                    <li>
                      BitAgent may <strong>remove, re-evaluate, or disqualify</strong> any Submission for suspected violations or anomalies.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Updates to Terms</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      BitAgent may update these Terms from time to time. <strong>Continued use</strong> of the Services after changes are posted constitutes acceptance of the updated Terms.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4 mb-1">Miscellaneous</h4>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>
                      <strong>Governing law, venue, and dispute resolution</strong> to be supplied by counsel.
                    </li>
                    <li>
                      If any provision is unenforceable, the remainder remains in effect.
                    </li>
                    <li>
                      These Terms, together with any bounty-specific rules, form the entire agreement regarding the Services and Submissions.
                    </li>
                  </ul>
                </div>

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
                I have read and agree to the Terms of Service &amp; Submission Agreement
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