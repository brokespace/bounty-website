
export interface User {
  id: string
  hotkey: string
  username: string | null
  email?: string | null
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

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      hotkey: string
      username: string | null
      email?: string | null
      image?: string | null
      isActive?: boolean
      isAdmin?: boolean
    }
  }

  interface User {
    id: string
    hotkey: string
    username: string | null
    isActive?: boolean
    isAdmin?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    hotkey: string
    username: string | null
    isActive?: boolean
    isAdmin?: boolean
  }
}
