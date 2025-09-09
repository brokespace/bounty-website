import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎯 Seeding product milestones...')

  const milestones = [
    {
      title: 'Launch Beta Platform',
      description: 'Complete the initial beta version of AIBoards with core bounty creation and submission features.',
      targetDate: new Date('2025-01-15'),
      completed: true,
      completedAt: new Date('2025-01-10')
    },
    {
      title: 'Google OAuth Integration',
      description: 'Implement Google OAuth authentication to streamline user onboarding and improve security.',
      targetDate: new Date('2025-02-01'),
      completed: true,
      completedAt: new Date('2025-01-28')
    },
    {
      title: 'Wallet Integration',
      description: 'Add cryptocurrency wallet connectivity for seamless reward distribution and user identity.',
      targetDate: new Date('2025-02-15'),
      completed: true,
      completedAt: new Date('2025-02-12')
    },
    {
      title: 'Mobile App Launch',
      description: 'Release native mobile applications for iOS and Android platforms with full feature parity.',
      targetDate: new Date('2025-03-01'),
      completed: false
    },
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Build comprehensive analytics for bounty creators to track performance, submissions, and engagement.',
      targetDate: new Date('2025-03-15'),
      completed: false
    },
    {
      title: 'Multi-Chain Support',
      description: 'Expand cryptocurrency support to include Ethereum, Polygon, and Solana networks.',
      targetDate: new Date('2025-04-01'),
      completed: false
    },
    {
      title: 'Enterprise Features',
      description: 'Launch team collaboration tools, advanced permission management, and enterprise billing.',
      targetDate: new Date('2025-05-01'),
      completed: false
    }
  ]

  for (const milestone of milestones) {
    const existing = await prisma.milestone.findFirst({
      where: { title: milestone.title }
    })
    
    if (!existing) {
      await prisma.milestone.create({
        data: milestone
      })
    }
  }

  console.log('✅ Product milestones seeded successfully!')
  console.log(`🎯 Created ${milestones.length} milestones`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding milestones:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })