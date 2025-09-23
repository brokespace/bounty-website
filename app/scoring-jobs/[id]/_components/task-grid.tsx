'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  Activity, 
  Target, 
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { TaskLogStream } from './task-log-stream'

interface Task {
  id: string
  task?: {
    name: string
    description: string
  }
  taskName?: string
  taskDescription?: string
  score?: number
  status?: string
  createdAt: string
  completedAt?: string
}

interface BountyTask {
  id: string
  name: string
  description: string
  createdAt: string
}

interface TaskGridProps {
  scoringJobId: string
  tasks: Task[]
  bountyTasks?: BountyTask[]
}

export function TaskGrid({ scoringJobId, tasks, bountyTasks }: TaskGridProps) {

  const getTaskName = (task: Task) => {
    return task.task?.name || task.taskName || 'Unknown Task'
  }

  const getTaskDescription = (task: Task) => {
    return task.task?.description || task.taskDescription || 'No description available'
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadgeColor = (score?: number) => {
    if (!score) return 'bg-gray-500'
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'NOT_STARTED': return 'bg-gray-500 text-white'
      case 'IN_PROGRESS': return 'bg-blue-500 text-white'
      case 'COMPLETED': return 'bg-green-500 text-white'
      case 'FAILED': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'NOT_STARTED': return <Clock className="h-3 w-3" />
      case 'IN_PROGRESS': return <Loader2 className="h-3 w-3 animate-spin" />
      case 'COMPLETED': return <CheckCircle className="h-3 w-3" />
      case 'FAILED': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'NOT_STARTED': return 'Not Started'
      case 'IN_PROGRESS': return 'In Progress'
      case 'COMPLETED': return 'Completed'
      case 'FAILED': return 'Failed'
      default: return 'Not Started'
    }
  }

  // Combine bounty tasks with their scoring status
  const combinedTasks = React.useMemo(() => {
    if (!bountyTasks || bountyTasks.length === 0) {
      return tasks
    }

    return bountyTasks.map((bountyTask) => {
      // Find corresponding scoring task by name
      const scoringTask = tasks.find(t => 
        (t.task?.name === bountyTask.name) || (t.taskName === bountyTask.name)
      )
      
      return {
        id: scoringTask?.id || bountyTask.id,
        taskId: bountyTask.id,
        taskName: bountyTask.name,
        taskDescription: bountyTask.description,
        score: scoringTask?.score,
        status: scoringTask?.status || 'NOT_STARTED',
        createdAt: scoringTask?.createdAt || bountyTask.createdAt,
        completedAt: scoringTask?.completedAt,
        task: {
          name: bountyTask.name,
          description: bountyTask.description
        }
      }
    })
  }, [bountyTasks, tasks])

  if (!combinedTasks || combinedTasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Target className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">No Tasks Found</h3>
            <p className="text-sm text-muted-foreground">This scoring job has no tasks yet.</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple/20 to-primary/20">
          <Target className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple via-primary to-accent bg-clip-text text-transparent">
          Tasks
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {combinedTasks.map((task, index) => {
          const taskName = getTaskName(task)
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="h-fit"
            >
              <Card className="glass-effect border border-purple/30 hover:border-purple/50 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg font-semibold text-gradient bg-gradient-to-r from-purple to-primary bg-clip-text text-transparent truncate">
                          {taskName}
                        </CardTitle>
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(task.status)}
                            {getStatusText(task.status)}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {getTaskDescription(task)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className={`text-xl font-bold ${getScoreColor(task.score)}`}>
                        {task.status?.toUpperCase() === 'IN_PROGRESS' ? '⏳' : task.score ? `${task.score}/100` : '⏳'}
                      </div>
                      {task.score && task.status?.toUpperCase() !== 'IN_PROGRESS' && (
                        <Badge 
                          className={`${getScoreBadgeColor(task.score)} text-white text-xs mt-1`}
                        >
                          {task.score >= 80 ? 'Excellent' : task.score >= 60 ? 'Good' : 'Needs Work'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Task metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                      {task.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </div>
                      )}
                    </div>

                    {/* View Logs Modal Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2 hover:bg-purple/10 hover:border-purple/40"
                        >
                          <FileText className="h-4 w-4" />
                          View Logs
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Logs for: {taskName}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="overflow-hidden">
                          <TaskLogStream 
                            jobId={scoringJobId} 
                            taskName={taskName}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}