'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Wallet, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

function ProfileContent() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get('newUser') === 'true'
  const [formData, setFormData] = useState({
    username: '',
    walletAddress: '',
    walletNetwork: ''
  })
  const [showTOSWarning, setShowTOSWarning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setFormData({
        username: session.user.username || '',
        walletAddress: session.user.walletAddress || '',
        walletNetwork: session.user.walletNetwork || ''
      })
      // Check if user hasn't accepted TOS and show warning
      if (session.user.acceptedTos === false) {
        setShowTOSWarning(true)
      }
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if TOS needs to be accepted first
    if (session?.user?.acceptedTos === false) {
      toast.error('Please accept the Terms of Service first')
      router.push('/tos?required=true')
      return
    }
    
    // Client-side validation for new users
    if (isNewUser && (!formData.walletAddress || formData.walletAddress.trim() === '')) {
      toast.error('Wallet address is required to complete your profile')
      return
    }
    
    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          isNewUser
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile')
      }

      // Update the session with new data
      await update({
        ...session,
        user: {
          ...session?.user,
          ...data.user
        }
      })

      toast.success('Profile updated successfully!')
      if (isNewUser) {
        router.push('/bounties')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleNetworkChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      walletNetwork: value
    }))
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Prevent new users from navigating away without wallet address
  useEffect(() => {
    if (isNewUser && (!formData.walletAddress || formData.walletAddress.trim() === '')) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = ''
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isNewUser, formData.walletAddress])

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          {isNewUser && (!formData.walletAddress || formData.walletAddress.trim() === '') ? (
            <div className="inline-flex items-center gap-2 text-muted-foreground/50 cursor-not-allowed">
              <ArrowLeft className="h-4 w-4" />
              Complete profile to continue
            </div>
          ) : (
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>

        {showTOSWarning && (
          <Card className="border-yellow-500/50 bg-yellow-50/50 backdrop-blur-sm mb-4">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Terms of Service Required</p>
                  <p className="text-xs text-yellow-700">You must accept our Terms of Service before updating your profile.</p>
                </div>
                <Link href="/tos?required=true">
                  <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                    Accept TOS
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-fit p-3 bg-primary/10 rounded-full">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                {isNewUser ? 'Complete Your Profile' : 'Profile Settings'}
              </CardTitle>
              <CardDescription>
                {isNewUser 
                  ? 'Please add your wallet address to start earning bounties'
                  : 'Update your username and wallet address'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletAddress">Wallet Address {isNewUser && <span className="text-red-500">*</span>}</Label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="walletAddress"
                    name="walletAddress"
                    type="text"
                    placeholder="Enter your wallet address"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    className="pl-10 font-mono text-sm"
                    required={isNewUser}
                  />
                </div>
                {isNewUser && (
                  <p className="text-xs text-muted-foreground">
                    Your wallet address is required to receive bounty rewards
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="walletNetwork">Wallet Network</Label>
                <Select value={formData.walletNetwork} onValueChange={handleNetworkChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select wallet network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="TAO">Bittensor (TAO)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the network your wallet address belongs to
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Note: If you select Bitcoin or Ethereum, network fees will be deducted from your payout.
                </p>
              </div>


              {session.user.email && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={session.user.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || (isNewUser && (!formData.walletAddress || formData.walletAddress.trim() === ''))}
              >
                {isLoading 
                  ? (isNewUser ? 'Completing Profile...' : 'Updating...') 
                  : (isNewUser ? 'Complete Profile & Continue' : 'Update Profile')
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}