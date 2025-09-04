
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test account (for testing purposes)
  const testPasswordHash = await bcrypt.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { hotkey: '4B8C9D2F3A1E7F9B8C5D4A2E8F1C3B7D9E2A5C8F1B4D7A3C6E9F2B5A8D1C4E7' },
    update: {},
    create: {
      hotkey: '4B8C9D2F3A1E7F9B8C5D4A2E8F1C3B7D9E2A5C8F1B4D7A3C6E9F2B5A8D1C4E7',
      username: 'admin_hunter',
      password: testPasswordHash,
      isActive: true
    }
  })

  // Create additional test users
  const users = []
  for (let i = 0; i < 5; i++) {
    const userPassword = await bcrypt.hash('password123', 12)
    const user = await prisma.user.upsert({
      where: { hotkey: `test_user_${i}_hotkey_${Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}` },
      update: {},
      create: {
        hotkey: `test_user_${i}_hotkey_${Array(32).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        username: `hunter_${i}`,
        password: userPassword
      }
    })
    users.push(user)
  }

  // Create bounty categories
  const categories = [
    { name: 'Web Development', color: '#3B82F6' },
    { name: 'Smart Contracts', color: '#10B981' },
    { name: 'Mobile Apps', color: '#F59E0B' },
    { name: 'AI/ML', color: '#8B5CF6' },
    { name: 'Security Audit', color: '#EF4444' },
    { name: 'Design', color: '#F97316' },
    { name: 'Research', color: '#06B6D4' },
    { name: 'Documentation', color: '#84CC16' }
  ]

  for (const category of categories) {
    await prisma.bountyCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  // Create sample bounties
  const bountyTitles = [
    'Build a DeFi Trading Dashboard',
    'Create Mobile Wallet Integration',
    'Smart Contract Security Audit',
    'Design Modern Landing Page',
    'Implement AI Price Prediction',
    'Cross-Chain Bridge Development', 
    'NFT Marketplace Frontend',
    'Tokenomics Research Paper',
    'Multi-Sig Wallet Development',
    'Staking Platform Implementation'
  ]

  const bountyDescriptions = [
    'Build a comprehensive trading dashboard with real-time price feeds, portfolio tracking, and advanced charting capabilities.',
    'Integrate mobile wallet functionality with biometric authentication and seamless transaction handling.',
    'Conduct a thorough security audit of existing smart contracts and provide detailed vulnerability report.',
    'Design a modern, responsive landing page with engaging animations and clear call-to-action elements.',
    'Implement machine learning models to predict cryptocurrency price movements with 80%+ accuracy.',
    'Develop a secure cross-chain bridge allowing asset transfers between multiple blockchain networks.',
    'Create a user-friendly NFT marketplace with advanced filtering, bidding, and collection management.',
    'Research and document comprehensive tokenomics model for a new DeFi protocol launch.',
    'Build a multi-signature wallet with intuitive UI and enterprise-grade security features.',
    'Implement a liquid staking platform with auto-compounding rewards and governance integration.'
  ]

  const requirements = [
    'Experience with React, TypeScript, and Web3 integration. Must include responsive design and real-time data handling.',
    'Flutter or React Native expertise required. Must support iOS/Android with native wallet integrations.',
    'Solidity expertise and formal verification experience. Provide automated testing suite.',
    'Advanced UI/UX design skills. Must include Figma files and development-ready assets.',
    'Python/TensorFlow experience with financial data analysis. Model must achieve documented accuracy.',
    'Deep blockchain knowledge across multiple networks. Gas optimization and security paramount.',
    'Full-stack development with IPFS integration. Smart contract functionality required.',
    'Economics background with DeFi protocol analysis experience. Academic-level documentation needed.',
    'Advanced cryptography knowledge. Multi-platform compatibility and hardware wallet support.',
    'DeFi development experience with yield optimization. Governance token integration required.'
  ]

  for (let i = 0; i < bountyTitles.length; i++) {
    const creator = i === 0 ? testUser : users[i % users.length]
    const randomCategory = categories[i % categories.length]
    const alphaReward = parseFloat((Math.random() * 1000 + 100).toFixed(2))
    const alphaRewardCap = parseFloat((Math.random() * 5000 + 1000).toFixed(2))
    
    const bounty = await prisma.bounty.create({
      data: {
        title: bountyTitles[i],
        problem: bountyDescriptions[i], // Map description to problem
        info: requirements[i], // Map requirements to info
        requirements: requirements[i],
        rewardDistribution: Math.random() > 0.5 ? 'ALL_AT_ONCE' : 'OVER_TIME',
        winningSpots: Math.floor(Math.random() * 3) + 1,
        status: (['ACTIVE', 'ACTIVE', 'ACTIVE', 'COMPLETED', 'PAUSED'] as const)[Math.floor(Math.random() * 5)],
        deadline: Math.random() > 0.3 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        creatorId: creator.id,
        categories: {
          connect: { name: randomCategory.name }
        },
        winningSpotConfigs: {
          create: [{
            position: 1,
            reward: alphaReward,
            rewardCap: alphaRewardCap,
            hotkey: "1"
          }]
        }
      }
    })

    // Create some submissions for each bounty
    const submissionCount = Math.floor(Math.random() * 8) + 1
    for (let j = 0; j < submissionCount; j++) {
      const submitter = users[j % users.length]
      if (submitter.id !== creator.id) {
        await prisma.submission.create({
          data: {
            title: `Submission ${j + 1} for ${bountyTitles[i]}`,
            description: `This is a detailed submission addressing all requirements. Implementation includes modern best practices and thorough testing.`,
            status: (['PENDING', 'APPROVED', 'SCORING', 'REJECTED'] as const)[Math.floor(Math.random() * 4)],
            score: Math.random() > 0.3 ? parseFloat((Math.random() * 100).toFixed(1)) : null,
            bountyId: bounty.id,
            submitterId: submitter.id
          }
        })
      }
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log(`👤 Created test account: admin_hunter`)
  console.log(`🎯 Created ${bountyTitles.length} bounties`)
  console.log(`👥 Created ${users.length + 1} users`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
