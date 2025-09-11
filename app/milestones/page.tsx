'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Plus,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string | null
  completed: boolean
  completedAt: string | null
  isPublic: boolean
}

export default function MilestonesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: ''
  })

  useEffect(() => {
    fetchMilestones()
  }, [])

  const fetchMilestones = async () => {
    try {
      const response = await fetch('/api/milestones')
      if (response.ok) {
        const data = await response.json()
        setMilestones(data)
      }
    } catch (error) {
      console.error('Error fetching milestones:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/milestones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create milestone')
      }

      toast.success('Milestone created successfully!')
      setFormData({ title: '', description: '', targetDate: '' })
      setIsDialogOpen(false)
      fetchMilestones()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create milestone')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      })

      if (response.ok) {
        toast.success(completed ? 'Milestone completed!' : 'Milestone reopened')
        fetchMilestones()
      } else {
        throw new Error('Failed to update milestone')
      }
    } catch (error) {
      toast.error('Failed to update milestone')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Product Roadmap
            </h1>
            <p className="text-lg text-muted-foreground">
              Track our progress and upcoming features for AIBoards
            </p>
          </div>

          {session?.user?.isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Milestone</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Milestone title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what needs to be accomplished..."
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    name="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Milestone'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Milestones List */}
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
                <p className="text-muted-foreground">
                  Stay tuned for upcoming product milestones and feature releases.
                </p>
              </CardContent>
            </Card>
          ) : (
            milestones.map((milestone) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`transition-all ${milestone.completed ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {session?.user?.isAdmin ? (
                          <Checkbox
                            checked={milestone.completed}
                            onCheckedChange={(checked) => 
                              toggleMilestone(milestone.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                        ) : (
                          <div className="mt-1">
                            {milestone.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          <CardTitle className={`text-lg ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {milestone.title}
                          </CardTitle>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {milestone.completed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className={`text-sm mb-3 ${milestone.completed ? 'text-muted-foreground' : ''}`}>
                      {milestone.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {milestone.targetDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Target: {format(new Date(milestone.targetDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      {milestone.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Completed: {format(new Date(milestone.completedAt), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}