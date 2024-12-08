import { SignJWT, jwtVerify } from 'jose'
import { nanoid } from 'nanoid'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

interface JWTPayload {
  userId: string
  email: string
  username: string
  iat?: number
  exp?: number
  jti?: string
}

export async function generateToken(user: any): Promise<string> {
  try {
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error('Error generating token:', error)
    throw error
  }
}

export async function validateToken(token: string): Promise<JWTPayload | null> {
  try {
    // 移除 Bearer 前缀
    const actualToken = token.replace('Bearer ', '')
    const { payload } = await jwtVerify(actualToken, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('Error validating token:', error)
    return null
  }
}

export async function getTokenData(token: string): Promise<JWTPayload | null> {
  try {
    const data = await validateToken(token)
    return data
  } catch (error) {
    console.error('Error getting token data:', error)
    return null
  }
} 