'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Activity,
  Target,
  FileText,
  Link2,
  Upload,
  Type,
  Trophy
} from 'lucide-react'
import Link from 'next/link'
import { FileDisplay } from '@/components/file-display'
import { LogStream } from './log-stream'
import { TaskGrid } from './task-grid'

interface ScoringJobDetailClientProps {
  scoringJob: any
  user: any
  isAdmin: boolean
  isSubmitter: boolean
  isBountyCreator: boolean
}

export function ScoringJobDetailClient({ 
  scoringJob, 
  user, 
  isAdmin, 
  isSubmitter, 
  isBountyCreator 
}: ScoringJobDetailClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentScoringJob, setCurrentScoringJob] = useState(scoringJob)

  useEffect(() => {
    if ((currentScoringJob.status === 'SCORING' || currentScoringJob.status === 'ASSIGNED') || 
        (currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED')) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/scoring-jobs/${currentScoringJob.id}`)
          if (response.ok) {
            const updatedJob = await response.json()
            setCurrentScoringJob(updatedJob)
          }
        } catch (error) {
          console.error('Failed to refresh scoring job:', error)
        }
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [currentScoringJob.id, currentScoringJob.status, currentScoringJob.currentScore])

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-orange-500 text-white'
      case 'ASSIGNED': return 'bg-blue-500 text-white'
      case 'SCORING': return 'bg-purple-500 text-white'
      case 'COMPLETED': return 'bg-green-500 text-white'
      case 'FAILED': return 'bg-red-500 text-white'
      case 'CANCELLED': return 'bg-gray-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'ASSIGNED': return <User className="h-4 w-4" />
      case 'SCORING': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'FAILED': return <XCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-8"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-6 py-3 glass-effect hover:glow-border border border-primary/30 hover:border-primary/60 text-primary hover:text-accent transition-all duration-300 rounded-xl group transform hover:scale-105 shadow-lg shadow-primary/10 bg-transparent cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium text-gradient">Back</span>
        </button>
        
      </motion.div>

      {/* Enhanced Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden border hover:border-primary/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-primary/30"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-conic from-primary via-accent to-purple opacity-10 rounded-full blur-3xl animate-float" />
        <div className="p-6 lg:p-8 relative z-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${getStatusColor(currentScoringJob.status)} text-xs px-3 py-1 rounded-lg shadow-lg`}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentScoringJob.status)}
                    {currentScoringJob.status}
                  </div>
                </Badge>
                <Badge variant="outline" className="text-xs px-3 py-1 rounded-lg glass-effect border-primary/30">
                  Job #{currentScoringJob.id.slice(-8)}
                </Badge>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl lg:text-4xl font-bold leading-tight"
              >
                <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
                  Scoring: {currentScoringJob.submission.title}
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-purple/20 blur-2xl animate-pulse-slow -z-10 rounded-full" />
                <div className="flex items-center gap-3 relative z-10">
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Validation of submission for
                  </p>
                  <Link href={`/bounties/${currentScoringJob.submission.bounty.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button variant="outline" className="glass-effect border border-primary/30 hover:border-primary/60 text-primary hover:text-accent hover:bg-primary/10 rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/20">
                        <Trophy className="h-4 w-4 mr-2" />
                        {currentScoringJob.submission.bounty.title}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className="glass-effect border border-primary/30 rounded-xl p-4 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Screener</p>
                    <p className="text-lg font-semibold text-gradient">{currentScoringJob.screener.name}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className={`glass-effect border rounded-xl p-4 transition-all duration-300 shadow-lg ${
                  currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED'
                    ? 'border-yellow-400/50 hover:border-yellow-400/70 shadow-yellow-400/20' 
                    : 'border-accent/30 hover:border-accent/50 shadow-accent/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                    currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED'
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-gradient-to-br from-accent to-purple'
                  }`}>
                    {currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Target className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'text-yellow-600' : 'text-accent'
                    }`}>
                      {currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'Processing' : 'Score'}
                    </p>
                    <p className="text-lg font-semibold text-gradient">
                      {currentScoringJob.currentScore 
                        ? `${currentScoringJob.currentScore}/100` 
                        : currentScoringJob.score 
                          ? `${currentScoringJob.score}/100` 
                          : 'Pending'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className="glass-effect border border-purple/30 rounded-xl p-4 hover:border-purple/50 transition-all duration-300 shadow-lg hover:shadow-purple/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple to-primary rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-400">Created</p>
                    <p className="text-lg font-semibold text-gradient">
                      {new Date(currentScoringJob.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className="glass-effect border border-primary/30 rounded-xl p-4 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Duration</p>
                    <p className="text-lg font-semibold text-gradient">
                      {currentScoringJob.completedAt && currentScoringJob.startedAt
                        ? `${Math.round((new Date(currentScoringJob.completedAt).getTime() - new Date(currentScoringJob.startedAt).getTime()) / 60000)}m`
                        : currentScoringJob.startedAt
                        ? `${Math.round((Date.now() - new Date(currentScoringJob.startedAt).getTime()) / 60000)}m`
                        : 'Not started'
                      }
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submission Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-enhanced relative border border-primary/30 hover:border-primary/50 bg-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-float" />
          <div className="p-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
                Submission Details
              </h2>
            </motion.div>
            <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Label className="text-sm font-bold text-primary mb-2 block">Title</Label>
              <p className="text-lg font-bold text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{currentScoringJob.submission.title}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Label className="text-sm font-bold text-primary mb-2 block">Description</Label>
              <div className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {currentScoringJob.submission.description}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Label className="text-sm font-bold text-primary mb-2 block">Submitter</Label>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className="flex items-center gap-3 p-3 glass-effect border border-primary/30 rounded-lg hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-gradient">@{currentScoringJob.submission.submitter.username || currentScoringJob.submission.submitter.walletAddress?.slice(0, 8)}</span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Label className="text-sm font-bold text-primary mb-2 block">Content Type</Label>
              <motion.div
                whileHover={{ scale: 1.02, y: -1 }}
                className="flex items-center gap-3 p-3 glass-effect border border-accent/30 rounded-lg hover:border-accent/50 transition-all duration-300"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                    currentScoringJob.submission.contentType === 'URL' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                    currentScoringJob.submission.contentType === 'FILE' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                    currentScoringJob.submission.contentType === 'TEXT' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                    'bg-gradient-to-br from-orange-500 to-yellow-500'
                  }`}
                >
                  {currentScoringJob.submission.contentType === 'URL' && <Link2 className="h-4 w-4 text-white" />}
                  {currentScoringJob.submission.contentType === 'FILE' && <Upload className="h-4 w-4 text-white" />}
                  {currentScoringJob.submission.contentType === 'TEXT' && <Type className="h-4 w-4 text-white" />}
                  {currentScoringJob.submission.contentType === 'MIXED' && <Trophy className="h-4 w-4 text-white" />}
                </div>
                <span className="font-bold text-gradient">{currentScoringJob.submission.contentType}</span>
              </motion.div>
            </motion.div>

            {/* Display URLs if any */}
            {currentScoringJob.submission.urls && currentScoringJob.submission.urls.length > 0 && (
              <div>
                <Label className="text-sm font-medium">URLs</Label>
                <div className="space-y-1">
                  {currentScoringJob.submission.urls.map((url: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline break-all text-sm"
                      >
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display text content if any */}
            {currentScoringJob.submission.textContent && (
              <div>
                <Label className="text-sm font-medium">Text Content</Label>
                <div className="mt-2 p-3 bg-muted/50 rounded-md">
                  <pre className="text-sm whitespace-pre-wrap font-mono overflow-x-auto">
                    {currentScoringJob.submission.textContent}
                  </pre>
                </div>
              </div>
            )}

            {/* Display files if any */}
            {currentScoringJob.submission.files?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Files</Label>
                <div className="mt-2">
                  <FileDisplay files={currentScoringJob.submission.files} />
                </div>
              </div>
            )}
            </div>
          </div>
        </motion.div>

        {/* Scoring Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card-enhanced relative border border-accent/30 hover:border-accent/50 bg-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-purple/8 to-primary/8 animate-gradient-shift" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="p-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-purple/20">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-gradient bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent">
                Scoring Information
              </h2>
            </motion.div>
            <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Screener Details</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Name:</span>
                  <span className="font-medium">{currentScoringJob.screener.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hotkey:</span>
                  <Badge variant="outline">{currentScoringJob.screener.hotkey}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Priority:</span>
                  <span className="font-medium">{currentScoringJob.screener.priority}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active:</span>
                  <Badge variant={currentScoringJob.screener.isActive ? "default" : "secondary"}>
                    {currentScoringJob.screener.isActive ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-4"
            >
              <Label className="text-sm font-bold text-accent flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 glass-effect border border-accent/20 rounded-lg hover:border-accent/40 transition-all duration-300">
                  <span className="text-sm font-medium text-accent">Created:</span>
                  <span className="font-bold text-gradient">
                    {new Date(currentScoringJob.createdAt).toLocaleString()}
                  </span>
                </div>
                
                {currentScoringJob.startedAt && (
                  <div className="flex items-center justify-between p-3 glass-effect border border-primary/20 rounded-lg hover:border-primary/40 transition-all duration-300">
                    <span className="text-sm font-medium text-primary">Started:</span>
                    <span className="font-bold text-gradient">
                      {new Date(currentScoringJob.startedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {currentScoringJob.completedAt && (
                  <div className="flex items-center justify-between p-3 glass-effect border border-green-500/20 rounded-lg hover:border-green-500/40 transition-all duration-300">
                    <span className="text-sm font-medium text-green-600">Completed:</span>
                    <span className="font-bold text-gradient">
                      {new Date(currentScoringJob.completedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Retry Information</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attempts:</span>
                  <span className="font-medium">{currentScoringJob.retryCount}/{currentScoringJob.maxRetries}</span>
                </div>
              </div>
            </div>

            {currentScoringJob.errorMessage && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-red-300/50 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Error Message
                  </Label>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-red-50/80 via-pink-50/80 to-red-100/80 border border-red-300/50 rounded-xl shadow-lg backdrop-blur-sm"
                  >
                    <p className="text-sm text-red-800 leading-relaxed font-medium">{currentScoringJob.errorMessage}</p>
                  </motion.div>
                </motion.div>
              </>
            )}

            {(currentScoringJob.score || currentScoringJob.currentScore) && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4 }}
                  className="space-y-3"
                >
                  <Label className={`text-sm font-bold ${
                    currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'Current Score (Processing)' : 'Final Score'}
                  </Label>
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`text-center p-6 border rounded-xl shadow-lg backdrop-blur-sm ${
                      currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' 
                        ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/15 to-yellow-600/20 border-yellow-400/40'
                        : 'bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-green-600/20 border-green-400/40'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`text-4xl font-bold ${
                        currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {currentScoringJob.currentScore || currentScoringJob.score}/100
                      </div>
                      {currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' && (
                        <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />
                      )}
                    </div>
                    <p className={`text-sm mt-2 font-medium ${
                      currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'text-yellow-300' : 'text-green-300'
                    }`}>
                      {currentScoringJob.currentScore && currentScoringJob.status !== 'COMPLETED' ? 'Processing...' : 'Validation Complete'}
                    </p>
                  </motion.div>
                </motion.div>
              </>
            )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Task Grid Section */}
      {((currentScoringJob.scoringTasks && currentScoringJob.scoringTasks.length > 0) || 
        (currentScoringJob.submission.bounty.tasks && currentScoringJob.submission.bounty.tasks.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card-enhanced relative border border-purple/30 hover:border-purple/50 bg-card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple/8 via-primary/8 to-accent/8 animate-gradient-shift" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-purple/20 to-primary/20 rounded-full blur-3xl animate-float" />
          <div className="p-6 relative z-10">
            <TaskGrid 
              scoringJobId={currentScoringJob.id}
              tasks={currentScoringJob.scoringTasks}
              bountyTasks={currentScoringJob.submission.bounty.tasks}
            />
          </div>
        </motion.div>
      )}

      {/* Live Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <LogStream jobId={currentScoringJob.id} />
      </motion.div>
    </div>
  )
}