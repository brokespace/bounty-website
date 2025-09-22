import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">BountyHunter FAQ</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions about bounty hunting</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="register-hotkey">
                <AccordionTrigger>Do I need to register my hotkey to S20 to get incentive?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">No. This subnet only has <strong>Bounty rewards</strong>, no validator incentive.</p>
                  <p>Register on <strong>AIboards.io</strong> and upload your submissions.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bounty-rewards">
                <AccordionTrigger>How do I get bounty rewards?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>• Submit to BFCL or SWE-Bench through AIboards.</p>
                    <p>• Bounty is a payout for the <strong>top submission that meets the criteria</strong>.</p>
                    <p>• You can test locally using the leaderboard evaluator code before submitting.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="validator-grader-code">
                <AccordionTrigger>Is there validator/grader code available?</AccordionTrigger>
                <AccordionContent>
                  <p>Yes, each leaderboard has a <strong>repo</strong> with grader/screener code you can run.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="validator-participation">
                <AccordionTrigger>How do validators participate in leaderboards?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>• Validators <strong>opt in</strong> to specific leaderboards.</p>
                    <p>• They can download the screener code if they want to run it.</p>
                    <p>• Not forced to support heavy leaderboards with extreme hardware requirements.</p>
                    <p>• If they participate, they are <strong>eligible for extra rewards</strong>.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="benefits-vs-mining">
                <AccordionTrigger>What's the benefit of this vs direct mining emissions?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>• Simplifies payout infrastructure significantly.</p>
                    <p>• Allows <strong>anyone to participate</strong>, even outside of BitTensor.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payout-options">
                <AccordionTrigger>What are the payout options?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>• <strong>Lump sum</strong> = 65% of bounty.</p>
                    <p>• <strong>Annuity</strong> = 100% of bounty (over time).</p>
                    <p>• Payment supported in <strong>Bitcoin, Ethereum, or TAO</strong>.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}