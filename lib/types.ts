
export interface User {
  id: string
  username: string | null
  email?: string | null
  walletAddress?: string | null
  image?: string | null
  isActive?: boolean
  isAdmin?: boolean
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
  VALIDATING: 'VALIDATING'
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
    }
  }

  interface User {
    id: string
    username: string | null
    email?: string | null
    walletAddress?: string | null
    isActive?: boolean
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string | null
    email?: string | null
    walletAddress?: string | null
    isActive?: boolean
    isAdmin?: boolean
  }
}
