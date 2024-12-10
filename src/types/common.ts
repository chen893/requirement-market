import { User } from './user'

export interface Tag {
  id: string
  name: string
}

export interface DateRange {
  start: string
  end: string
}

export interface FileUpload {
  id: string
  filename: string
  url: string
  size: number
  type: string
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  user: User
  createdAt: string
  updatedAt?: string
}

export interface Like {
  id: string
  userId: string
  requirementId: string
  createdAt: string
}
