export interface User {
  id: number
  username: string
  email: string
  role: 'ADMIN' | 'HR'
  createdAt: string
}

export interface Candidate {
  id: number
  name: string
  email: string
  phone: string
  domain: string
  position: string
  expYears: number
  skills: string[]
  stack: string[]
  fileName: string
  cvJson: string
  uploadedAt: string
  uploadedBy: string
}

export interface JobDescription {
  id: number
  title: string
  field: string
  position: string
  requiredSkills: string[]
  minExpYears: number
  description: string
  createdAt: string
  createdBy: string
  matchResults: MatchResult[]
}

export interface MatchResult {
  id: number
  candidateId: number
  candidateName: string
  candidateEmail: string
  candidatePosition: string
  matchScore: number
  matchReasons: string[]
  gaps: string[]
  matchedAt: string
}

export interface ChatMessage {
  id: number
  role: 'HR' | 'ASSISTANT'
  message: string
  createdAt: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  type: string
  expires_in: number
}
