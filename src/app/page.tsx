'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'
import { formatRelativeTime } from '@/lib/utils'

interface User {
  id: string
  username: string
  avatar?: string
}

interface Tag {
  id: string
  name: string
}

interface Requirement {
  id: string
  title: string
  description: string
  budget: number | null
  deadline: string | null
  status: string
  createdAt: string
  user: User
  tags: Tag[]
  _count: {
    comments: number
    likes: number
  }
}

interface RequirementListResponse {
  items: Requirement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// 热门标签
const popularTags = [
  '前端开发',
  '后端开发',
  '移动应用',
  'UI设计',
  '小程序',
  '人工智能',
  '数据分析',
  '区块链',
]

// 平台数据
const platformStats = [
  { label: '已发布需求', value: '1000+' },
  { label: '注册开发者', value: '5000+' },
  { label: '成功案例', value: '800+' },
  { label: '平均响应', value: '2小时' },
]

export default function HomePage() {
  const router = useRouter()
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchLatestRequirements = async () => {
      try {
        const data = await apiClient.get<RequirementListResponse>(
          '/requirements?page=1&limit=6'
        )
        setRequirements(data.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取需求列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchLatestRequirements()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/requirements?search=${encodeURIComponent(searchQuery)}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return '招募中'
      case 'in_progress':
        return '进行中'
      case 'completed':
        return '已完成'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  return (
    <div className="bg-white">

      <div className="relative isolate">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              需求市场
              <span className="text-blue-600">连接创意与技术</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              在这里发布您的项目需求，或者寻找感兴趣的项目。我们致力于连接需求方和开发者，让每个创意都能找到最好的实现者。
            </p>
            <div className="mt-10">
              <form
                onSubmit={handleSearch}
                className="flex max-w-md mx-auto gap-x-4"
              >
                <input
                  type="text"
                  className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                  placeholder="搜索需求，例如：React开发..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  搜索
                </button>
              </form>
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/requirements/new"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                发布需求
              </Link>
              <Link
                href="/requirements"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                浏览需求 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 背景装饰 */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* 平台数据统计 */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-4">
            {platformStats.map(stat => (
              <div
                key={stat.label}
                className="mx-auto flex max-w-xs flex-col gap-y-4"
              >
                <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* 热门标签 */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-12">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <h2 className="text-lg font-semibold leading-8 text-gray-900">
            热门标签
          </h2>
          <div className="mt-6 flex flex-wrap gap-4">
            {popularTags.map(tag => (
              <Link
                key={tag}
                href={`/requirements?tag=${encodeURIComponent(tag)}`}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Latest requirements section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              最新需求
            </h2>
            <Link
              href="/requirements"
              className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500"
            >
              查看全部 <span aria-hidden="true">→</span>
            </Link>
          </div>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="mt-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : requirements.length === 0 ? (
            <div className="mt-10 text-center text-gray-500">暂无需求</div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {requirements.map(requirement => (
                <div
                  key={requirement.id}
                  className="group relative bg-white rounded-lg shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-gray-300 transition-all duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-x-4">
                      <time
                        dateTime={requirement.createdAt}
                        className="text-sm text-gray-500"
                      >
                        {formatRelativeTime(requirement.createdAt)}
                      </time>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                          requirement.status
                        )}`}
                      >
                        {getStatusText(requirement.status)}
                      </span>
                      {requirement.budget && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          ¥{requirement.budget}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-blue-600">
                      <Link href={`/requirements/${requirement.id}`}>
                        <span className="absolute inset-0" />
                        {requirement.title}
                      </Link>
                    </h3>
                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                      {requirement.description}
                    </p>
                    <div className="mt-6 flex items-center gap-x-4">
                      {requirement.user.avatar ? (
                        <img
                          src={requirement.user.avatar}
                          alt={requirement.user.username}
                          className="h-8 w-8 rounded-full bg-gray-50"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                          {requirement.user.username[0].toUpperCase()}
                        </div>
                      )}
                      <div className="text-sm leading-6">
                        <p className="font-semibold text-gray-900">
                          {requirement.user.username}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="mr-1.5 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        {requirement._count.comments}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg
                          className="mr-1.5 h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        {requirement._count.likes}
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {requirement.tags.map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 