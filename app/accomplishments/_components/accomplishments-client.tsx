'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trophy, TrendingUp, Star, Calendar, Target, ChevronRight, ExternalLink } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

interface LeaderboardEntry {
  id: string
  title: string
  description: string
  category: 'AI/ML' | 'SWE' | 'Research' | 'Competition'
  position: number
  totalParticipants: number
  score: number
  maxScore: number
  dateAchieved: string
  organizationLogo?: string
  organization: string
  leaderboardUrl: string
  trend: 'up' | 'down' | 'stable'
  historicalData: Array<{
    date: string
    position: number
    score: number
  }>
  competitorData: Array<{
    name: string
    position: number
    score: number
    isUs?: boolean
  }>
}

// Sample accomplishments data
const accomplishments: LeaderboardEntry[] = [
  {
    id: '1',
    title: 'BFCL V4 - 8B Models',
    description: 'Leading benchmark for evaluating function calling capabilities in 8B models',
    category: 'AI/ML',
    position: 1,
    totalParticipants: 45,
    score: 46.6,
    maxScore: 100,
    dateAchieved: '2024-09-15',
    organization: 'UC Berkeley',
    leaderboardUrl: 'https://gorilla.cs.berkeley.edu/leaderboard.html',
    trend: 'up',
    historicalData: [
      { date: '2024-08-01', position: 8, score: 82.1 },
      { date: '2024-08-15', position: 6, score: 84.3 },
      { date: '2024-09-01', position: 4, score: 86.1 },
      { date: '2024-09-15', position: 3, score: 87.2 },
    ],
    competitorData: [
      { name: 'BitAgent-Bounty-8B', position: 1, score: 46.10, isUs: true },
      { name: 'xLAM-2-8B-fc+ (FC)', position: 2, score: 46.56 },
      { name: 'Qwen3-8B (FC)', position: 3, score: 42.59 },
      { name: 'ToolACE-2-8B (FC)', position: 4, score: 42.58 },
      { name: 'xLAM-2-3b-fc+ (FC)', position: 5, score: 40.68 },
      { name: 'DM-Cito-8B-v2 (Prompt)', position: 6, score: 40.08 },
      { name: 'BitAgent-8B', position: 7, score: 39.26, isUs: true },
      { name: 'watt-tool-8B (FC)', position: 8, score: 38.69 },
      { name: 'Qwen3-8B (Prompt)', position: 9, score: 38.18 },
      { name: 'Arch-Agent-3B', position: 10, score: 35.31 },
    ]
  },
  // {
  //   id: '2',
  //   title: 'SWE-Bench Verified',
  //   description: 'Software engineering benchmark for real-world GitHub issue resolution',
  //   category: 'SWE',
  //   position: 7,
  //   totalParticipants: 28,
  //   score: 24.6,
  //   maxScore: 100,
  //   dateAchieved: '2024-09-10',
  //   organization: 'Princeton & UChicago',
  //   leaderboardUrl: 'https://www.swebench.com/lite.html',
  //   trend: 'up',
  //   historicalData: [
  //     { date: '2024-07-01', position: 12, score: 18.2 },
  //     { date: '2024-07-15', position: 10, score: 20.1 },
  //     { date: '2024-08-01', position: 8, score: 22.8 },
  //     { date: '2024-09-10', position: 7, score: 24.6 },
  //   ],
  //   competitorData: [
  //     { name: 'Amazon Q', position: 1, score: 41.4 },
  //     { name: 'Devin', position: 2, score: 38.2 },
  //     { name: 'GPT-4o + agentic', position: 3, score: 32.1 },
  //     { name: 'Claude-3.5-Sonnet', position: 4, score: 28.9 },
  //     { name: 'AutoCodeRover', position: 5, score: 27.3 },
  //     { name: 'SWE-agent', position: 6, score: 25.8 },
  //     { name: 'AIBoards Agent', position: 7, score: 24.6, isUs: true },
  //   ]
  // },
  
]

const categoryColors = {
  'AI/ML': 'bg-blue-500',
  'SWE': 'bg-green-500',
  'Research': 'bg-purple-500',
  'Competition': 'bg-orange-500'
}

const trendIcons = {
  up: <TrendingUp className="h-4 w-4 text-green-500" />,
  down: <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />,
  stable: <span className="h-4 w-4 text-yellow-500">━</span>
}

export function AccomplishmentsClient() {
  const [selectedAccomplishment, setSelectedAccomplishment] = useState<LeaderboardEntry | null>(null)

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedAccomplishment) {
        setSelectedAccomplishment(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [selectedAccomplishment])

  const overallStats = {
    totalAccomplishments: accomplishments.length,
    avgPosition: accomplishments.reduce((sum, a) => sum + a.position, 0) / accomplishments.length,
    topThreeCount: accomplishments.filter(a => a.position <= 3).length,
    topTenCount: accomplishments.filter(a => a.position <= 10).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg shadow-yellow-500/25">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Our Accomplishments
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Leading the way in AI and software engineering benchmarks with outstanding performance across multiple leaderboards
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-blue-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{overallStats.totalAccomplishments}</div>
                <div className="text-sm font-medium text-muted-foreground">Total Leaderboards</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-4xl font-bold text-green-500 mb-2">{overallStats.topThreeCount}</div>
                <div className="text-sm font-medium text-muted-foreground">Top 3 Positions</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-4xl font-bold text-blue-500 mb-2">{overallStats.topTenCount}</div>
                <div className="text-sm font-medium text-muted-foreground">Top 10 Positions</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <div className="text-4xl font-bold text-purple-500 mb-2">{overallStats.avgPosition.toFixed(1)}</div>
                <div className="text-sm font-medium text-muted-foreground">Average Position</div>
              </CardContent>
            </Card>
          </motion.div>


          {/* Accomplishments Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {accomplishments.map((accomplishment, index) => (
              <motion.div
                key={accomplishment.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className="group cursor-pointer border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden relative"
                  onClick={() => setSelectedAccomplishment(accomplishment)}
                >
                  {/* Accent border */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${categoryColors[accomplishment.category]}`} />
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center gap-2">
                      {trendIcons[accomplishment.trend]}
                      <div className={`text-6xl font-bold ${accomplishment.position <= 3 ? 'text-yellow-500' : accomplishment.position <= 10 ? 'text-blue-500' : 'text-muted-foreground'} opacity-10 group-hover:opacity-20 transition-opacity`}>
                        #{accomplishment.position}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-4 relative z-20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge 
                            variant="secondary" 
                            className={`${categoryColors[accomplishment.category]} text-white font-medium px-3 py-1 shadow-lg`}
                          >
                            {accomplishment.category}
                          </Badge>
                          <span className="text-sm font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                            {accomplishment.organization}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-3 group-hover:text-primary transition-colors">
                          {accomplishment.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {accomplishment.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0 relative z-20">
                    {/* Main metrics */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-1 ${accomplishment.position <= 3 ? 'text-yellow-500' : 'text-primary'}`}>
                          #{accomplishment.position}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Position</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-500 mb-1">{accomplishment.score.toFixed(1)}%</div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Score</div>
                      </div>
                    </div>

                    {/* Performance bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Performance</span>
                        <span className="text-green-500">{accomplishment.score.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full shadow-sm"
                          initial={{ width: 0 }}
                          animate={{ width: `${accomplishment.score}%` }}
                          transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Achievement date */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Achieved {new Date(accomplishment.dateAchieved).toLocaleDateString()}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Modal for detailed view */}
      <AnimatePresence>
        {selectedAccomplishment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAccomplishment(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-2xl font-bold">{selectedAccomplishment.title}</h2>
                      <Badge variant="secondary" className={`${categoryColors[selectedAccomplishment.category]} text-white`}>
                        {selectedAccomplishment.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{selectedAccomplishment.description}</p>
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={() => window.open(selectedAccomplishment.leaderboardUrl, '_blank')}
                        className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Leaderboard
                      </Button>
                      <div className="text-sm text-muted-foreground">
                        {selectedAccomplishment.organization}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAccomplishment(null)}
                    className="text-muted-foreground hover:text-foreground ml-4"
                  >
                    ✕
                  </button>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Competitive Landscape</h3>
                  <div className="space-y-3">
                    {selectedAccomplishment.competitorData.map((competitor, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          competitor.isUs ? 'bg-green-100 border border-green-300' : 'bg-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`text-lg font-bold ${competitor.isUs ? 'text-green-700' : ''}`}>
                            #{competitor.position}
                          </div>
                          <div>
                            <div className={`font-medium ${competitor.isUs ? 'text-green-700' : ''}`}>
                              {competitor.name}
                              {competitor.isUs && <Badge className="ml-2">Us</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${competitor.isUs ? 'text-green-700' : ''}`}>
                          {competitor.score.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}