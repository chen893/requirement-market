export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  bio?: string
  location?: string
  website?: string
  skills?: string[]
}

export interface UserUpdateData {
  username?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  skills?: string[]
}

export interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
  passwordConfirmation: string
}
