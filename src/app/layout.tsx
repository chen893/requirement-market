import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// import './styles/globals.css'
import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/auth'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '需求市场',
  description: '一个连接需求与开发者的平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
} 