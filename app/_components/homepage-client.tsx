
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
    <main>
      {/* Hero Section */}
      <section className="relative container mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 blur-3xl -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Hunt Bounties,{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Earn Alpha
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            Join the premier crypto bounty platform where developers and creators 
            earn alpha rewards for completing innovative challenges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                Start Hunting
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/bounties">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Browse Bounties
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-3 text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose BountyHunter?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for the crypto community with cutting-edge features and seamless user experience.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader>
                  <div className="text-primary mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Hunt?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of bounty hunters earning alpha rewards. 
                Create your account with just your wallet address.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <Wallet className="mr-2 h-5 w-5" />
                    Sign Up Now
                  </Button>
                </Link>
                
                <Link href="/bounties">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                    View Bounties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg">BountyHunter</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/bounties" className="hover:text-foreground transition-colors">
                Bounties
              </Link>
              <Link href="/create" className="hover:text-foreground transition-colors">
                Create
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
