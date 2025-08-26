
'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Trophy, Target, Users, ArrowRight, Coins, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export function HomePageClient() {
  const features = [
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Crypto Authentication",
      description: "Connect with your wallet address and secure password for seamless authentication."
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Alpha Rewards", 
      description: "Earn alpha cryptocurrency rewards for completing bounties. Choose 60% at once or 100% over time."
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Multiple Winners",
      description: "Bounties can have multiple winning spots, giving more hunters a chance to earn rewards."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Validation System",
      description: "Automated and manual validation ensures quality submissions and fair reward distribution."
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "File Upload",
      description: "Drag & drop file uploads with no limitations. Upload folders, code, documents, and more."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Driven",
      description: "Vote on submissions and participate in the bounty hunter community ecosystem."
    }
  ]

  const stats = [
    { label: "Active Bounties", value: "100+", icon: <Trophy className="h-5 w-5" /> },
    { label: "Total Rewards", value: "50K α", icon: <Coins className="h-5 w-5" /> },
    { label: "Hunters", value: "1,000+", icon: <Users className="h-5 w-5" /> },
    { label: "Success Rate", value: "95%", icon: <Target className="h-5 w-5" /> }
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
              Earn Alpha
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
              earn <span className="text-accent font-semibold">alpha rewards</span> for completing innovative challenges.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
          >
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

      {/* Stats Section */}
      <section className="container mx-auto max-w-6xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
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
                    {stat.value}
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
              BountyHunter
            </span>
            ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for the crypto community with cutting-edge features and seamless user experience.
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
                  Join thousands of bounty hunters earning{' '}
                  <span className="text-accent font-semibold">alpha rewards</span>. 
                  Create your account with just your wallet address.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
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
                BountyHunter
              </span>
            </motion.div>
            
            <div className="flex items-center gap-8 text-muted-foreground">
              <Link 
                href="/bounties" 
                className="hover:text-primary transition-all duration-300 hover:scale-110 font-medium"
              >
                Bounties
              </Link>
              <Link 
                href="/create" 
                className="hover:text-accent transition-all duration-300 hover:scale-110 font-medium"
              >
                Create
              </Link>
              <div className="text-sm opacity-60">
                Built with ⚡ for the crypto community
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
