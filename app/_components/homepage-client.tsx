
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Trophy, Target, Users, ArrowRight, Coins, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export function HomePageClient() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    activeBounties: '0',
    totalRewards: '0',
    totalUsers: '0',
    successRate: '0%'
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }

        const data = await response.json()
        const { stats } = data
        
        // Format the numbers for display
        const formatNumber = (num: number) => {
          if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`
          }
          return num.toString()
        }

        const formatRewards = (num: number) => {
          if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M α`
          } else if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K α`
          }
          return `${num} α`
        }

        setStats({
          activeBounties: stats.bounties.active.toString(),
          totalRewards: formatRewards(stats.rewards.totalNumeric),
          totalUsers: formatNumber(stats.users.total),
          successRate: `${stats.bounties.successRate}%`
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Keep default values on error
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const features = [
    // {
    //   icon: <Wallet className="h-8 w-8" />,
    //   title: "Crypto Authentication",
    //   description: "Connect with your wallet address and secure password for seamless authentication."
    // },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Alpha Rewards", 
      description: "Earn rewards by completing bounties."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Multiple Winners",
      description: "Bounties can have multiple winning spots, giving more users a chance to earn rewards."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Validation System",
      description: "Automated and manual validation ensures quality submissions and fair reward distribution."
    },
    // {
    //   icon: <Zap className="h-8 w-8" />,
    //   title: "File Upload",
    //   description: "Drag & drop file uploads with no limitations. Upload folders, code, documents, and more."
    // },
    // {
    //   icon: <Users className="h-8 w-8" />,
    //   title: "Community Driven",
    //   description: "Vote on submissions and participate in the bounty hunter community ecosystem."
    // }
  ]

  const statsData = [
    { label: "Active Bounties", value: stats.activeBounties, icon: <Trophy className="h-5 w-5" /> },
    { label: "Total Rewards", value: stats.totalRewards, icon: <Coins className="h-5 w-5" /> },
    // { label: "Users", value: stats.totalUsers, icon: <Users className="h-5 w-5" /> },
    // { label: "Success Rate", value: stats.successRate, icon: <Target className="h-5 w-5" /> }
  ]

  return (
    <main className="relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-purple/5 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-3xl animate-gradient-shift -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            Hunt Bounties,{' '}
            <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
              Earn Rewards
            </span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-purple/20 blur-2xl animate-pulse-slow -z-10 rounded-full" />
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed relative z-10">
              Join the premier crypto bounty platform where developers and creators 
              earn <span className="text-accent font-semibold">rewards</span> for completing innovative challenges.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
          >
            {!session && (
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white text-lg px-10 py-7 shadow-2xl shadow-primary/25 hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300 border border-primary/50 animate-glow"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Start Hunting</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            )}
            
            <Link href="/bounties">
              <Button 
                variant="outline" 
                size="lg" 
                className="group relative overflow-hidden glass-effect hover:glow-border text-lg px-10 py-7 border-2 border-primary/30 hover:border-primary/60 transform hover:scale-105 transition-all duration-300"
              >
                <span className="text-gradient">Browse Bounties</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Bounty System Explanation */}
      <section className="container mx-auto max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How{' '}
            <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
              Bounties
            </span>
            {' '}Work
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our revolutionary bounty system transforms how creators post challenges and users earn rewards in the crypto space.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 mb-16">
          {[
            {
              step: "01",
              title: "Create & Post",
              description: "COMING SOON: Creators post bounties with detailed requirements, deadlines, and reward amounts. Set multiple winner spots and validation criteria.",
              icon: "📝",
              gradient: "from-primary to-blue-600"
            },
            {
              step: "02", 
              title: "Hunt & Submit",
              description: "Bounty users browse active challenges, claim tasks, and submit their work with file uploads, code, or documentation.",
              icon: "🎯",
              gradient: "from-accent to-orange-500"
            },
            {
              step: "03",
              title: "Earn",
              description: "Automated and community validation determines winners.",
              icon: "💰",
              gradient: "from-purple to-pink-500"
            }
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.2 + 1.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Connecting Line */}
              {index < 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary/30 to-accent/30 -translate-y-1/2 z-10">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2 + 1.5, duration: 0.8 }}
                  />
                </div>
              )}
              
              <Card className="card-enhanced h-full relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-all duration-500`} />
                <div className="absolute -top-32 -right-32 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <CardContent className="p-8 text-center relative z-10">
                  <motion.div
                    className="text-6xl mb-6"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3 + index,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {step.icon}
                  </motion.div>
                  
                  <div className="text-sm font-bold text-muted-foreground mb-2 tracking-wider">
                    STEP {step.step}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bounty Types */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.6 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <Card className="card-enhanced relative overflow-hidden border border-accent/30 hover:border-accent/50 bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-orange-500/8 to-yellow-500/8 opacity-80" />
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-accent/20 to-orange-500/20 rounded-full blur-3xl" />
            
            <CardHeader className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl mb-4"
              >
                🔥
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gradient bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                Development Bounties
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-muted-foreground mb-4">
                Code challenges, smart contract development, web3 integrations, and technical implementations in the world of AI.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Frontend", "Smart Contracts", "APIs", "Web3", "DeFi"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced relative overflow-hidden border border-purple/30 hover:border-purple/50 bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-purple/8 via-pink-500/8 to-blue-500/8 opacity-80" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple/20 to-pink-500/20 rounded-full blur-3xl" />
            
            <CardHeader className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl mb-4"
              >
                🎨
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple to-pink-500 bg-clip-text text-transparent">
                Creative Bounties
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-muted-foreground mb-4">
                Design challenges, content creation, marketing materials, and creative digital assets in the world of AI.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Design", "Content", "Graphics", "Video", "Marketing"].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-purple/20 text-purple-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-2 gap-8"
        >
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.15 + 1.0, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="card-enhanced text-center relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="pt-8 pb-6 relative z-10">
                  <motion.div 
                    className="flex items-center justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-primary p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </motion.div>
                  <div className="text-3xl font-bold mb-2 text-gradient animate-gradient bg-gradient-to-r from-primary to-accent bg-clip-text">
                    {loading ? (
                      <div className="animate-pulse bg-primary/20 h-8 w-16 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose{' '}
            <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
              AIBoards
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our bounty system revolutionizes crypto rewards with cutting-edge features designed for users and creators alike.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.2 + 1.4, duration: 0.6 }}
              whileHover={{ y: -12, scale: 1.03 }}
              className="group"
            >
              <Card className="card-enhanced h-full relative overflow-hidden border border-primary/30 hover:border-primary/50 bg-card">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute -top-40 -right-40 w-40 h-40 bg-gradient-to-br from-accent/20 to-purple/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                
                <CardHeader className="relative z-10">
                  <motion.div 
                    className="text-primary mb-4 p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle className="text-xl font-bold group-hover:text-gradient">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          className="relative"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-purple/20 blur-3xl animate-pulse-slow -z-10 rounded-3xl" />
          
          <Card className="card-enhanced relative overflow-hidden border-2 border-primary/40 bg-card backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/8 to-purple/8 animate-gradient-shift" />
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-conic from-primary via-accent to-purple opacity-10 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-conic from-purple via-accent to-primary opacity-10 rounded-full blur-3xl animate-pulse-slow" />
            
            <CardContent className="p-10 md:p-16 text-center relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to Start Your{' '}
                  <span className="text-gradient animate-gradient bg-gradient-to-r from-primary via-accent to-purple bg-clip-text text-transparent">
                    Hunt
                  </span>
                  ?
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                  Join thousands of bounty users earning{' '}
                  <span className="text-accent font-semibold">rewards</span>. 
                  Create your account with just your wallet address.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                {!session && (
                  <Link href="/auth/signup">
                    <Button 
                      size="lg" 
                      className="group relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-accent hover:from-primary/90 hover:via-blue-700 hover:to-accent/90 text-white text-xl px-12 py-8 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transform hover:scale-110 transition-all duration-300 border border-primary/50 animate-glow"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10 flex items-center">
                        <Wallet className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
                        Sign Up Now
                      </span>
                    </Button>
                  </Link>
                )}
                
                <Link href="/bounties">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="group relative overflow-hidden glass-effect hover:glow-border text-xl px-12 py-8 border-2 border-primary/40 hover:border-primary/70 transform hover:scale-110 transition-all duration-300"
                  >
                    <span className="text-gradient group-hover:animate-gradient">View Bounties</span>
                  </Button>
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Team Rizzo Section */}
      {/* <section className="container mx-auto max-w-6xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.8 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple/10 via-primary/10 to-accent/10 blur-3xl animate-pulse-slow -z-10 rounded-full" />
          
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.8, duration: 0.6 }}
          >
            <span className="text-gradient animate-gradient bg-gradient-to-r from-purple via-primary to-accent bg-clip-text text-transparent">
              Brought to you by Team Rizzo
            </span>
          </motion.h2>
          
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.0, duration: 0.6 }}
          >
            <Card className="card-enhanced relative overflow-hidden border border-purple/30 hover:border-purple/50 bg-card max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-purple/8 via-primary/8 to-accent/8 opacity-80" />
              <div className="absolute -top-20 -right-20 w-32 h-32 bg-gradient-to-br from-purple/20 to-accent/20 rounded-full blur-2xl" />
              
              <CardContent className="p-8 text-center relative z-10">
                <motion.div 
                  className="text-6xl mb-6"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🏴‍☠️
                </motion.div>
                <h3 className="text-xl font-bold mb-4 text-gradient bg-gradient-to-r from-purple to-primary bg-clip-text text-transparent">
                  Innovation Pirates
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We're a team of crypto enthusiasts and developers sailing the digital seas, 
                  building the future of decentralized bounty hunting one line of code at a time.
                </p>
              </CardContent>
            </Card>
            
            <motion.div 
              className="text-center space-y-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl mb-4"
              >
                ⚓
              </motion.div>
              <h3 className="text-2xl font-bold text-gradient bg-gradient-to-r from-accent to-purple bg-clip-text text-transparent">
                Anchored in Quality
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Every bounty, every reward, every line of code - crafted with precision and passion for the crypto community.
              </p>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3.2, duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple/20 to-accent/20 blur-2xl animate-pulse-slow -z-10 rounded-full" />
            <p className="text-lg text-muted-foreground italic max-w-2xl mx-auto relative z-10">
              "Setting sail on the blockchain seas, we navigate through challenges and storms 
              to deliver treasure-worthy bounty experiences for all crypto adventurers."
            </p>
            <div className="mt-6 text-sm text-primary/70 font-medium">
              — Team Rizzo, Digital Ocean Explorers
            </div>
          </motion.div>
        </motion.div>
      </section> */}

      {/* Footer */}
      <footer className="relative border-t border-primary/30 bg-card backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-accent/8 animate-pulse-slow" />
        <div className="container mx-auto max-w-6xl px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 animate-glow">
                <Wallet className="h-6 w-6 text-primary animate-pulse-slow" />
              </div>
              <span className="font-bold text-2xl text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AIBoards
              </span>
            </motion.div>
            
            <div className="flex items-center gap-8 text-muted-foreground">
              <Link 
                href="/bounties" 
                className="hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
              >
                Bounties
              </Link>
              {/* <Link 
                href="/create" 
                className="hover:text-accent transition-all duration-300 hover:scale-110 font-medium"
              >
                Create
              </Link> */}
              <motion.div 
                className="text-sm opacity-60"
                whileHover={{ opacity: 100, scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Crafted by Team Rizzo 
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
