import { hash, compare } from 'bcryptjs'

// 加密密码
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12)
}

// 验证密码
export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await compare(password, hashedPassword)
}
