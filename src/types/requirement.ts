import type { User } from './user'
import type { Tag } from './common'

export interface Attachment {
  id: string
  filename: string
  url: string
}
;[]

export interface Requirement {
  id: string
  title: string
  description: string
  category: string
  tags: Tag[]
  budget?: number
  deadline?: string
  author: User
  status: RequirementStatus
  aiAnalysis?: AIAnalysis
  attachments: Attachment[]
  createdAt: string
  updatedAt: string
  user: User
  _count?: {
    comments: number
    likes: number
  }
}

export enum RequirementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ANALYZING = 'analyzing',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export interface AIAnalysis {
  id: string
  requirementId: string
  feasibility: string
  techStack: string[]
  timeline: string
  suggestions: string[]
  created_at: string
}

export interface RequirementFilters {
  category?: string
  tags?: string[]
  status?: RequirementStatus
  author?: string
  searchQuery?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface RequirementCreateData {
  title: string
  description: string
  category?: string
  tags?: string[]
  budget?: number
  deadline?: string
}

export interface RequirementUpdateData extends Partial<RequirementCreateData> {
  status?: RequirementStatus
}
