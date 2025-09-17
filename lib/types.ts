
export interface User {
  id: string
  username: string | null
  email?: string | null
  walletAddress?: string | null
  image?: string | null
  isActive?: boolean
  isAdmin?: boolean
  acceptedTos?: boolean
  tosAcceptedAt?: Date | null
}

export interface BountyStatus {
  DRAFT: 'DRAFT'
  ACTIVE: 'ACTIVE'
  PAUSED: 'PAUSED'
  COMPLETED: 'COMPLETED'
  CANCELLED: 'CANCELLED'
}

export interface SubmissionStatus {
  PENDING: 'PENDING'
  SCORING: 'SCORING'
  APPROVED: 'APPROVED'
  REJECTED: 'REJECTED'
  WINNER: 'WINNER'
}

export interface SubmissionContentType {
  URL: 'URL'
  FILE: 'FILE'
  TEXT: 'TEXT'
  MIXED: 'MIXED'
}

export interface SuggestedBountyStatus {
  PENDING: 'PENDING'
  APPROVED: 'APPROVED'
  REJECTED: 'REJECTED'
}

export interface ScoringJobStatus {
  PENDING: 'PENDING'
  ASSIGNED: 'ASSIGNED'
  SCORING: 'SCORING'
  COMPLETED: 'COMPLETED'
  FAILED: 'FAILED'
  CANCELLED: 'CANCELLED'
}

export interface Screener {
  id: string
  name: string
  hotkey: string
  apiUrl: string
  isActive: boolean
  priority: number
  maxConcurrent: number
  currentJobs: number
  createdAt: Date
  updatedAt: Date
}

export interface ScoringJob {
  id: string
  submissionId: string
  screenerId: string
  status: keyof ScoringJobStatus
  score?: number
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  retryCount: number
  maxRetries: number
  createdAt: Date
  updatedAt: Date
  submission?: any
  screener?: Screener
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string | null
      email?: string | null
      walletAddress?: string | null
      image?: string | null
      isActive?: boolean
      isAdmin?: boolean
      acceptedTos?: boolean
      tosAcceptedAt?: Date | null
    }
  }

  interface User {
    id: string
    username: string | null
    email?: string | null
    walletAddress?: string | null
    isActive?: boolean
    isAdmin?: boolean
    acceptedTos?: boolean
    tosAcceptedAt?: Date | null
  }
}

export interface WinningSpot {
  id: string
  position: number
  reward: string
  rewardCap: string
  hotkey: string
  bountyId: string
}

export interface BountyWithWinningSpots {
  id: string
  title: string
  description: string
  requirements: string
  rewardDistribution: 'ALL_AT_ONCE' | 'OVER_TIME'
  winningSpots: number
  status: string
  deadline?: string
  createdAt: string
  submissionCount: number
  submissionDisclaimer?: string
  creator: {
    username: string
    walletAddress: string | null
  }
  categories?: Array<{
    name: string
    color?: string
  }>
  winningSpotConfigs: WinningSpot[]
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string | null
    email?: string | null
    walletAddress?: string | null
    isActive?: boolean
    isAdmin?: boolean
    acceptedTos?: boolean
    tosAcceptedAt?: Date | null
  }
}
