import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding screeners and scoring data...')

  // Create screeners
  const screeners = [
    {
      name: 'GPT-4 Code Reviewer',
      hotkey: 'gpt4-code',
      apiUrl: 'https://api.openai.com/v1',
      isActive: true,
      priority: 10,
      maxConcurrent: 5,
      currentJobs: 0
    },
    {
      name: 'Claude Sonnet Evaluator',
      hotkey: 'claude-sonnet',
      apiUrl: 'https://api.anthropic.com/v1',
      isActive: true,
      priority: 8,
      maxConcurrent: 3,
      currentJobs: 0
    },
    {
      name: 'Expert Human Reviewer',
      hotkey: 'human-expert',
      apiUrl: 'https://internal.company.com/api',
      isActive: true,
      priority: 15,
      maxConcurrent: 2,
      currentJobs: 0
    },
    {
      name: 'Automated Test Runner',
      hotkey: 'test-runner',
      apiUrl: 'https://ci.company.com/api',
      isActive: true,
      priority: 5,
      maxConcurrent: 10,
      currentJobs: 0
    }
  ]

  console.log('Creating screeners...')
  const createdScreeners = []
  for (const screenerData of screeners) {
    const screener = await prisma.screener.upsert({
      where: { hotkey: screenerData.hotkey },
      update: screenerData,
      create: screenerData
    })
    createdScreeners.push(screener)
    console.log(`✅ Created screener: ${screener.name}`)
  }

  // Get existing bounties and submissions
  const bounties = await prisma.bounty.findMany({
    include: {
      submissions: {
        include: {
          scoringJobs: true
        }
      }
    }
  })

  if (bounties.length === 0) {
    console.log('⚠️ No bounties found. Create some bounties first.')
    return
  }

  // Create bounty category support for screeners
  const categories = await prisma.bountyCategory.findMany()
  
  console.log('Setting up screener bounty support...')
  for (const screener of createdScreeners) {
    // GPT-4 supports all categories and submission types
    if (screener.hotkey === 'gpt4-code') {
      for (const category of categories) {
        await prisma.screenerBountySupport.upsert({
          where: {
            screenerId_categoryId: {
              screenerId: screener.id,
              categoryId: category.id
            }
          },
          update: {
            submissionTypes: ['FILE', 'TEXT', 'URL', 'MIXED']
          },
          create: {
            screenerId: screener.id,
            categoryId: category.id,
            submissionTypes: ['FILE', 'TEXT', 'URL', 'MIXED']
          }
        })
      }
    }
    
    // Claude supports text and mixed submissions
    if (screener.hotkey === 'claude-sonnet') {
      for (const category of categories) {
        await prisma.screenerBountySupport.upsert({
          where: {
            screenerId_categoryId: {
              screenerId: screener.id,
              categoryId: category.id
            }
          },
          update: {
            submissionTypes: ['TEXT', 'MIXED']
          },
          create: {
            screenerId: screener.id,
            categoryId: category.id,
            submissionTypes: ['TEXT', 'MIXED']
          }
        })
      }
    }
    
    // Human expert supports all types
    if (screener.hotkey === 'human-expert') {
      for (const category of categories) {
        await prisma.screenerBountySupport.upsert({
          where: {
            screenerId_categoryId: {
              screenerId: screener.id,
              categoryId: category.id
            }
          },
          update: {
            submissionTypes: ['FILE', 'TEXT', 'URL', 'MIXED']
          },
          create: {
            screenerId: screener.id,
            categoryId: category.id,
            submissionTypes: ['FILE', 'TEXT', 'URL', 'MIXED']
          }
        })
      }
    }
    
    // Test runner only supports file submissions
    if (screener.hotkey === 'test-runner') {
      for (const category of categories) {
        await prisma.screenerBountySupport.upsert({
          where: {
            screenerId_categoryId: {
              screenerId: screener.id,
              categoryId: category.id
            }
          },
          update: {
            submissionTypes: ['FILE']
          },
          create: {
            screenerId: screener.id,
            categoryId: category.id,
            submissionTypes: ['FILE']
          }
        })
      }
    }
  }

  // Create scoring jobs for existing submissions
  console.log('Creating scoring jobs for existing submissions...')
  let jobCount = 0
  
  for (const bounty of bounties) {
    for (const submission of bounty.submissions) {
      // Skip if already has scoring jobs
      if (submission.scoringJobs.length > 0) {
        continue
      }

      // Randomly assign 1-3 screeners to each submission
      const numScreeners = Math.floor(Math.random() * 3) + 1
      const shuffledScreeners = [...createdScreeners].sort(() => Math.random() - 0.5)
      const assignedScreeners = shuffledScreeners.slice(0, numScreeners)

      for (const screener of assignedScreeners) {
        const statuses = ['PENDING', 'SCORING', 'COMPLETED', 'FAILED']
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        let score = null
        let completedAt = null
        let startedAt = null
        
        if (status === 'COMPLETED') {
          score = Math.floor(Math.random() * 100) + 1 // Random score 1-100
          completedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
          startedAt = new Date(completedAt.getTime() - Math.random() * 2 * 60 * 60 * 1000) // 0-2 hours before completion
        } else if (status === 'SCORING') {
          startedAt = new Date(Date.now() - Math.random() * 60 * 60 * 1000) // Started within last hour
        }

        const scoringJob = await prisma.scoringJob.create({
          data: {
            submissionId: submission.id,
            screenerId: screener.id,
            status: status as any,
            score: score ? score.toString() : null,
            startedAt,
            completedAt,
            retryCount: status === 'FAILED' ? Math.floor(Math.random() * 3) : 0
          }
        })
        
        jobCount++
        console.log(`✅ Created scoring job: ${screener.name} -> ${submission.title} (${status})`)
        
        // If completed, update submission with the score
        if (status === 'COMPLETED' && score) {
          await prisma.submission.update({
            where: { id: submission.id },
            data: { 
              score: score.toString(),
              scoredBy: {
                push: screener.id
              }
            }
          })
        }
      }
    }
  }

  console.log(`✅ Created ${createdScreeners.length} screeners`)
  console.log(`✅ Created ${jobCount} scoring jobs`)
  console.log('🌱 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })