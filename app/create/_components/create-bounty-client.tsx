
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Plus, Trophy, Target, Users, Clock, Coins, Link2, FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CreateBountyClientProps {
  user: any
}

export function CreateBountyClient({ user }: CreateBountyClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    alphaReward: '',
    alphaRewardCap: '',
    rewardDistribution: 'ALL_AT_ONCE',
    winningSpots: '1',
    deadline: '',
    hasDeadline: false,
    acceptedSubmissionTypes: ['FILE'] as string[]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.requirements) {
        toast.error('Please fill in all required fields')
        return
      }

      if (parseFloat(formData.alphaReward) <= 0 || parseFloat(formData.alphaRewardCap) <= 0) {
        toast.error('Reward amounts must be greater than 0')
        return
      }

      if (parseFloat(formData.alphaReward) > parseFloat(formData.alphaRewardCap)) {
        toast.error('Current reward cannot exceed reward cap')
        return
      }

      if (parseInt(formData.winningSpots) < 1) {
        toast.error('Must have at least 1 winning spot')
        return
      }

      if (formData.acceptedSubmissionTypes.length === 0) {
        toast.error('Must select at least one submission type')
        return
      }

      const submitData = {
        ...formData,
        deadline: formData.hasDeadline && formData.deadline ? formData.deadline : null,
        winningSpots: parseInt(formData.winningSpots)
      }

      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bounty')
      }

      toast.success('Bounty created successfully!')
      router.push(`/bounties/${data.bounty.id}`)

    } catch (error: any) {
      toast.error(error.message || 'Failed to create bounty')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmissionTypeChange = (type: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptedSubmissionTypes: checked
        ? [...prev.acceptedSubmissionTypes, type]
        : prev.acceptedSubmissionTypes.filter(t => t !== type)
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>

      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-fit p-3 bg-primary/10 rounded-full mb-4"
        >
          <Plus className="h-8 w-8 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Create New <span className="text-primary">Bounty</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Define your bounty requirements and reward structure to attract the best hunters
        </p>
      </div>

      <Card className="border-muted/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Bounty Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Bounty Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, descriptive title for your bounty"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of what you're looking for..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">
                  Requirements <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="requirements"
                  placeholder="Specify the technical requirements, skills needed, deliverables, etc..."
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Reward Configuration */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alphaReward" className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  Current Reward (α) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="alphaReward"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="100.00"
                  value={formData.alphaReward}
                  onChange={(e) => handleInputChange('alphaReward', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alphaRewardCap" className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-500" />
                  Reward Cap (α) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="alphaRewardCap"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  value={formData.alphaRewardCap}
                  onChange={(e) => handleInputChange('alphaRewardCap', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rewardDistribution">Reward Distribution</Label>
                <Select
                  value={formData.rewardDistribution}
                  onValueChange={(value) => handleInputChange('rewardDistribution', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_AT_ONCE">60% All at Once</SelectItem>
                    <SelectItem value="OVER_TIME">100% Over Time</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {formData.rewardDistribution === 'ALL_AT_ONCE' 
                    ? 'Winners get 60% of reward immediately' 
                    : 'Winners get 100% of reward distributed over time'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="winningSpots" className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  Winning Spots
                </Label>
                <Input
                  id="winningSpots"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.winningSpots}
                  onChange={(e) => handleInputChange('winningSpots', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of winners who will receive rewards
                </p>
              </div>
            </div>

            {/* Submission Types */}
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Accepted Submission Types <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select what types of submissions you'll accept for this bounty
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="submission-url"
                      checked={formData.acceptedSubmissionTypes.includes('URL')}
                      onCheckedChange={(checked) => handleSubmissionTypeChange('URL', checked as boolean)}
                    />
                    <Label htmlFor="submission-url" className="flex items-center gap-2 cursor-pointer">
                      <Link2 className="h-4 w-4 text-blue-500" />
                      URLs
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="submission-file"
                      checked={formData.acceptedSubmissionTypes.includes('FILE')}
                      onCheckedChange={(checked) => handleSubmissionTypeChange('FILE', checked as boolean)}
                    />
                    <Label htmlFor="submission-file" className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4 text-green-500" />
                      File Uploads
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="submission-text"
                      checked={formData.acceptedSubmissionTypes.includes('TEXT')}
                      onCheckedChange={(checked) => handleSubmissionTypeChange('TEXT', checked as boolean)}
                    />
                    <Label htmlFor="submission-text" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-purple-500" />
                      Text Content
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="submission-mixed"
                      checked={formData.acceptedSubmissionTypes.includes('MIXED')}
                      onCheckedChange={(checked) => handleSubmissionTypeChange('MIXED', checked as boolean)}
                    />
                    <Label htmlFor="submission-mixed" className="flex items-center gap-2 cursor-pointer">
                      <Trophy className="h-4 w-4 text-orange-500" />
                      Mixed (All Types)
                    </Label>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>URLs:</strong> Links to GitHub repos, live demos, documentation, etc.</p>
                  <p><strong>File Uploads:</strong> Documents, images, videos, code files, archives</p>
                  <p><strong>Text Content:</strong> Written explanations, code snippets, specifications</p>
                  <p><strong>Mixed:</strong> Combination of URLs, files, and text in one submission</p>
                </div>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hasDeadline"
                  checked={formData.hasDeadline}
                  onCheckedChange={(checked) => handleInputChange('hasDeadline', checked)}
                />
                <Label htmlFor="hasDeadline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Set a deadline
                </Label>
              </div>

              {formData.hasDeadline && (
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Bounty'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
