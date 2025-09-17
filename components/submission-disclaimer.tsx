'use client'

import { useState } from 'react'
import { AlertTriangle, FileText, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ReactMarkdown from 'react-markdown'

interface SubmissionDisclaimerProps {
  disclaimer: string
  onAccept: () => void
  onDecline: () => void
  isVisible: boolean
}

export function SubmissionDisclaimer({
  disclaimer,
  onAccept,
  onDecline,
  isVisible
}: SubmissionDisclaimerProps) {
  const [hasRead, setHasRead] = useState(false)
  const [hasAccepted, setHasAccepted] = useState(false)

  if (!isVisible) return null

  const handleAccept = () => {
    if (hasRead && hasAccepted) {
      onAccept()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg font-semibold">Submission Disclaimer</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDecline}
            className="h-8 w-8 p-0 hover:bg-destructive/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Please read the following disclaimer carefully before submitting to this bounty.
            </AlertDescription>
          </Alert>

          <div className="max-h-64 overflow-y-auto p-4 border rounded-lg bg-muted/50">
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 text-foreground">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2 text-foreground">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1 text-foreground">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 leading-relaxed text-sm">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-muted px-1 py-0.5 rounded font-mono text-xs">{children}</code>
                    ) : (
                      <pre className="bg-muted p-2 rounded overflow-x-auto mb-2">
                        <code className="font-mono text-xs">{children}</code>
                      </pre>
                    )
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/30 pl-3 my-2 italic text-muted-foreground bg-muted/30 py-1 rounded-r text-sm">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a href={href} className="text-primary hover:text-primary/80 underline text-sm" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                }}
              >
                {disclaimer}
              </ReactMarkdown>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disclaimer-read"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked === true)}
              />
              <label
                htmlFor="disclaimer-read"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I have read and understood the disclaimer above
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="disclaimer-accept"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked === true)}
                disabled={!hasRead}
              />
              <label
                htmlFor="disclaimer-accept"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the terms and conditions outlined in this disclaimer
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!hasRead || !hasAccepted}
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}